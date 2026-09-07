using Microsoft.EntityFrameworkCore;
using SubastaYa.Domain.Entities;

namespace SubastaYa.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Wallet> Wallets => Set<Wallet>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Map USER table strictly in uppercase
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("USER");
            entity.HasKey(u => u.Id);

            entity.Property(u => u.Id).HasColumnName("ID");
            entity.Property(u => u.Email).HasColumnName("EMAIL").HasMaxLength(150).IsRequired();
            entity.HasIndex(u => u.Email).IsUnique();

            entity.Property(u => u.Name).HasColumnName("NAME").HasMaxLength(100).IsRequired();
            entity.Property(u => u.PasswordHash).HasColumnName("PASSWORD_HASH").HasMaxLength(255).IsRequired();
            entity.Property(u => u.CreatedAtUtc).HasColumnName("CREATED_AT").IsRequired();

            // 1:1 relationship with WALLET
            entity.HasOne(u => u.Wallet)
                  .WithOne(w => w.User)
                  .HasForeignKey<Wallet>(w => w.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Map WALLET table strictly in uppercase
        modelBuilder.Entity<Wallet>(entity =>
        {
            entity.ToTable("WALLET");
            entity.HasKey(w => w.Id);

            entity.Property(w => w.Id).HasColumnName("ID");
            entity.Property(w => w.UserId).HasColumnName("USER_ID").IsRequired();
            entity.Property(w => w.TotalBalance).HasColumnName("TOTAL_BALANCE").HasPrecision(18, 2).IsRequired();
            entity.Property(w => w.LockedBalance).HasColumnName("LOCKED_BALANCE").HasPrecision(18, 2).IsRequired();
            entity.Property(w => w.AvailableBalance).HasColumnName("AVAILABLE_BALANCE").HasPrecision(18, 2).IsRequired();

            // Optimistic Concurrency Token
            entity.Property(w => w.Version)
                  .HasColumnName("VERSION")
                  .IsRowVersion();
        });
    }
}