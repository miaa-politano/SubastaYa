using Microsoft.EntityFrameworkCore;
using SubastaYa.Domain.Entities;
using SubastaYa.Domain.Exceptions;
using SubastaYa.Domain.Interfaces;
using SubastaYa.Infrastructure.Persistence;

namespace SubastaYa.Infrastructure.Services;

public class WalletService : IWalletService
{
    private readonly ApplicationDbContext _context;

    public WalletService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Wallet> GetWalletByUserIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        var wallet = await _context.Wallets
            .FirstOrDefaultAsync(w => w.UserId == userId, cancellationToken);

        if (wallet == null)
            throw new KeyNotFoundException($"Wallet for user {userId} was not found.");

        return wallet;
    }

    public async Task<bool> LockFundsAsync(int userId, decimal amount, string referenceType, int referenceId, CancellationToken cancellationToken = default)
    {
        var wallet = await GetWalletByUserIdAsync(userId, cancellationToken);

        wallet.LockFunds(amount);

        var ledgerEntry = new TransactionLedger
        {
            WalletId = wallet.Id,
            Amount = amount,
            Type = "Lock",
            Description = $"{referenceType}:{referenceId}",
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.TransactionLedgers.Add(ledgerEntry);

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new InvalidOperationException("Concurrent wallet modification detected. Please retry the operation.");
        }
    }

    public async Task<bool> UnlockFundsAsync(int userId, decimal amount, string referenceType, int referenceId, CancellationToken cancellationToken = default)
    {
        var wallet = await GetWalletByUserIdAsync(userId, cancellationToken);

        wallet.UnlockFunds(amount);

        var ledgerEntry = new TransactionLedger
        {
            WalletId = wallet.Id,
            Amount = amount,
            Type = "Release",
            Description = $"{referenceType}:{referenceId}",
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.TransactionLedgers.Add(ledgerEntry);

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new InvalidOperationException("Concurrent wallet modification detected. Please retry the operation.");
        }
    }

    public async Task<bool> DebitLockedFundsAsync(int userId, decimal amount, string referenceType, int referenceId, CancellationToken cancellationToken = default)
    {
        var wallet = await GetWalletByUserIdAsync(userId, cancellationToken);

        wallet.Debit(amount, fromLockedFunds: true);

        var ledgerEntry = new TransactionLedger
        {
            WalletId = wallet.Id,
            Amount = amount,
            Type = "Settlement",
            Description = $"{referenceType}:{referenceId}",
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.TransactionLedgers.Add(ledgerEntry);

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new InvalidOperationException("Concurrent wallet modification detected. Please retry the operation.");
        }
    }

    public async Task<bool> CreditFundsAsync(int userId, decimal amount, string description, CancellationToken cancellationToken = default)
    {
        var wallet = await GetWalletByUserIdAsync(userId, cancellationToken);

        wallet.Credit(amount);

        var ledgerEntry = new TransactionLedger
        {
            WalletId = wallet.Id,
            Amount = amount,
            Type = "Deposit",
            Description = description,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.TransactionLedgers.Add(ledgerEntry);

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new InvalidOperationException("Concurrent wallet modification detected. Please retry the operation.");
        }
    }
}