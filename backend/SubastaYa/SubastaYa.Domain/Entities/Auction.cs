using SubastaYa.Domain.Exceptions;

namespace SubastaYa.Domain.Entities;

public class Auction
{
    public int Id { get; set; }
    public int SellerId { get; set; }
    public int? CurrentWinnerId { get; set; }
    public int CategoryId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal StartingPrice { get; set; }
    public decimal CurrentPrice { get; set; }
    public decimal MinIncrement { get; set; } = 10;
    public DateTime StartDateUtc { get; set; }
    public DateTime EndDateUtc { get; set; }
    public string Status { get; set; } = "Active";
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