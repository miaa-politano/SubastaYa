using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using SubastaYa.Domain.Exceptions;

namespace SubastaYa.Domain.Entities;

[Table("AUCTION")]
public class Auction
{
    [Key]
    [Column("ID")]
    public int Id { get; set; }

    [Column("SELLER_ID")]
    public int SellerId { get; set; }

    [Column("CURRENT_WINNER_ID")]
    public int? CurrentWinnerId { get; set; }

    [Column("CATEGORY_ID")]
    public int CategoryId { get; set; }

    [Column("TITLE")]
    public string Title { get; set; } = string.Empty;

    [Column("DESCRIPTION")]
    public string Description { get; set; } = string.Empty;

    [Column("STARTING_PRICE")]
    public decimal StartingPrice { get; set; }

    [Column("CURRENT_PRICE")]
    public decimal CurrentPrice { get; set; }

    [Column("MIN_INCREMENT")]
    public decimal MinIncrement { get; set; } = 10;

    [Column("START_DATE_UTC")]
    public DateTime StartDateUtc { get; set; }

    [Column("END_DATE_UTC")]
    public DateTime EndDateUtc { get; set; }

    [Column("STATUS")]
    public string Status { get; set; } = "Active";

    [ConcurrencyCheck]
    [Column("VERSION")]
    public uint Version { get; set; }

    public User? Seller { get; set; }
    public User? CurrentWinner { get; set; }
    public Category? Category { get; set; }
    public ICollection<Bid> Bids { get; set; } = new List<Bid>();

    public decimal GetNextSuggestedBidAmount()
    {
        if (!Bids.Any() && CurrentPrice == 0)
        {
            return StartingPrice;
        }

        return CurrentPrice + MinIncrement;
    }

    public void ValidateBidEligibility(int bidderId, decimal amount)
    {
        if (Status != "Active" || DateTime.UtcNow > EndDateUtc)
        {
            throw new InvalidOperationException("Auction is not active.");
        }

        if (SellerId == bidderId)
        {
            throw new InvalidOperationException("Seller cannot bid on their own auction.");
        }

        if (CurrentWinnerId == bidderId)
        {
            throw new InvalidOperationException("You already hold the highest bid.");
        }

        var minRequired = GetNextSuggestedBidAmount();
        if (amount < minRequired)
        {
            throw new InvalidBidAmountException(Id, amount, minRequired);
        }
    }

    public void ApplyNewWinningBid(int bidderId, decimal amount)
    {
        ValidateBidEligibility(bidderId, amount);
        CurrentPrice = amount;
        CurrentWinnerId = bidderId;
    }
}