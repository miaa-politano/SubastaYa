namespace SubastaYa.Domain.Entities;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    // Navigation property: auctions in this category
    public ICollection<Auction> Auctions { get; set; } = new List<Auction>();
}