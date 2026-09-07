namespace SubastaYa.Domain.Entities;

public class TransactionLedger
{
    public int Id { get; set; }
    public int WalletId { get; set; }
    public decimal Amount { get; set; }
    public string Type { get; set; } = string.Empty; // Deposit, Lock, Release, Settlement
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Wallet? Wallet { get; set; }
}