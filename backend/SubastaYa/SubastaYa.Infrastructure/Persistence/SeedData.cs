using Microsoft.EntityFrameworkCore;
using SubastaYa.Domain.Constants;
using SubastaYa.Domain.Entities;

namespace SubastaYa.Infrastructure.Persistence;

/// <summary>
/// Initializes database seed data.
/// </summary>
public static class SeedData
{
    public static async Task InitializeAsync(ApplicationDbContext db, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var users = new[]
        {
            new User { Email = "vendedor@test.com", Name = "Vendedor Demo", PasswordHash = "seed-only" },
            new User { Email = "comprador1@test.com", Name = "Comprador Uno", PasswordHash = "seed-only" },
            new User { Email = "comprador2@test.com", Name = "Comprador Dos", PasswordHash = "seed-only" },
            new User { Email = "sinfondos@test.com", Name = "Usuario Sin Fondos", PasswordHash = "seed-only" }
        };

        foreach (var user in users)
        {
            var existing = await db.Users.SingleOrDefaultAsync(x => x.Email == user.Email, cancellationToken);
            if (existing == null) db.Users.Add(user);
        }

        await db.SaveChangesAsync(cancellationToken);

        var categories = new[]
        {
            new Category { Name = "Tecnología", Description = "Artículos tecnológicos y dispositivos" },
            new Category { Name = "Coleccionables", Description = "Artículos de colección y rarezas" },
            new Category { Name = "Indumentaria", Description = "Ropa, calzado y accesorios" },
            new Category { Name = "Vehículos", Description = "Vehículos y accesorios motorizados" }
        };

        foreach (var category in categories)
        {
            var existing = await db.Categories.SingleOrDefaultAsync(x => x.Name == category.Name, cancellationToken);
            if (existing == null) db.Categories.Add(category);
        }

        await db.SaveChangesAsync(cancellationToken);

        await EnsureWalletsAsync(db, cancellationToken);

        if (await db.Auctions.AnyAsync(cancellationToken)) return;

        var seller = await db.Users.SingleAsync(x => x.Email == "vendedor@test.com", cancellationToken);
        var buyer1 = await db.Users.SingleAsync(x => x.Email == "comprador1@test.com", cancellationToken);

        var tecnologia = await db.Categories.SingleAsync(x => x.Name == "Tecnología", cancellationToken);
        var coleccionables = await db.Categories.SingleAsync(x => x.Name == "Coleccionables", cancellationToken);
        var indumentaria = await db.Categories.SingleAsync(x => x.Name == "Indumentaria", cancellationToken);
        var vehiculos = await db.Categories.SingleAsync(x => x.Name == "Vehículos", cancellationToken);

        db.Auctions.AddRange(
            new Auction
            {
                SellerId = seller.Id,
                CategoryId = tecnologia.Id,
                Title = "Smartphone Activa Estándar",
                Description = "Subasta activa con pujas previas",
                StartingPrice = 20000,
                CurrentPrice = 45000,
                MinIncrement = 5000,
                StartDateUtc = now.AddMinutes(-30),
                EndDateUtc = now.AddMinutes(25),
                Status = AuctionStatuses.ACTIVE,
                CurrentWinnerId = buyer1.Id
            },
            new Auction
            {
                SellerId = seller.Id,
                CategoryId = coleccionables.Id,
                Title = "Reloj Antiguo Activo Crítico",
                Description = "Subasta a punto de expirar para probar anti-sniping",
                StartingPrice = 10000,
                CurrentPrice = 10000,
                MinIncrement = 2000,
                StartDateUtc = now.AddMinutes(-58),
                EndDateUtc = now.AddSeconds(90),
                Status = AuctionStatuses.ACTIVE
            },
            new Auction
            {
                SellerId = seller.Id,
                CategoryId = vehiculos.Id,
                Title = "Casco de Moto Próximo",
                Description = "Subasta programada para el día de mañana",
                StartingPrice = 15000,
                CurrentPrice = 15000,
                MinIncrement = 1000,
                StartDateUtc = now.AddHours(24),
                EndDateUtc = now.AddHours(48),
                Status = AuctionStatuses.SCHEDULED
            },
            new Auction
            {
                SellerId = seller.Id,
                CategoryId = indumentaria.Id,
                Title = "Campera de Cuero Vencida Ganada",
                Description = "Subasta finalizada con adjudicación pendiente de worker",
                StartingPrice = 30000,
                CurrentPrice = 50000,
                MinIncrement = 5000,
                StartDateUtc = now.AddDays(-2),
                EndDateUtc = now.AddHours(-3),
                Status = AuctionStatuses.FINISHED,
                CurrentWinnerId = buyer1.Id
            },
            new Auction
            {
                SellerId = seller.Id,
                CategoryId = tecnologia.Id,
                Title = "Teclado Antiguo Desierto",
                Description = "Subasta finalizada sin ofertas registradas",
                StartingPrice = 5000,
                CurrentPrice = 5000,
                MinIncrement = 500,
                StartDateUtc = now.AddDays(-3),
                EndDateUtc = now.AddHours(-5),
                Status = AuctionStatuses.NO_SALE
            }
        );

        await db.SaveChangesAsync(cancellationToken);

        var activeStandardAuction = await db.Auctions.SingleAsync(x => x.Title == "Smartphone Activa Estándar", cancellationToken);
        var buyerWallet = await db.Wallets.SingleAsync(x => x.UserId == buyer1.Id, cancellationToken);

        db.Bids.AddRange(
            new Bid { AuctionId = activeStandardAuction.Id, BidderId = buyer1.Id, Amount = 30000, CreatedAtUtc = now.AddMinutes(-20) },
            new Bid { AuctionId = activeStandardAuction.Id, BidderId = buyer1.Id, Amount = 45000, CreatedAtUtc = now.AddMinutes(-10) }
        );

        db.TransactionLedgers.AddRange(
            new TransactionLedger
            {
                WalletId = buyerWallet.Id,
                Amount = 150000,
                Type = "Deposit",
                Description = "Depósito inicial simulado",
                CreatedAtUtc = now.AddDays(-1)
            },
            new TransactionLedger
            {
                WalletId = buyerWallet.Id,
                Amount = 45000,
                Type = "Lock",
                Description = $"Retención en garantía por puja en subasta {activeStandardAuction.Id}",
                CreatedAtUtc = now.AddMinutes(-10)
            }
        );

        await db.SaveChangesAsync(cancellationToken);
    }

    private static async Task EnsureWalletsAsync(ApplicationDbContext db, CancellationToken cancellationToken)
    {
        var users = await db.Users.ToListAsync(cancellationToken);
        foreach (var user in users)
        {
            if (await db.Wallets.AnyAsync(x => x.UserId == user.Id, cancellationToken)) continue;

            decimal total = 0;
            decimal locked = 0;

            if (user.Email == "vendedor@test.com")
            {
                total = 0;
                locked = 0;
            }
            else if (user.Email == "comprador1@test.com")
            {
                total = 150000;
                locked = 45000;
            }
            else if (user.Email == "comprador2@test.com")
            {
                total = 200000;
                locked = 0;
            }
            else if (user.Email == "sinfondos@test.com")
            {
                total = 500;
                locked = 0;
            }

            db.Wallets.Add(new Wallet
            {
                UserId = user.Id,
                TotalBalance = total,
                LockedBalance = locked,
                AvailableBalance = total - locked
            });
        }

        await db.SaveChangesAsync(cancellationToken);
    }
}