package org.example.domain.entities;

import jakarta.persistence.*;
import java.time.Clock;
import java.time.LocalDateTime;

@Entity
@Table(name = "AUDIT_LOG")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "AUCTION_ID", nullable = false)
    private Integer auctionId;

    @Column(name = "EVENT_TYPE", nullable = false, length = 100)
    private String eventType;

    @Column(name = "PREVIOUS_STATE", length = 50)
    private String previousState;

    @Column(name = "NEW_STATE", length = 50)
    private String newState;

    @Column(name = "MESSAGE", length = 500)
    private String message;

    @Column(name = "CREATED_AT_UTC", nullable = false)
    private LocalDateTime createdAt;

    protected AuditLog() {
    }

    public AuditLog(Integer auctionId, String eventType, String previousState, String newState, String message) {
        this.auctionId = auctionId;
        this.eventType = eventType;
        this.previousState = previousState;
        this.newState = newState;
        this.message = message;
        this.createdAt = LocalDateTime.now(Clock.systemUTC());
    }

    public Long getId() {
        return id;
    }

    public Integer getAuctionId() {
        return auctionId;
    }

    public String getEventType() {
        return eventType;
    }

    public String getPreviousState() {
        return previousState;
    }

    public String getNewState() {
        return newState;
    }

    public String getMessage() {
        return message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}