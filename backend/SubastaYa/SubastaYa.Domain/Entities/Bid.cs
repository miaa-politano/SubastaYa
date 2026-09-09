namespace SubastaYa.Domain.Entities;

public class Bid
{
    public int Id { get; set; }
    public int AuctionId { get; set; }
    public int BidderId { get; set; }
    public decimal Amount { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public Auction? Auction { get; set; }
    public User? Bidder { get; set; }
}