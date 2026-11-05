namespace SubastaYa.Domain.Interfaces;

public interface IAuctionHubClient
{
    Task ReceiveNewBid(int auctionId, decimal newAmount, string bidderUsername, DateTime timestamp, int bidderId);
    Task AuctionTimeExtended(int auctionId, DateTime newEndDate, string reason);
    Task AuctionClosed(int auctionId, string? winnerUsername, decimal finalAmount);
    Task OutbidNotification(int auctionId, int outbidUserId, int newBidderId, decimal newAmount, DateTime timestamp);
    Task WalletBalanceChanged(int userId, decimal totalBalance, decimal lockedBalance, decimal availableBalance, string reason);
}
