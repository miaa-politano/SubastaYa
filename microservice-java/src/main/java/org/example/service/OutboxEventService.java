package org.example.service;

import org.example.domain.entities.OutboxEvent;
import java.util.Map;

public interface OutboxEventService {
    OutboxEvent enqueue(String eventType, String aggregateType, Integer aggregateId, Map<String, Object> payload);
}
