using SubastaYa.Domain.Entities;

namespace SubastaYa.Domain.Interfaces;

public interface IWalletService
{
    Task<Wallet> GetWalletByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task<bool> LockFundsAsync(int userId, decimal amount, string referenceType, int referenceId, CancellationToken cancellationToken = default);
    Task<bool> UnlockFundsAsync(int userId, decimal amount, string referenceType, int referenceId, CancellationToken cancellationToken = default);
    Task<bool> DebitLockedFundsAsync(int userId, decimal amount, string referenceType, int referenceId, CancellationToken cancellationToken = default);
    Task<bool> CreditFundsAsync(int userId, decimal amount, string description, CancellationToken cancellationToken = default);
}