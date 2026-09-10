using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace SubastaYa.Domain.Entities;

[Table("TRANSACTION_LEDGER")]
public class TransactionLedger
{
    [Key]
    [Column("ID")]
    public int Id { get; set; }

    [Column("WALLET_ID")]
    public int WalletId { get; set; }

    [Column("AMOUNT")]
    public decimal Amount { get; set; }

    [Column("TYPE")]
    public string Type { get; set; } = string.Empty;

    [Column("DESCRIPTION")]
    public string Description { get; set; } = string.Empty;

    [Column("CREATED_AT_UTC")]
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public Wallet? Wallet { get; set; }
}
