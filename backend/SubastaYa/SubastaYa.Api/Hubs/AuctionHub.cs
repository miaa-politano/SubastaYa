using Microsoft.AspNetCore.SignalR;
using SubastaYa.Domain.Interfaces;

namespace SubastaYa.Api.Hubs;

public class AuctionHub : Hub<IAuctionHubClient>
{
    public async Task JoinAuctionGroup(string auctionId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, GetGroupName(auctionId));
    }

    public async Task LeaveAuctionGroup(string auctionId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GetGroupName(auctionId));
    }

    private static string GetGroupName(string auctionId)
    {
        if (!int.TryParse(auctionId, out var parsedId) || parsedId <= 0)
            throw new HubException("auctionId must be a positive integer.");
        return $"Auction_{parsedId}";
    }
}
