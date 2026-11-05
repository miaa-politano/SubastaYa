using System.Text.Json;
using SubastaYa.Domain.Interfaces;

namespace SubastaYa.Api.Events;

public sealed class OutboxEventPublisher : IOutboxEventHandler
{
    private readonly IAuctionNotificationService _notificationService;

    public OutboxEventPublisher(IAuctionNotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    public async Task HandleAsync(OutboxEventRecord outboxEvent, CancellationToken cancellationToken)
    {
        using JsonDocument document = JsonDocument.Parse(outboxEvent.Payload);
        JsonElement payload = document.RootElement;
        switch (outboxEvent.EventType)
        {
            case "AuctionBidPlaced":
                await _notificationService.NotifyNewBidAsync(
                    payload.GetProperty("auctionId").GetInt32(),
                    payload.GetProperty("amount").GetDecimal(),
                    payload.GetProperty("bidderId").GetInt32(),
                    payload.GetProperty("occurredAtUtc").GetDateTime());
                break;
            case "AuctionTimeExtended":
                await _notificationService.NotifyTimeExtendedAsync(
                    payload.GetProperty("auctionId").GetInt32(),
                    payload.GetProperty("newEndDateUtc").GetDateTime(),
                    payload.GetProperty("reason").GetString() ?? string.Empty);
                break;
            case "OutbidNotification":
                await _notificationService.NotifyOutbidAsync(
                    payload.GetProperty("auctionId").GetInt32(),
                    payload.GetProperty("outbidUserId").GetInt32(),
                    payload.GetProperty("newBidderId").GetInt32(),
                    payload.GetProperty("newAmount").GetDecimal(),
                    payload.GetProperty("occurredAtUtc").GetDateTime());
                break;
            case "WalletBalanceChanged":
                await _notificationService.NotifyWalletBalanceChangedAsync(
                    payload.GetProperty("userId").GetInt32(),
                    payload.GetProperty("totalBalance").GetDecimal(),
                    payload.GetProperty("lockedBalance").GetDecimal(),
                    payload.GetProperty("availableBalance").GetDecimal(),
                    payload.GetProperty("reason").GetString() ?? string.Empty);
                break;
        }
    }
}
