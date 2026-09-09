namespace SubastaYa.Api.Contracts;

// Input contract for creating a new auction (POST /api/auctions)
public record CreateAuctionRequest(
    string Title,
    string Description,
    string ImageUrl,
    int CategoryId,
    decimal BasePrice,
    decimal MinIncrement,
    DateTime StartDateUtc,
    DateTime EndDateUtc
);

// Input contract for submitting a bid (POST /api/auctions/{id}/bids)
public record PlaceBidRequest(
    int BidderId,
    decimal Amount
);

// Output contract for catalog items (GET /api/auctions)
public record AuctionSummaryResponse(
    int Id,
    string Title,
    string CategoryName,
    string ImageUrl,
    decimal CurrentHighestBid,
    int TotalBids,
    DateTime EndDateUtc,
    string Status
);