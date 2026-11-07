namespace SubastaYa.Domain.Interfaces;

public interface IAuctionNotificationService
{
    Task NotifyNewBidAsync(int auctionId, decimal newAmount, string bidderUsername, DateTime timestamp);
    Task NotifyTimeExtendedAsync(int auctionId, DateTime newEndDate, string reason);
    Task NotifyAuctionClosedAsync(int auctionId, string? winnerUsername, decimal finalAmount);
    Task NotifyNewBidAsync(DTOs.AuctionEventNotification notification, CancellationToken cancellationToken = default);
    Task NotifyTimeExtendedAsync(DTOs.AuctionEventNotification notification, CancellationToken cancellationToken = default);
    Task NotifyAuctionClosedAsync(DTOs.AuctionEventNotification notification, CancellationToken cancellationToken = default);
}
