package org.example.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.domain.entities.OutboxEvent;
import org.example.domain.repositories.OutboxEventRepository;
import org.example.service.OutboxEventService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.Map;

@Service
public class OutboxEventServiceImpl implements OutboxEventService {

    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;
    private final EntityManager entityManager;

    public OutboxEventServiceImpl(
            OutboxEventRepository outboxEventRepository,
            ObjectMapper objectMapper,
            EntityManager entityManager) {
        this.outboxEventRepository = outboxEventRepository;
        this.objectMapper = objectMapper;
        this.entityManager = entityManager;
    }

    @Override
    @Transactional
    public OutboxEvent enqueue(String eventType, String aggregateType, Integer aggregateId, Map<String, Object> payload) {
        try {
            OutboxEvent event = new OutboxEvent();
            event.setEventType(eventType);
            event.setAggregateType(aggregateType);
            event.setAggregateId(aggregateId);
            event.setPayload(objectMapper.writeValueAsString(payload));
            event.setCreatedAtUtc(LocalDateTime.now(Clock.systemUTC()));
            event.setStatus("PENDING");
            event.setRetryCount(0);
            OutboxEvent savedEvent = outboxEventRepository.save(event);
            entityManager.createNativeQuery("SELECT pg_notify('subastaya_outbox', :eventId)")
                    .setParameter("eventId", String.valueOf(savedEvent.getId()))
                    .getSingleResult();
            return savedEvent;
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Unable to serialize outbox event payload.", exception);
        }
    }
}
