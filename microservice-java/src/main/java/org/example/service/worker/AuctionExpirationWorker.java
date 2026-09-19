package org.example.service.worker;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.example.domain.entities.Auction;
import org.example.domain.repositories.AuctionRepository;
import org.example.service.AuctionService;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class AuctionExpirationWorker {

    private static final Logger logger = LoggerFactory.getLogger(AuctionExpirationWorker.class);
    private final AuctionRepository auctionRepository;
    private final AuctionService auctionService;

    public AuctionExpirationWorker(AuctionRepository auctionRepository, AuctionService auctionService) {
        this.auctionRepository = auctionRepository;
        this.auctionService = auctionService;
    }

    @Scheduled(fixedRate = 10000)
    public void executeAuctionLiquidation() {
        LocalDateTime nowUtc = LocalDateTime.now(Clock.systemUTC());
        logger.info("Starting expired auctions scan.");

        Page<Auction> expiredAuctionsPage = auctionRepository
                .findByEndDateUtcBeforeAndStatus(nowUtc, "ACTIVAS", PageRequest.of(0, 50));

        List<Auction> expiredAuctions = expiredAuctionsPage.getContent();

        for (Auction auction : expiredAuctions) {
            try {
                auctionService.liquidateExpiredAuction(auction);
                logger.info("Successfully processed expired auction ID: {}", auction.getId());
            } catch (Exception e) {
                logger.error("Error delegating liquidation for auction {}: {}", auction.getId(), e.getMessage());
            }
        }
    }
}