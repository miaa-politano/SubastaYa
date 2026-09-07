using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SubastaYa.Domain.Entities;

namespace SubastaYa.Infrastructure.Persistence.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("AUDIT_LOG");
        builder.HasKey(al => al.Id);

        builder.Property(al => al.Id).HasColumnName("ID");
        builder.Property(al => al.Action).HasColumnName("ACTION").HasMaxLength(100).IsRequired();
        builder.Property(al => al.PerformedBy).HasColumnName("PERFORMED_BY").HasMaxLength(150).IsRequired();
        builder.Property(al => al.Details).HasColumnName("DETAILS").HasMaxLength(1000);
        builder.Property(al => al.TimestampUtc).HasColumnName("TIMESTAMP").IsRequired();
    }
}