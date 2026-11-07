package org.example.service.impl;

import org.example.domain.entities.AuditLog;
import org.example.domain.repositories.AuditLogRepository;
import org.example.service.AuditService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;

@Service
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditLogRepository;
    private final Clock clock = Clock.systemUTC();

    public AuditServiceImpl(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    @Transactional
    public void logStateChange(
            Integer auctionId,
            String previousState,
            String newState,
            String message) {

        save(
                "STATE_CHANGE",
                "auction:" + auctionId,
                "previousState=" + previousState
                        + "; newState=" + newState
                        + "; message=" + message
        );
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logConcurrencyFailure(
            Integer auctionId,
            String userBidding,
            String message) {

        save(
                "CONCURRENCY_FAILURE",
                "user:" + userBidding,
                "auctionId=" + auctionId
                        + "; message=" + message
        );
    }

    @Override
    @Transactional
    public void logTimeExtension(
            Integer auctionId,
            int extendedMinutes,
            String message) {

        save(
                "ANTI_SNIPING_EXTENSION",
                "auction:" + auctionId,
                "auctionId=" + auctionId
                        + "; extendedMinutes=" + extendedMinutes
                        + "; message=" + message
        );
    }

    @Override
    @Transactional
    public void logRejectedBid(
            Integer auctionId,
            String userBidding,
            String message) {

        save(
                "BID_REJECTED",
                "user:" + userBidding,
                "auctionId=" + auctionId
                        + "; message=" + message
        );
    }

    private void save(
            String action,
            String performedBy,
            String details) {

        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setPerformedBy(performedBy);
        log.setDetails(details);
        log.setTimestamp(LocalDateTime.now(clock));

        auditLogRepository.save(log);
    }
}