using Microsoft.EntityFrameworkCore;
using SubastaYa.Domain.DTOs;
using SubastaYa.Domain.Entities;
using SubastaYa.Domain.Exceptions;
using SubastaYa.Domain.Interfaces;
using SubastaYa.Infrastructure.Persistence;

namespace SubastaYa.Infrastructure.Services;

public class BidService : IBidService
{
    private readonly ApplicationDbContext _context;
    private readonly IWalletService _walletService;

    public BidService(ApplicationDbContext context, IWalletService walletService)
    {
        _context = context;
        _walletService = walletService;
    }

    public async Task<BidResultDto> PlaceBidAsync(int auctionId, int bidderId, decimal amount, CancellationToken cancellationToken = default)
    {
        using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            var auction = await _context.Auctions
                .Include(a => a.Bids)
                .FirstOrDefaultAsync(a => a.Id == auctionId, cancellationToken);

            if (auction == null)
            {
                throw new EntityNotFoundException(nameof(Auction), auctionId);
            }

            auction.ValidateBidEligibility(bidderId, amount);

            var previousWinnerId = auction.CurrentWinnerId;
            var previousBidAmount = auction.CurrentPrice;

            await _walletService.LockFundsAsync(bidderId, amount, "Bid", auction.Id, cancellationToken);

            if (previousWinnerId.HasValue && previousWinnerId.Value != 0 && previousBidAmount > 0)
            {
                await _walletService.UnlockFundsAsync(previousWinnerId.Value, previousBidAmount, "BidRefund", auction.Id, cancellationToken);
            }

            var newBid = new Bid
            {
                AuctionId = auction.Id,
                BidderId = bidderId,
                Amount = amount,
                CreatedAtUtc = DateTime.UtcNow
            };

            _context.Bids.Add(newBid);

            auction.ApplyNewWinningBid(bidderId, amount);

            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return new BidResultDto
            {
                BidId = newBid.Id,
                AuctionId = auction.Id,
                BidderId = bidderId,
                Amount = amount,
                NextSuggestedBidAmount = auction.GetNextSuggestedBidAmount(),
                CreatedAtUtc = newBid.CreatedAtUtc
            };
        }
        catch (DbUpdateConcurrencyException)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw new ConcurrencyConflictException("A concurrent bid was processed. Please refresh and try again.");
        }
        catch (Exception)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}