namespace SubastaYa.Domain.Exceptions;

public abstract class DomainException : Exception
{
    protected DomainException(string message) : base(message) { }
}

public class EntityNotFoundException : DomainException
{
    public EntityNotFoundException(string entityName, object key)
        : base($"{entityName} with identifier '{key}' was not found.") { }
}

public class ConcurrencyConflictException : DomainException
{
    public ConcurrencyConflictException(string message = "The record was modified by another transaction. Please try again.")
        : base(message) { }
}

public class BusinessRuleValidationException : DomainException
{
    public BusinessRuleValidationException(string message) : base(message) { }
}

public class InvalidBidAmountException : DomainException
{
    public int AuctionId { get; }
    public decimal BidAmount { get; }
    public decimal MinRequiredAmount { get; }

    public InvalidBidAmountException(int auctionId, decimal bidAmount, decimal minRequiredAmount)
        : base($"Bid amount {bidAmount} is insufficient for auction {auctionId}. Minimum required is {minRequiredAmount}.")
    {
        AuctionId = auctionId;
        BidAmount = bidAmount;
        MinRequiredAmount = minRequiredAmount;
    }
}