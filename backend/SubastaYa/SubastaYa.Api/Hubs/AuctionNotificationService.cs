using Microsoft.AspNetCore.SignalR;
using SubastaYa.Domain.DTOs;
using SubastaYa.Domain.Interfaces;

namespace SubastaYa.Api.Hubs;

public class AuctionNotificationService : IAuctionNotificationService
{
    private readonly IHubContext<AuctionHub, IAuctionHubClient> _hubContext;

    public AuctionNotificationService(IHubContext<AuctionHub, IAuctionHubClient> hubContext) => _hubContext = hubContext;

    public async Task NotifyNewBidAsync(int auctionId, decimal newAmount, string bidderUsername, DateTime timestamp) =>
        await _hubContext.Clients.Group(GroupName(auctionId)).ReceiveNewBid(auctionId, newAmount, bidderUsername, timestamp);

    public async Task NotifyTimeExtendedAsync(int auctionId, DateTime newEndDate, string reason) =>
        await _hubContext.Clients.Group(GroupName(auctionId)).AuctionTimeExtended(auctionId, newEndDate, reason);

    public async Task NotifyAuctionClosedAsync(int auctionId, string? winnerUsername, decimal finalAmount) =>
        await _hubContext.Clients.Group(GroupName(auctionId)).AuctionClosed(auctionId, winnerUsername, finalAmount);

    public async Task NotifyNewBidAsync(AuctionEventNotification notification, CancellationToken cancellationToken = default) =>
        await _hubContext.Clients.Group(GroupName(notification.AuctionId)).ReceiveNewBid(notification.AuctionId,
            notification.NewAmount, notification.BidderUsername, notification.EventTimestampUtc.UtcDateTime, notification.BidderId);

    public async Task NotifyTimeExtendedAsync(AuctionEventNotification notification, CancellationToken cancellationToken = default) =>
        await _hubContext.Clients.Group(GroupName(notification.AuctionId)).AuctionTimeExtended(notification.AuctionId,
            notification.NewEndDateUtc?.UtcDateTime, notification.AuctionStatus);

    public async Task NotifyAuctionClosedAsync(AuctionEventNotification notification, CancellationToken cancellationToken = default) =>
        await _hubContext.Clients.Group(GroupName(notification.AuctionId)).AuctionClosed(notification.AuctionId,
            notification.WinnerUsername, notification.NewAmount);

    private static string GroupName(int auctionId) => $"Auction_{auctionId}";
}
