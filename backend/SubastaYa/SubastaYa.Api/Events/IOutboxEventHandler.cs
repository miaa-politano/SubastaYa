namespace SubastaYa.Api.Events;

public interface IOutboxEventHandler
{
    Task HandleAsync(OutboxEventRecord outboxEvent, CancellationToken cancellationToken);
}
