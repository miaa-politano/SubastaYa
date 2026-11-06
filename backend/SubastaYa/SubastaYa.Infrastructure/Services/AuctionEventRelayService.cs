using Microsoft.Extensions.Logging;
using SubastaYa.Domain.DTOs;
using SubastaYa.Domain.Interfaces;

namespace SubastaYa.Infrastructure.Services;

public sealed class AuctionEventRelayService : IAuctionEventRelayService
{
    private static readonly string[] SupportedEvents = ["NewBid", "Extended", "Closed"];
    private readonly IAuctionNotificationService _notificationService;
    private readonly IEventDeduplicator _deduplicator;
    private readonly ILogger<AuctionEventRelayService> _logger;

    public AuctionEventRelayService(IAuctionNotificationService notificationService, IEventDeduplicator deduplicator, ILogger<AuctionEventRelayService> logger)
    {
        _notificationService = notificationService;
        _deduplicator = deduplicator;
        _logger = logger;
    }

    public async Task<bool> ProcessAsync(AuctionEventNotification notification, CancellationToken cancellationToken = default)
    {
        if (!SupportedEvents.Contains(notification.EventType, StringComparer.Ordinal))
            throw new ArgumentException($"Unsupported eventType '{notification.EventType}'.");
        if (!_deduplicator.TryMark(notification.EventId))
        {
            _logger.LogInformation("Ignoring duplicate auction event {EventId} for auction {AuctionId}", notification.EventId, notification.AuctionId);
            return false;
        }
        _logger.LogInformation("Relaying auction event {EventId} of type {EventType} for auction {AuctionId}", notification.EventId, notification.EventType, notification.AuctionId);
        switch (notification.EventType)
        {
            case "NewBid": await _notificationService.NotifyNewBidAsync(notification, cancellationToken); break;
            case "Extended": await _notificationService.NotifyTimeExtendedAsync(notification, cancellationToken); break;
            case "Closed": await _notificationService.NotifyAuctionClosedAsync(notification, cancellationToken); break;
        }
        return true;
    }
}
