using System.Text.Json;

namespace SubastaYa.Api.Events;

public sealed class OutboxEventHandler : IOutboxEventHandler
{
    private readonly ILogger<OutboxEventHandler> _logger;

    public OutboxEventHandler(ILogger<OutboxEventHandler> logger)
    {
        _logger = logger;
    }

    public Task HandleAsync(OutboxEventRecord outboxEvent, CancellationToken cancellationToken)
    {
        using JsonDocument document = JsonDocument.Parse(outboxEvent.Payload);
        _logger.LogInformation(
            "Outbox event consumed. Id: {EventId}, Type: {EventType}, Aggregate: {AggregateType}/{AggregateId}, Payload: {Payload}",
            outboxEvent.Id,
            outboxEvent.EventType,
            outboxEvent.AggregateType,
            outboxEvent.AggregateId,
            document.RootElement.ToString());
        return Task.CompletedTask;
    }
}
