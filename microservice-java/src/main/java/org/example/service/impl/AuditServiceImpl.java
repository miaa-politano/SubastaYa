package org.example.service.impl;

import org.example.domain.entities.AuditLog;
import org.example.domain.repositories.AuditLogRepository;
import org.example.service.AuditService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Clock;
import java.time.LocalDateTime;

@Service
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditServiceImpl(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    @Transactional
    public void logStateChange(Integer auctionId, String previousState, String newState, String message) {
        AuditLog log = new AuditLog();
        log.setAuctionId(auctionId);
        log.setEventType("STATE_CHANGE");
        log.setPreviousState(previousState);
        log.setNewState(newState);
        log.setMessage(message);
        log.setCreatedAtUtc(LocalDateTime.now(Clock.systemUTC()));
        auditLogRepository.save(log);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void logConcurrencyFailure(Integer auctionId, String userBidding, String message) {
        AuditLog log = new AuditLog();
        log.setAuctionId(auctionId);
        log.setEventType("CONCURRENCY_FAILURE");
        log.setPreviousState("ACTIVAS");
        log.setNewState("ACTIVAS");
        log.setMessage("User: " + userBidding + " - " + message);
        log.setCreatedAtUtc(LocalDateTime.now(Clock.systemUTC()));
        auditLogRepository.save(log);
    }

    @Override
    @Transactional
    public void logTimeExtension(Integer auctionId, int extendedMinutes, String message) {
        AuditLog log = new AuditLog();
        log.setAuctionId(auctionId);
        log.setEventType("ANTI_SNIPING_EXTENSION");
        log.setPreviousState("ACTIVAS");
        log.setNewState("ACTIVAS");
        log.setMessage("Extended by " + extendedMinutes + " minutes - " + message);
        log.setCreatedAtUtc(LocalDateTime.now(Clock.systemUTC()));
        auditLogRepository.save(log);
    }

    @Override
    @Transactional
    public void logRejectedBid(Integer auctionId, String userBidding, String message) {
        AuditLog log = new AuditLog();
        log.setAuctionId(auctionId);
        log.setEventType("BID_REJECTED");
        log.setPreviousState("ACTIVAS");
        log.setNewState("ACTIVAS");
        log.setMessage("User: " + userBidding + " - " + message);
        log.setCreatedAtUtc(LocalDateTime.now(Clock.systemUTC()));
        auditLogRepository.save(log);
    }
}