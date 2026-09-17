namespace SubastaYa.Domain.Interfaces;

public interface IAuctionNotificationService
{
    Task NotifyNewBidAsync(int auctionId, decimal newAmount, string bidderUsername, DateTime timestamp);
    Task NotifyTimeExtendedAsync(int auctionId, DateTime newEndDate, string reason);
    Task NotifyAuctionClosedAsync(int auctionId, string? winnerUsername, decimal finalAmount);
}