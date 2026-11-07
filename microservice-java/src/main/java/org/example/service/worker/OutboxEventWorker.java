package org.example.service.worker;

import org.example.domain.entities.OutboxEvent;
import org.example.domain.repositories.OutboxEventRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.util.List;

@Component
public class OutboxEventWorker {

    private final OutboxEventRepository outboxRepository;
    private final RestTemplate restTemplate;

    public OutboxEventWorker(OutboxEventRepository outboxRepository) {
        this.outboxRepository = outboxRepository;
        this.restTemplate = new RestTemplate();
    }

    @Scheduled(fixedDelay = 5000)
    public void processOutboxEvents() {
        List<OutboxEvent> pendingEvents = outboxRepository.findByStatusOrderByCreatedAtAsc("PENDING");

        for (OutboxEvent event : pendingEvents) {
            try {
                String csharpRelayUrl = "https://localhost:7073/api/relay/events";
                restTemplate.postForEntity(csharpRelayUrl, event.getPayload(), Void.class);

                event.setStatus("PROCESSED");
                outboxRepository.save(event);
            } catch (Exception e) {
                event.setRetryCount(event.getRetryCount() + 1);
                if (event.getRetryCount() >= 5) {
                    event.setStatus("FAILED");
                }
                outboxRepository.save(event);
            }
        }
    }
}