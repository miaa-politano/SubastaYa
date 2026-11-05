using Npgsql;

namespace SubastaYa.Api.Events;

public sealed class OutboxEventSignalListener : BackgroundService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<OutboxEventSignalListener> _logger;

    public OutboxEventSignalListener(
        IConfiguration configuration,
        ILogger<OutboxEventSignalListener> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        string connectionString = _configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection is not configured.");

        await using NpgsqlConnection connection = new(connectionString);
        connection.Notification += (_, notification) =>
            _logger.LogDebug("Outbox notification received for event {EventId}.", notification.Payload);
        await connection.OpenAsync(stoppingToken);
        await using (NpgsqlCommand command = new("LISTEN subastaya_outbox;", connection))
        {
            await command.ExecuteNonQueryAsync(stoppingToken);
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            await connection.WaitAsync(stoppingToken);
        }
    }
}
