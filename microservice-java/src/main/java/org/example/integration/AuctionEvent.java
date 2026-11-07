package org.example.integration;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record AuctionEvent(
        String eventId,
        Long auctionId,
        String eventType,
        BigDecimal newAmount,
        Long bidderId,
        String bidderUsername,
        OffsetDateTime newEndDateUtc,
        OffsetDateTime eventTimestampUtc,
        BigDecimal availableBalance,
        BigDecimal lockedBalance,
        BigDecimal totalBalance,
        String auctionStatus,
        String winnerUsername
) {}