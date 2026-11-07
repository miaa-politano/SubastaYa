using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SubastaYa.Domain.Entities;

[Table("OUTBOX_EVENT")]
public class OutboxEvent
{
    [Key]
    [Column("ID")]
    public long Id { get; set; }

    [Column("EVENT_ID")]
    public Guid EventId { get; set; }

    [Column("EVENT_TYPE")]
    public string EventType { get; set; } = string.Empty;

    [Column("AGGREGATE_ID")]
    public long AggregateId { get; set; }

    [Column("PAYLOAD_JSON")]
    public string PayloadJson { get; set; } = string.Empty;

    [Column("STATUS")]
    public string Status { get; set; } = "PENDING";

    [Column("ATTEMPTS")]
    public int Attempts { get; set; }

    [Column("NEXT_ATTEMPT_AT")]
    public DateTime NextAttemptAt { get; set; }

    [Column("CREATED_AT_UTC")]
    public DateTime CreatedAtUtc { get; set; }

    [Column("SENT_AT_UTC")]
    public DateTime? SentAtUtc { get; set; }

    [Column("LAST_ERROR")]
    public string? LastError { get; set; }
}
