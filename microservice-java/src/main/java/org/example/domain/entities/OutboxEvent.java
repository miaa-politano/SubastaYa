package org.example.domain.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "OUTBOX_EVENT")
public class OutboxEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "EVENT_TYPE", nullable = false, length = 100)
    private String eventType;

    @Column(name = "AGGREGATE_TYPE", nullable = false, length = 100)
    private String aggregateType;

    @Column(name = "AGGREGATE_ID", nullable = false)
    private Integer aggregateId;

    @Column(name = "PAYLOAD", nullable = false, columnDefinition = "TEXT")
    private String payload;

    @Column(name = "CREATED_AT_UTC", nullable = false)
    private LocalDateTime createdAtUtc;

    @Column(name = "PROCESSED_AT_UTC")
    private LocalDateTime processedAtUtc;

    @Column(name = "PROCESSING_AT_UTC")
    private LocalDateTime processingAtUtc;

    @Column(name = "STATUS", nullable = false, length = 20)
    private String status;

    @Column(name = "RETRY_COUNT", nullable = false)
    private Integer retryCount;

    @Column(name = "LAST_ERROR", length = 1000)
    private String lastError;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public String getAggregateType() { return aggregateType; }
    public void setAggregateType(String aggregateType) { this.aggregateType = aggregateType; }
    public Integer getAggregateId() { return aggregateId; }
    public void setAggregateId(Integer aggregateId) { this.aggregateId = aggregateId; }
    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }
    public LocalDateTime getCreatedAtUtc() { return createdAtUtc; }
    public void setCreatedAtUtc(LocalDateTime createdAtUtc) { this.createdAtUtc = createdAtUtc; }
    public LocalDateTime getProcessedAtUtc() { return processedAtUtc; }
    public void setProcessedAtUtc(LocalDateTime processedAtUtc) { this.processedAtUtc = processedAtUtc; }
    public LocalDateTime getProcessingAtUtc() { return processingAtUtc; }
    public void setProcessingAtUtc(LocalDateTime processingAtUtc) { this.processingAtUtc = processingAtUtc; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getRetryCount() { return retryCount; }
    public void setRetryCount(Integer retryCount) { this.retryCount = retryCount; }
    public String getLastError() { return lastError; }
    public void setLastError(String lastError) { this.lastError = lastError; }
}
