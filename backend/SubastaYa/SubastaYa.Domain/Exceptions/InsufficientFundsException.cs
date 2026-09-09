namespace SubastaYa.Domain.Exceptions;

public class InsufficientFundsException : Exception
{
    public int WalletId { get; }
    public decimal RequestedAmount { get; }
    public decimal AvailableBalance { get; }

    public InsufficientFundsException(int walletId, decimal requestedAmount, decimal availableBalance)
        : base($"Insufficient available balance in wallet {walletId}. Requested: {requestedAmount}, Available: {availableBalance}.")
    {
        WalletId = walletId;
        RequestedAmount = requestedAmount;
        AvailableBalance = availableBalance;
    }
}