using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SubastaYa.Domain.Entities;

namespace SubastaYa.Infrastructure.Persistence.Configurations;

public class OutboxEventConfiguration : IEntityTypeConfiguration<OutboxEvent>
{
    public void Configure(EntityTypeBuilder<OutboxEvent> builder)
    {
        builder.ToTable("OUTBOX_EVENT");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("ID")
            .UseIdentityByDefaultColumn();

        builder.Property(x => x.EventId)
            .HasColumnName("EVENT_ID")
            .IsRequired();

        builder.HasIndex(x => x.EventId).IsUnique();

        builder.Property(x => x.EventType)
            .HasColumnName("EVENT_TYPE")
            .HasMaxLength(32)
            .IsRequired();

        builder.Property(x => x.AggregateId)
            .HasColumnName("AGGREGATE_ID")
            .IsRequired();

        builder.Property(x => x.PayloadJson)
            .HasColumnName("PAYLOAD_JSON")
            .HasColumnType("text")
            .IsRequired();

        builder.Property(x => x.Status)
            .HasColumnName("STATUS")
            .HasMaxLength(16)
            .IsRequired();

        builder.Property(x => x.Attempts)
            .HasColumnName("ATTEMPTS")
            .HasDefaultValue(0)
            .IsRequired();

        builder.Property(x => x.NextAttemptAt)
            .HasColumnName("NEXT_ATTEMPT_AT")
            .IsRequired();

        builder.Property(x => x.CreatedAtUtc)
            .HasColumnName("CREATED_AT_UTC")
            .IsRequired();

        builder.Property(x => x.SentAtUtc)
            .HasColumnName("SENT_AT_UTC");

        builder.Property(x => x.LastError)
            .HasColumnName("LAST_ERROR")
            .HasMaxLength(1000);
    }
}
