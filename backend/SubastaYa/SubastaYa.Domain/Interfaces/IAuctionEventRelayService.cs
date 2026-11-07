using SubastaYa.Domain.DTOs;

namespace SubastaYa.Domain.Interfaces;

public interface IAuctionEventRelayService
{
    Task<bool> ProcessAsync(AuctionEventNotification notification, CancellationToken cancellationToken = default);
}
