namespace SubastaYa.Domain.Entities;

public class Wallet
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public decimal TotalBalance { get; set; }
    public decimal LockedBalance { get; set; }
    public decimal AvailableBalance { get; set; }

    // Concurrency Token for Optimistic Locking (RNF1.1)
    public uint Version { get; set; }

    // Navigation property
    public User? User { get; set; }
}