namespace SubastaYa.Domain.Constants;

/// <summary>
/// Canonical auction states shared by the C# API, seed data and Java contract.
/// </summary>
public static class AuctionStatuses
{
    public const string ACTIVE = "ACTIVE";
    public const string SCHEDULED = "SCHEDULED";
    public const string FINISHED = "FINISHED";
    public const string NO_SALE = "NO_SALE";
}
