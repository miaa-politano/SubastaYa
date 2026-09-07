namespace SubastaYa.Domain.Entities;

public class Auction
{
    public int Id { get; set; }
    public int SellerId { get; set; }
    public int CategoryId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal StartingPrice { get; set; }
    public decimal CurrentPrice { get; set; }
    public DateTime StartDateUtc { get; set; }
    public DateTime EndDateUtc { get; set; }
    public string Status { get; set; } = "Active"; // Active, Finished, Cancelled

    // Concurrency token for concurrent bids (RNF1.1)
    public uint Version { get; set; }

    // Navigation properties
    public User? Seller { get; set; }
    public Category? Category { get; set; }
    public ICollection<Bid> Bids { get; set; } = new List<Bid>();
}