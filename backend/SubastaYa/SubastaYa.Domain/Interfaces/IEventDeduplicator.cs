namespace SubastaYa.Domain.Interfaces;

public interface IEventDeduplicator
{
    bool TryMark(Guid eventId);
}
