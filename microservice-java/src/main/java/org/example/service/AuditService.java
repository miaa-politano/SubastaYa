package org.example.service;

public interface AuditService {
    void logStateChange(Integer auctionId, String previousState, String newState, String message);
    void logConcurrencyFailure(Integer auctionId, String message);
    void logTimeExtension(Integer auctionId, int extendedMinutes, String message);
    void logRejectedBid(Integer auctionId, String reason, String message);
}