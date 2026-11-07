using System.Collections.Concurrent;
using SubastaYa.Domain.Interfaces;

namespace SubastaYa.Infrastructure.Services;

public sealed class InMemoryEventDeduplicator : IEventDeduplicator
{
    private readonly ConcurrentDictionary<Guid, byte> _processed = new();
    public bool TryMark(Guid eventId) => _processed.TryAdd(eventId, 0);
}
