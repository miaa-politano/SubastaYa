using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SubastaYa.Domain.Entities;

namespace SubastaYa.Infrastructure.Persistence.Configurations;

public class WalletConfiguration : IEntityTypeConfiguration<Wallet>
{
    public void Configure(EntityTypeBuilder<Wallet> builder)
    {
        builder.ToTable("WALLET");
        builder.HasKey(w => w.Id);

        builder.Property(w => w.Id).HasColumnName("ID");
        builder.Property(w => w.UserId).HasColumnName("USER_ID").IsRequired();
        builder.Property(w => w.TotalBalance).HasColumnName("TOTAL_BALANCE").HasPrecision(18, 2).IsRequired();
        builder.Property(w => w.LockedBalance).HasColumnName("LOCKED_BALANCE").HasPrecision(18, 2).IsRequired();
        builder.Property(w => w.AvailableBalance).HasColumnName("AVAILABLE_BALANCE").HasPrecision(18, 2).IsRequired();

        builder.Property(w => w.Version)
            .HasColumnName("VERSION")
            .IsRowVersion();
    }
}