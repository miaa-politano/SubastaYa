using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SubastaYa.Domain.Entities;

namespace SubastaYa.Infrastructure.Persistence.Configurations;

public class AuctionConfiguration : IEntityTypeConfiguration<Auction>
{
    public void Configure(EntityTypeBuilder<Auction> builder)
    {
        builder.ToTable("AUCTION");
        builder.HasKey(a => a.Id);

        builder.Property(a => a.Id).HasColumnName("ID");
        builder.Property(a => a.SellerId).HasColumnName("SELLER_ID").IsRequired();
        builder.Property(a => a.CategoryId).HasColumnName("CATEGORY_ID").IsRequired();
        builder.Property(a => a.Title).HasColumnName("TITLE").HasMaxLength(200).IsRequired();
        builder.Property(a => a.Description).HasColumnName("DESCRIPTION").HasMaxLength(1000);
        builder.Property(a => a.StartingPrice).HasColumnName("STARTING_PRICE").HasPrecision(18, 2).IsRequired();
        builder.Property(a => a.CurrentPrice).HasColumnName("CURRENT_PRICE").HasPrecision(18, 2).IsRequired();
        builder.Property(a => a.StartDateUtc).HasColumnName("START_DATE").IsRequired();
        builder.Property(a => a.EndDateUtc).HasColumnName("END_DATE").IsRequired();
        builder.Property(a => a.Status).HasColumnName("STATUS").HasMaxLength(50).IsRequired();

        builder.Property(a => a.Version)
            .HasColumnName("VERSION")
            .IsRowVersion();

        builder.HasOne(a => a.Seller)
            .WithMany()
            .HasForeignKey(a => a.SellerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Category)
            .WithMany(c => c.Auctions)
            .HasForeignKey(a => a.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}