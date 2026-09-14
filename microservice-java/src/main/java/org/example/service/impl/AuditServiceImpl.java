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
    public void logStateChange(Long auctionId, String previousState, String newState, String message) {
        auditLogRepository.save(new AuditLog(auctionId, "STATE_CHANGE", previousState, newState, message));
    }

    @Override
    @Transactional
    public void logConcurrencyFailure(Long auctionId, String message) {
        auditLogRepository.save(new AuditLog(auctionId, "CONCURRENCY_FAILURE", null, null, message));
    }

    @Override
    @Transactional
    public void logTimeExtension(Long auctionId, int extendedMinutes, String message) {
        auditLogRepository.save(new AuditLog(auctionId, "ANTI_SNIPING_EXTENSION", null, String.valueOf(extendedMinutes), message));
    }

    @Override
    @Transactional
    public void logRejectedBid(Long auctionId, String reason, String message) {
        auditLogRepository.save(new AuditLog(auctionId, "REJECTED_BID", reason, null, message));
    }
}