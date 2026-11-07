package org.example.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.domain.entities.OutboxEvent;
import org.example.domain.repositories.OutboxEventRepository;
import org.example.integration.AuctionEvent;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
public class OutboxService {
    private final OutboxEventRepository repository;
    private final ObjectMapper objectMapper;

    public OutboxService(OutboxEventRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    public OutboxEvent enqueue(AuctionEvent event) {
        try {
            OutboxEvent outbox = new OutboxEvent();
            outbox.setEventId(UUID.fromString(event.eventId()));
            outbox.setEventType(event.eventType());
            outbox.setAggregateId(event.auctionId());
            outbox.setPayloadJson(objectMapper.writeValueAsString(event));
            outbox.setStatus("PENDING");
            outbox.setAttempts(0);
            outbox.setCreatedAtUtc(LocalDateTime.now(ZoneOffset.UTC));
            outbox.setNextAttemptAt(outbox.getCreatedAtUtc());
            return repository.save(outbox);
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to persist realtime event in outbox", exception);
        }
    }
}
