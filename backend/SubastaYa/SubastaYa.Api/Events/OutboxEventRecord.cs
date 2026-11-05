namespace SubastaYa.Api.Events;

public sealed record OutboxEventRecord(
    long Id,
    string EventType,
    string AggregateType,
    int? AggregateId,
    string Payload,
    int RetryCount);
