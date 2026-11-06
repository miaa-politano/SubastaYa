package org.example.service.worker;

import org.example.domain.entities.Auction;
import org.example.domain.repositories.AuctionRepository;
import org.example.service.AuctionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

@Component
public class AuctionExpirationWorker {

    private static final Logger logger = LoggerFactory.getLogger(AuctionExpirationWorker.class);
    private final AuctionRepository auctionRepository;
    private final AuctionService auctionService;
    private final ThreadPoolTaskScheduler taskScheduler;
    private final ConcurrentHashMap<Integer, ScheduledFuture<?>> scheduledTasks = new ConcurrentHashMap<>();

    public AuctionExpirationWorker(AuctionRepository auctionRepository, AuctionService auctionService, ThreadPoolTaskScheduler taskScheduler) {
        this.auctionRepository = auctionRepository;
        this.auctionService = auctionService;
        this.taskScheduler = taskScheduler;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void initializeSchedules() {
        logger.info("Initializing precise auction expiration schedules upon application ready.");
        LocalDateTime nowUtc = LocalDateTime.now(Clock.systemUTC());

        List<Auction> expiredAuctions = auctionRepository
                .findByEndDateUtcBeforeAndStatus(nowUtc, "ACTIVAS", PageRequest.of(0, 100))
                .getContent();

        for (Auction auction : expiredAuctions) {
            try {
                auctionService.liquidateExpiredAuction(auction);
                logger.info("Liquidated past-due auction ID: {}", auction.getId());
            } catch (Exception e) {
                logger.error("Error liquidating past-due auction {}: {}", auction.getId(), e.getMessage());
            }
        }

        List<Auction> activeAuctions = auctionRepository
                .findByFiltersPaginated(null, "ACTIVAS", null, null, PageRequest.of(0, 500))
                .getContent();

        for (Auction auction : activeAuctions) {
            if (auction.getEndDateUtc() != null && auction.getEndDateUtc().isAfter(nowUtc)) {
                scheduleAuctionExpiration(auction);
            }
        }
    }

    public void scheduleAuctionExpiration(Auction auction) {
        cancelExistingTask(auction.getId());

        Instant executionTime = auction.getEndDateUtc().atZone(ZoneOffset.UTC).toInstant();
        Instant now = Instant.now(Clock.systemUTC());

        if (executionTime.isBefore(now)) {
            executionTime = now;
        }

        ScheduledFuture<?> future = taskScheduler.schedule(() -> {
            try {
                Auction currentAuction = auctionRepository.findById(auction.getId()).orElse(null);
                if (currentAuction != null && "ACTIVAS".equalsIgnoreCase(currentAuction.getStatus())) {
                    auctionService.liquidateExpiredAuction(currentAuction);
                    logger.info("Successfully liquidated auction ID: {} via task scheduler.", currentAuction.getId());
                }
            } catch (Exception e) {
                logger.error("Error executing liquidation task for auction {}: {}", auction.getId(), e.getMessage());
            } finally {
                scheduledTasks.remove(auction.getId());
            }
        }, executionTime);

        scheduledTasks.put(auction.getId(), future);
        logger.info("Scheduled expiration for auction ID {} at {}", auction.getId(), executionTime);
    }

    public void cancelExistingTask(Integer auctionId) {
        ScheduledFuture<?> existing = scheduledTasks.remove(auctionId);
        if (existing != null) {
            existing.cancel(false);
        }
    }
}