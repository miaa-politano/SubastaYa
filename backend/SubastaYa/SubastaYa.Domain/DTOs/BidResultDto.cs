namespace SubastaYa.Domain.DTOs;

public class BidResultDto
{
    public int BidId { get; set; }
    public int AuctionId { get; set; }
    public int BidderId { get; set; }
    public decimal Amount { get; set; }
    public decimal NextSuggestedBidAmount { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}