package org.example.service.worker;

import org.example.domain.entities.OutboxEvent;
import org.example.domain.repositories.OutboxEventRepository;
import org.example.integration.RealtimeEventPublisher;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Component
public class OutboxEventWorker {
    private final OutboxEventRepository repository;
    private final RealtimeEventPublisher publisher;
    private final int maxAttempts;

    public OutboxEventWorker(OutboxEventRepository repository, RealtimeEventPublisher publisher,
                             @Value("${subastaya.outbox.max-attempts:5}") int maxAttempts) {
        this.repository = repository;
        this.publisher = publisher;
        this.maxAttempts = maxAttempts;
    }

    @Scheduled(fixedDelayString = "${subastaya.outbox.poll-delay-ms:5000}")
    @Transactional
    public void processOutboxEvents() {
        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
        List<OutboxEvent> pending = repository.findTop100ByStatusAndNextAttemptAtLessThanEqualOrderByCreatedAtUtcAsc("PENDING", now);
        for (OutboxEvent event : pending) process(event);
    }

    protected void process(OutboxEvent event) {
        event.setAttempts(event.getAttempts() + 1);
        try {
            RealtimeEventPublisher.DeliveryResult result = publisher
                    .publishPayload(event.getEventId().toString(), event.getEventType(), event.getPayloadJson())
                    .orTimeout(10, TimeUnit.SECONDS)
                    .join();
            if (result.accepted()) {
                event.setStatus("SENT");
                event.setSentAtUtc(LocalDateTime.now(ZoneOffset.UTC));
                event.setLastError(null);
            } else {
                registerFailure(event, "HTTP " + result.statusCode() + " " + result.responseBody());
            }
        } catch (Exception exception) {
            registerFailure(event, exception.getMessage());
        }
        repository.save(event);
    }

    private void registerFailure(OutboxEvent event, String error) {
        event.setLastError(error == null ? "Unknown delivery error" : error.substring(0, Math.min(error.length(), 1000)));
        if (event.getAttempts() >= maxAttempts) {
            event.setStatus("FAILED");
            return;
        }
        event.setStatus("PENDING");
        event.setNextAttemptAt(LocalDateTime.now(ZoneOffset.UTC).plusSeconds(backoffSeconds(event.getAttempts())));
    }

    private long backoffSeconds(int attempts) {
        return switch (attempts) {
            case 1 -> 1;
            case 2 -> 5;
            case 3 -> 30;
            case 4 -> 120;
            default -> 600;
        };
    }
}
