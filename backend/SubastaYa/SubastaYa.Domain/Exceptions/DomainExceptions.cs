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

public class InsufficientFundsException : DomainException
{
    public InsufficientFundsException(string message = "Available balance is insufficient for this bid.")
        : base(message) { }
}

public class InvalidBidAmountException : DomainException
{
    public InvalidBidAmountException(string message) : base(message) { }
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