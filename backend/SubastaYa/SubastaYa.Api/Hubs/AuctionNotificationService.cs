using Microsoft.AspNetCore.SignalR;
using SubastaYa.Domain.Interfaces;

namespace SubastaYa.Api.Hubs;

public class AuctionNotificationService : IAuctionNotificationService
{
    private readonly IHubContext<AuctionHub, IAuctionHubClient> _hubContext;

    public AuctionNotificationService(IHubContext<AuctionHub, IAuctionHubClient> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyNewBidAsync(int auctionId, decimal newAmount, string bidderUsername, DateTime timestamp)
    {
        await _hubContext.Clients
            .Group($"Auction_{auctionId}")
            .ReceiveNewBid(auctionId, newAmount, bidderUsername, timestamp);
    }

    public async Task NotifyTimeExtendedAsync(int auctionId, DateTime newEndDate, string reason)
    {
        await _hubContext.Clients
            .Group($"Auction_{auctionId}")
            .AuctionTimeExtended(auctionId, newEndDate, reason);
    }

    public async Task NotifyAuctionClosedAsync(int auctionId, string? winnerUsername, decimal finalAmount)
    {
        await _hubContext.Clients
            .Group($"Auction_{auctionId}")
            .AuctionClosed(auctionId, winnerUsername, finalAmount);
    }

    public async Task NotifyOutbidAsync(int auctionId, int outbidUserId, int newBidderId, decimal newAmount, DateTime timestamp)
    {
        await _hubContext.Clients
            .Group($"Auction_{auctionId}")
            .OutbidNotification(auctionId, outbidUserId, newBidderId, newAmount, timestamp);
    }

    public async Task NotifyWalletBalanceChangedAsync(int userId, decimal totalBalance, decimal lockedBalance, decimal availableBalance, string reason)
    {
        await _hubContext.Clients
            .Group($"User_{userId}")
            .WalletBalanceChanged(userId, totalBalance, lockedBalance, availableBalance, reason);
    }
}
