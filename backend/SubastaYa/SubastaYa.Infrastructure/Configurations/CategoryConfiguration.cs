using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SubastaYa.Domain.Entities;

namespace SubastaYa.Infrastructure.Persistence.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("CATEGORY");
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Id).HasColumnName("ID");
        builder.Property(c => c.Name).HasColumnName("NAME").HasMaxLength(100).IsRequired();
        builder.Property(c => c.Description).HasColumnName("DESCRIPTION").HasMaxLength(255);
    }
}