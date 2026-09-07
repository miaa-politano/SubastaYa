using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SubastaYa.Domain.Entities;

namespace SubastaYa.Infrastructure.Persistence.Configurations;

public class BidConfiguration : IEntityTypeConfiguration<Bid>
{
    public void Configure(EntityTypeBuilder<Bid> builder)
    {
        builder.ToTable("BID");
        builder.HasKey(b => b.Id);

        builder.Property(b => b.Id).HasColumnName("ID");
        builder.Property(b => b.AuctionId).HasColumnName("AUCTION_ID").IsRequired();
        builder.Property(b => b.BidderId).HasColumnName("BIDDER_ID").IsRequired();
        builder.Property(b => b.Amount).HasColumnName("AMOUNT").HasPrecision(18, 2).IsRequired();
        builder.Property(b => b.CreatedAtUtc).HasColumnName("CREATED_AT").IsRequired();

        builder.HasOne(b => b.Auction)
            .WithMany(a => a.Bids)
            .HasForeignKey(b => b.AuctionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(b => b.Bidder)
            .WithMany()
            .HasForeignKey(b => b.BidderId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}