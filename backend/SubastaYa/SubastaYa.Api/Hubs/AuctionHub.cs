using Microsoft.AspNetCore.SignalR;
using SubastaYa.Domain.Interfaces;

namespace SubastaYa.Api.Hubs;

public class AuctionHub : Hub<IAuctionHubClient>
{
    public async Task JoinAuctionGroup(string auctionId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Auction_{auctionId}");
    }

    public async Task LeaveAuctionGroup(string auctionId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Auction_{auctionId}");
    }

    public async Task JoinUserGroup(string userId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
    }

    public async Task LeaveUserGroup(string userId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"User_{userId}");
    }
}
