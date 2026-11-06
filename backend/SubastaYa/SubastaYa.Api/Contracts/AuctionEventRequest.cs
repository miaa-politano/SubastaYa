namespace SubastaYa.Api.Contracts;

public sealed class AuctionEventRequest
{
    public Guid? EventId { get; init; }
    public int? AuctionId { get; init; }
    public string? EventType { get; init; }
    public decimal? NewAmount { get; init; }
    public int? BidderId { get; init; }
    public string? BidderUsername { get; init; }
    public DateTimeOffset? NewEndDateUtc { get; init; }
    public DateTimeOffset? EventTimestampUtc { get; init; }
    public decimal? AvailableBalance { get; init; }
    public decimal? LockedBalance { get; init; }
    public decimal? TotalBalance { get; init; }
    public string? AuctionStatus { get; init; }
    public string? WinnerUsername { get; init; }

    public IDictionary<string, string[]> Validate()
    {
        var errors = new Dictionary<string, string[]>();
        if (EventId is null || EventId == Guid.Empty) errors[nameof(EventId)] = ["eventId is required."];
        if (AuctionId is null || AuctionId <= 0) errors[nameof(AuctionId)] = ["auctionId must be a positive integer."];
        if (string.IsNullOrWhiteSpace(EventType) || !new[] { "NewBid", "Extended", "Closed" }.Contains(EventType, StringComparer.Ordinal))
            errors[nameof(EventType)] = ["eventType must be NewBid, Extended, or Closed."];
        if (EventTimestampUtc is null || EventTimestampUtc.Value.Offset != TimeSpan.Zero)
            errors[nameof(EventTimestampUtc)] = ["eventTimestampUtc is required and must be UTC."];
        return errors;
    }
}
