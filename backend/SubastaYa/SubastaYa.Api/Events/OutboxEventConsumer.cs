using System.Data.Common;
using Microsoft.EntityFrameworkCore;
using SubastaYa.Infrastructure.Persistence;

namespace SubastaYa.Api.Events;

public sealed class OutboxEventConsumer : BackgroundService
{
    private const int BatchSize = 20;
    private const int MaxRetries = 5;
    private static readonly TimeSpan PollInterval = TimeSpan.FromSeconds(1);
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<OutboxEventConsumer> _logger;

    public OutboxEventConsumer(
        IServiceScopeFactory scopeFactory,
        ILogger<OutboxEventConsumer> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ConsumeBatchAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "Outbox polling cycle failed.");
            }

            await Task.Delay(PollInterval, stoppingToken);
        }
    }

    private async Task ConsumeBatchAsync(CancellationToken cancellationToken)
    {
        using IServiceScope scope = _scopeFactory.CreateScope();
        ApplicationDbContext dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        IOutboxEventHandler handler = scope.ServiceProvider.GetRequiredService<IOutboxEventHandler>();
        DbConnection connection = dbContext.Database.GetDbConnection();
        await connection.OpenAsync(cancellationToken);

        await RequeueExpiredProcessingEventsAsync(connection, cancellationToken);
        List<OutboxEventRecord> events = await ReadPendingEventsAsync(connection, cancellationToken);
        foreach (OutboxEventRecord outboxEvent in events)
        {
            if (!await TryStartProcessingAsync(connection, outboxEvent.Id, cancellationToken))
            {
                continue;
            }

            try
            {
                await handler.HandleAsync(outboxEvent, cancellationToken);
                await MarkProcessedAsync(connection, outboxEvent.Id, cancellationToken);
            }
            catch (Exception exception) when (exception is not OperationCanceledException)
            {
                await MarkFailedAsync(connection, outboxEvent.Id, exception, cancellationToken);
                _logger.LogError(exception, "Outbox event {EventId} failed.", outboxEvent.Id);
            }
        }
    }

    private static async Task<List<OutboxEventRecord>> ReadPendingEventsAsync(
        DbConnection connection,
        CancellationToken cancellationToken)
    {
        await using DbCommand command = connection.CreateCommand();
        command.CommandText = """
            SELECT "ID", "EVENT_TYPE", "AGGREGATE_TYPE", "AGGREGATE_ID", "PAYLOAD", "RETRY_COUNT"
            FROM "OUTBOX_EVENT"
            WHERE "STATUS" = 'PENDING' OR ("STATUS" = 'FAILED' AND "RETRY_COUNT" < @maxRetries)
            ORDER BY "CREATED_AT_UTC", "ID"
            LIMIT @batchSize
            """;
        AddParameter(command, "batchSize", BatchSize);
        AddParameter(command, "maxRetries", MaxRetries);
        await using DbDataReader reader = await command.ExecuteReaderAsync(cancellationToken);
        List<OutboxEventRecord> events = [];
        while (await reader.ReadAsync(cancellationToken))
        {
            events.Add(new OutboxEventRecord(
                reader.GetInt64(0),
                reader.GetString(1),
                reader.GetString(2),
                reader.IsDBNull(3) ? null : reader.GetInt32(3),
                reader.GetString(4),
                reader.GetInt32(5)));
        }

        return events;
    }

    private static async Task<bool> TryStartProcessingAsync(
        DbConnection connection,
        long eventId,
        CancellationToken cancellationToken)
    {
        await using DbCommand command = connection.CreateCommand();
        command.CommandText = "UPDATE \"OUTBOX_EVENT\" SET \"STATUS\" = 'PROCESSING', \"PROCESSING_AT_UTC\" = CURRENT_TIMESTAMP WHERE \"ID\" = @eventId AND (\"STATUS\" = 'PENDING' OR (\"STATUS\" = 'FAILED' AND \"RETRY_COUNT\" < @maxRetries))";
        AddParameter(command, "eventId", eventId);
        AddParameter(command, "maxRetries", MaxRetries);
        return await command.ExecuteNonQueryAsync(cancellationToken) == 1;
    }

    private static async Task MarkProcessedAsync(
        DbConnection connection,
        long eventId,
        CancellationToken cancellationToken)
    {
        await using DbCommand command = connection.CreateCommand();
        command.CommandText = "UPDATE \"OUTBOX_EVENT\" SET \"STATUS\" = 'PROCESSED', \"PROCESSED_AT_UTC\" = CURRENT_TIMESTAMP, \"PROCESSING_AT_UTC\" = NULL WHERE \"ID\" = @eventId AND \"STATUS\" = 'PROCESSING'";
        AddParameter(command, "eventId", eventId);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    private static async Task MarkFailedAsync(
        DbConnection connection,
        long eventId,
        Exception exception,
        CancellationToken cancellationToken)
    {
        await using DbCommand command = connection.CreateCommand();
        command.CommandText = "UPDATE \"OUTBOX_EVENT\" SET \"STATUS\" = CASE WHEN \"RETRY_COUNT\" + 1 >= @maxRetries THEN 'FAILED' ELSE 'PENDING' END, \"RETRY_COUNT\" = \"RETRY_COUNT\" + 1, \"PROCESSING_AT_UTC\" = NULL, \"LAST_ERROR\" = @error WHERE \"ID\" = @eventId AND \"STATUS\" = 'PROCESSING'";
        AddParameter(command, "eventId", eventId);
        AddParameter(command, "maxRetries", MaxRetries);
        AddParameter(command, "error", exception.Message[..Math.Min(exception.Message.Length, 2000)]);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    private static async Task RequeueExpiredProcessingEventsAsync(
        DbConnection connection,
        CancellationToken cancellationToken)
    {
        await using DbCommand command = connection.CreateCommand();
        command.CommandText = "UPDATE \"OUTBOX_EVENT\" SET \"STATUS\" = 'PENDING', \"PROCESSING_AT_UTC\" = NULL WHERE \"STATUS\" = 'PROCESSING' AND \"PROCESSING_AT_UTC\" < CURRENT_TIMESTAMP - INTERVAL '5 minutes' AND \"RETRY_COUNT\" < @maxRetries";
        AddParameter(command, "maxRetries", MaxRetries);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    private static void AddParameter(DbCommand command, string name, object value)
    {
        DbParameter parameter = command.CreateParameter();
        parameter.ParameterName = name;
        parameter.Value = value;
        command.Parameters.Add(parameter);
    }
}
