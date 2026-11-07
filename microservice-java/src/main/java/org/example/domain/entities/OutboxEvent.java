package org.example.domain.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "OUTBOX_EVENT", uniqueConstraints = @UniqueConstraint(name = "UK_OUTBOX_EVENT_EVENT_ID", columnNames = "EVENT_ID"))
public class OutboxEvent {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "ID")
    private Long id;
    @Column(name = "EVENT_ID", nullable = false, unique = true) private UUID eventId;
    @Column(name = "EVENT_TYPE", nullable = false, length = 32) private String eventType;
    @Column(name = "AGGREGATE_ID", nullable = false) private Long aggregateId;
    @Column(name = "PAYLOAD_JSON", nullable = false, columnDefinition = "TEXT") private String payloadJson;
    @Column(name = "STATUS", nullable = false, length = 16) private String status = "PENDING";
    @Column(name = "ATTEMPTS", nullable = false) private int attempts;
    @Column(name = "NEXT_ATTEMPT_AT", nullable = false) private LocalDateTime nextAttemptAt;
    @Column(name = "CREATED_AT_UTC", nullable = false) private LocalDateTime createdAtUtc;
    @Column(name = "SENT_AT_UTC") private LocalDateTime sentAtUtc;
    @Column(name = "LAST_ERROR", length = 1000) private String lastError;

    public Long getId() { return id; }
    public UUID getEventId() { return eventId; }
    public void setEventId(UUID value) { eventId = value; }
    public String getEventType() { return eventType; }
    public void setEventType(String value) { eventType = value; }
    public Long getAggregateId() { return aggregateId; }
    public void setAggregateId(Long value) { aggregateId = value; }
    public String getPayloadJson() { return payloadJson; }
    public void setPayloadJson(String value) { payloadJson = value; }
    public String getStatus() { return status; }
    public void setStatus(String value) { status = value; }
    public int getAttempts() { return attempts; }
    public void setAttempts(int value) { attempts = value; }
    public LocalDateTime getNextAttemptAt() { return nextAttemptAt; }
    public void setNextAttemptAt(LocalDateTime value) { nextAttemptAt = value; }
    public LocalDateTime getCreatedAtUtc() { return createdAtUtc; }
    public void setCreatedAtUtc(LocalDateTime value) { createdAtUtc = value; }
    public LocalDateTime getSentAtUtc() { return sentAtUtc; }
    public void setSentAtUtc(LocalDateTime value) { sentAtUtc = value; }
    public String getLastError() { return lastError; }
    public void setLastError(String value) { lastError = value; }
}
