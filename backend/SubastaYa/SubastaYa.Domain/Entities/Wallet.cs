using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using SubastaYa.Domain.Exceptions;

namespace SubastaYa.Domain.Entities;

[Table("WALLET")]
public class Wallet
{
    [Key]
    [Column("ID")]
    public int Id { get; set; }

    [Column("USER_ID")]
    public int UserId { get; set; }

    [Column("TOTAL_BALANCE")]
    public decimal TotalBalance { get; set; }

    [Column("LOCKED_BALANCE")]
    public decimal LockedBalance { get; set; }

    [Column("AVAILABLE_BALANCE")]
    public decimal AvailableBalance { get; set; }

    [ConcurrencyCheck]
    [Column("VERSION")]
    public uint Version { get; set; }

    public User? User { get; set; }

    private void RecalculateAvailableBalance()
    {
        AvailableBalance = TotalBalance - LockedBalance;
    }

    public void LockFunds(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount to lock must be greater than zero.", nameof(amount));

        if (AvailableBalance < amount)
            throw new InsufficientFundsException(Id, amount, AvailableBalance);

        LockedBalance += amount;
        RecalculateAvailableBalance();
    }

    public void UnlockFunds(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount to unlock must be greater than zero.", nameof(amount));

        if (LockedBalance < amount)
            throw new InvalidOperationException("Cannot unlock more funds than currently locked.");

        LockedBalance -= amount;
        RecalculateAvailableBalance();
    }

    public void Debit(decimal amount, bool fromLockedFunds = false)
    {
        if (amount <= 0)
            throw new ArgumentException("Debit amount must be greater than zero.", nameof(amount));

        if (fromLockedFunds)
        {
            if (LockedBalance < amount || TotalBalance < amount)
                throw new InvalidOperationException("Insufficient locked balance to finalize debit.");

            LockedBalance -= amount;
            TotalBalance -= amount;
        }
        else
        {
            if (AvailableBalance < amount)
                throw new InsufficientFundsException(Id, amount, AvailableBalance);

            TotalBalance -= amount;
        }

        RecalculateAvailableBalance();
    }

    public void Credit(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Credit amount must be greater than zero.", nameof(amount));

        TotalBalance += amount;
        RecalculateAvailableBalance();
    }
}