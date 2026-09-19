package org.example.service.impl;

import org.example.domain.entities.AuditLog;
import org.example.domain.repositories.AuditLogRepository;
import org.example.service.AuditService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditServiceImpl(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    @Transactional
    public void logStateChange(Integer auctionId, String previousState, String newState, String message) {
        AuditLog log = new AuditLog(auctionId, "STATE_CHANGE", previousState, newState, message);
        auditLogRepository.save(log);
    }

    @Override
    @Transactional
    public void logConcurrencyFailure(Integer auctionId, String userBidding, String message) {
        AuditLog log = new AuditLog(auctionId, "CONCURRENCY_FAILURE", "", "", "User: " + userBidding + " - " + message);
        auditLogRepository.save(log);
    }

    @Override
    @Transactional
    public void logTimeExtension(Integer auctionId, int extendedMinutes, String message) {
        AuditLog log = new AuditLog(auctionId, "TIME_EXTENSION", "", "", "Extended by " + extendedMinutes + "m - " + message);
        auditLogRepository.save(log);
    }

    @Override
    @Transactional
    public void logRejectedBid(Integer auctionId, String userBidding, String message) {
        AuditLog log = new AuditLog(auctionId, "REJECTED_BID", "", "", "User: " + userBidding + " - " + message);
        auditLogRepository.save(log);
    }
}