package org.example.service;

public interface AuditService {
    void logStateChange(Long auctionId, String previousState, String newState, String message);
    void logConcurrencyFailure(Long auctionId, String message);
    void logTimeExtension(Long auctionId, int extendedMinutes, String message);
    void logRejectedBid(Long auctionId, String reason, String message);
}