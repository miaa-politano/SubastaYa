using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SubastaYa.Domain.Entities;

namespace SubastaYa.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("USER");
        builder.HasKey(u => u.Id);

        builder.Property(u => u.Id).HasColumnName("ID");
        builder.Property(u => u.Email).HasColumnName("EMAIL").HasMaxLength(150).IsRequired();
        builder.HasIndex(u => u.Email).IsUnique();

        builder.Property(u => u.Name).HasColumnName("NAME").HasMaxLength(100).IsRequired();
        builder.Property(u => u.PasswordHash).HasColumnName("PASSWORD_HASH").HasMaxLength(255).IsRequired();
        builder.Property(u => u.CreatedAtUtc).HasColumnName("CREATED_AT").IsRequired();

        builder.HasOne(u => u.Wallet)
            .WithOne(w => w.User)
            .HasForeignKey<Wallet>(w => w.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}