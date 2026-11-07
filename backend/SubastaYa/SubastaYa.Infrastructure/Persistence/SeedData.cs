using Microsoft.EntityFrameworkCore;
using SubastaYa.Domain.Constants;
using SubastaYa.Domain.Entities;

namespace SubastaYa.Infrastructure.Persistence;

/// <summary>
/// Small, idempotent development dataset. Production data is never seeded here.
/// </summary>
public static class SeedData
{
    public static async Task InitializeAsync(ApplicationDbContext db, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var users = new[]
        {
            new User { Email = "seller@subastaya.local", Name = "Seller Demo", PasswordHash = "seed-only" },
            new User { Email = "buyer.one@subastaya.local", Name = "Buyer One", PasswordHash = "seed-only" },
            new User { Email = "buyer.two@subastaya.local", Name = "Buyer Two", PasswordHash = "seed-only" },
            new User { Email = "observer@subastaya.local", Name = "Observer Demo", PasswordHash = "seed-only" }
        };

        foreach (var user in users)
        {
            var existing = await db.Users.SingleOrDefaultAsync(x => x.Email == user.Email, cancellationToken);
            if (existing == null) db.Users.Add(user);
        }

        var categories = new[]
        {
            new Category { Name = "Technology", Description = "Computers and electronics" },
            new Category { Name = "Home", Description = "Home and garden" },
            new Category { Name = "Collectibles", Description = "Collectible items" },
            new Category { Name = "Vehicles", Description = "Vehicles and accessories" }
        };

        foreach (var category in categories)
        {
            var existing = await db.Categories.SingleOrDefaultAsync(x => x.Name == category.Name, cancellationToken);
            if (existing == null) db.Categories.Add(category);
        }

        await db.SaveChangesAsync(cancellationToken);
        await EnsureWalletsAsync(db, cancellationToken);

        if (await db.Auctions.AnyAsync(cancellationToken)) return;

        var seller = await db.Users.SingleAsync(x => x.Email == "seller@subastaya.local", cancellationToken);
        var technology = await db.Categories.SingleAsync(x => x.Name == "Technology", cancellationToken);
        var home = await db.Categories.SingleAsync(x => x.Name == "Home", cancellationToken);
        var collectibles = await db.Categories.SingleAsync(x => x.Name == "Collectibles", cancellationToken);

        db.Auctions.AddRange(
            new Auction { SellerId = seller.Id, CategoryId = technology.Id, Title = "Laptop Demo", Description = "Active seeded auction", StartingPrice = 100, CurrentPrice = 100, MinIncrement = 10, StartDateUtc = now.AddMinutes(-10), EndDateUtc = now.AddHours(2), Status = AuctionStatuses.ACTIVE },
            new Auction { SellerId = seller.Id, CategoryId = home.Id, Title = "Desk Demo", Description = "Scheduled seeded auction", StartingPrice = 80, CurrentPrice = 80, MinIncrement = 5, StartDateUtc = now.AddHours(1), EndDateUtc = now.AddHours(3), Status = AuctionStatuses.SCHEDULED },
            new Auction { SellerId = seller.Id, CategoryId = collectibles.Id, Title = "Poster Demo", Description = "Finished seeded auction", StartingPrice = 40, CurrentPrice = 75, MinIncrement = 5, StartDateUtc = now.AddDays(-2), EndDateUtc = now.AddHours(-2), Status = AuctionStatuses.FINISHED },
            new Auction { SellerId = seller.Id, CategoryId = technology.Id, Title = "Keyboard Demo", Description = "No-sale seeded auction", StartingPrice = 25, CurrentPrice = 25, MinIncrement = 5, StartDateUtc = now.AddDays(-2), EndDateUtc = now.AddHours(-3), Status = AuctionStatuses.NO_SALE },
            new Auction { SellerId = seller.Id, CategoryId = home.Id, Title = "Lamp Demo", Description = "Second active seeded auction", StartingPrice = 30, CurrentPrice = 30, MinIncrement = 5, StartDateUtc = now.AddMinutes(-5), EndDateUtc = now.AddHours(1), Status = AuctionStatuses.ACTIVE }
        );

        await db.SaveChangesAsync(cancellationToken);

        var buyer = await db.Users.SingleAsync(x => x.Email == "buyer.one@subastaya.local", cancellationToken);
        var finishedAuction = await db.Auctions.SingleAsync(x => x.Title == "Poster Demo", cancellationToken);
        var buyerWallet = await db.Wallets.SingleAsync(x => x.UserId == buyer.Id, cancellationToken);
        buyerWallet.LockedBalance = 75;
        buyerWallet.AvailableBalance = buyerWallet.TotalBalance - buyerWallet.LockedBalance;
        finishedAuction.CurrentWinnerId = buyer.Id;
        db.Bids.Add(new Bid { AuctionId = finishedAuction.Id, BidderId = buyer.Id, Amount = 75, CreatedAtUtc = now.AddHours(-3) });
        db.TransactionLedgers.Add(new TransactionLedger
        {
            WalletId = buyerWallet.Id,
            Amount = 75,
            Type = "Lock",
            Description = $"Seed bid for auction {finishedAuction.Id}",
            CreatedAtUtc = now.AddHours(-3)
        });
        await db.SaveChangesAsync(cancellationToken);
    }

    private static async Task EnsureWalletsAsync(ApplicationDbContext db, CancellationToken cancellationToken)
    {
        var users = await db.Users.ToListAsync(cancellationToken);
        foreach (var user in users)
        {
            if (await db.Wallets.AnyAsync(x => x.UserId == user.Id, cancellationToken)) continue;
            db.Wallets.Add(new Wallet
            {
                UserId = user.Id,
                TotalBalance = user.Email.StartsWith("buyer", StringComparison.OrdinalIgnoreCase) ? 1000 : 0,
                LockedBalance = 0,
                AvailableBalance = user.Email.StartsWith("buyer", StringComparison.OrdinalIgnoreCase) ? 1000 : 0
            });
        }

        await db.SaveChangesAsync(cancellationToken);
    }
}
