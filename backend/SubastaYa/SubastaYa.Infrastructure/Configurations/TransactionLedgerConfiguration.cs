using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SubastaYa.Domain.Entities;

namespace SubastaYa.Infrastructure.Persistence.Configurations;

public class TransactionLedgerConfiguration : IEntityTypeConfiguration<TransactionLedger>
{
    public void Configure(EntityTypeBuilder<TransactionLedger> builder)
    {
        builder.ToTable("TRANSACTION_LEDGER");
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Id).HasColumnName("ID");
        builder.Property(t => t.WalletId).HasColumnName("WALLET_ID").IsRequired();
        builder.Property(t => t.Amount).HasColumnName("AMOUNT").HasPrecision(18, 2).IsRequired();
        builder.Property(t => t.Type).HasColumnName("TYPE").HasMaxLength(50).IsRequired();
        builder.Property(t => t.Description).HasColumnName("DESCRIPTION").HasMaxLength(255);
        builder.Property(t => t.CreatedAtUtc).HasColumnName("CREATED_AT").IsRequired();

        builder.HasOne(t => t.Wallet)
            .WithMany()
            .HasForeignKey(t => t.WalletId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}