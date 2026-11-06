namespace SubastaYa.Domain.Interfaces;

public interface IAuctionHubClient
{
    Task ReceiveNewBid(int auctionId, decimal? newAmount, string? bidderUsername, DateTime timestamp, int? bidderId = null);
    Task AuctionTimeExtended(int auctionId, DateTime? newEndDate, string? reason);
    Task AuctionClosed(int auctionId, string? winnerUsername, decimal? finalAmount);
}
