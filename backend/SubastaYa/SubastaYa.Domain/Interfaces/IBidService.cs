using SubastaYa.Domain.DTOs;

namespace SubastaYa.Domain.Interfaces;

public interface IBidService
{
    Task<BidResultDto> PlaceBidAsync(int auctionId, int bidderId, decimal amount, CancellationToken cancellationToken = default);
}