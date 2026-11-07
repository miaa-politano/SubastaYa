namespace SubastaYa.Domain.DTOs;

public sealed record AuctionEventNotification(
    Guid EventId, int AuctionId, string EventType, decimal? NewAmount, int? BidderId,
    string? BidderUsername, DateTimeOffset? NewEndDateUtc, DateTimeOffset EventTimestampUtc,
    decimal? AvailableBalance, decimal? LockedBalance, decimal? TotalBalance,
    string? AuctionStatus, string? WinnerUsername);
