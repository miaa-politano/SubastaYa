package org.example.service.impl;

import org.example.api.contracts.CreateAuctionRequest;
import org.example.domain.entities.Auction;
import org.example.domain.repositories.AuctionRepository;
import org.example.integration.AuctionEvent;
import org.example.integration.RealtimeEventPublisher;
import org.example.service.AuctionService;
import org.example.service.AuditService;
import org.example.service.WalletService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
public class AuctionServiceImpl implements AuctionService {

    private final AuctionRepository auctionRepository;
    private final WalletService walletService;
    private final AuditService auditService;
    private final RealtimeEventPublisher realtimeEventPublisher;

    public AuctionServiceImpl(AuctionRepository auctionRepository, WalletService walletService, AuditService auditService, RealtimeEventPublisher realtimeEventPublisher) {
        this.auctionRepository = auctionRepository;
        this.walletService = walletService;
        this.auditService = auditService;
        this.realtimeEventPublisher = realtimeEventPublisher;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Auction> getCatalog(Integer categoryId, String status, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        BigDecimal finalMinPrice = (minPrice == null) ? BigDecimal.ZERO : minPrice;
        BigDecimal finalMaxPrice = (maxPrice == null) ? new BigDecimal("9999999999") : maxPrice;
        return auctionRepository.findByFiltersPaginated(categoryId, status, finalMinPrice, finalMaxPrice, pageable);
    }

    @Override
    @Transactional
    public Auction createAuction(CreateAuctionRequest request) {
        Auction auction = new Auction();
        auction.setSellerId(request.sellerId());
        auction.setCategoryId(request.categoryId());
        auction.setTitle(request.title());
        auction.setDescription(request.description());
        auction.setStartingPrice(request.startingPrice());
        auction.setCurrentPrice(request.startingPrice());
        auction.setMinIncrement(request.minIncrement());
        auction.setStartDateUtc(request.startDateUtc());
        auction.setEndDateUtc(request.endDateUtc());
        auction.setStatus("ACTIVAS");
        return auctionRepository.save(auction);
    }

    @Override
    @Transactional(isolation = org.springframework.transaction.annotation.Isolation.SERIALIZABLE)
    public Auction placeBid(Integer auctionId, Integer bidderId, BigDecimal amount) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new IllegalArgumentException("Auction not found."));

        if (!"ACTIVAS".equalsIgnoreCase(auction.getStatus())) {
            throw new IllegalArgumentException("Bids can only be placed on active auctions.");
        }

        OffsetDateTime nowUtc = OffsetDateTime.now(Clock.systemUTC());
        if (nowUtc.isAfter(auction.getEndDateUtc().atOffset(ZoneOffset.UTC))) {
            throw new IllegalArgumentException("The auction has already expired.");
        }

        BigDecimal minRequired = auction.getCurrentPrice().add(auction.getMinIncrement());
        if (amount.compareTo(minRequired) < 0) {
            throw new IllegalArgumentException("Bid amount must be at least current price plus minimum increment.");
        }

        Integer previousWinnerId = auction.getCurrentWinnerId();
        BigDecimal previousPrice = auction.getCurrentPrice();

        walletService.processBidGuarantee(auctionId, previousWinnerId, bidderId, previousPrice, amount);

        auction.setCurrentWinnerId(bidderId);
        auction.setCurrentPrice(amount);

        long secondsLeft = Duration.between(nowUtc.toLocalDateTime(), auction.getEndDateUtc()).toSeconds();
        boolean timeExtended = false;
        if (secondsLeft <= 60) {
            auction.setEndDateUtc(auction.getEndDateUtc().plusMinutes(2));
            auditService.logTimeExtension(auctionId, 2, "Anti-sniping triggered.");
            timeExtended = true;
        }

        Auction savedAuction = auctionRepository.saveAndFlush(auction);

        String eventIdNewBid = UUID.randomUUID().toString();
        String eventIdExtended = timeExtended ? UUID.randomUUID().toString() : null;
        OffsetDateTime timestampUtc = OffsetDateTime.now(Clock.systemUTC());
        final boolean finalTimeExtended = timeExtended;

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                AuctionEvent newBidEvent = new AuctionEvent(
                        eventIdNewBid,
                        savedAuction.getId().longValue(),
                        "NewBid",
                        savedAuction.getCurrentPrice(),
                        savedAuction.getCurrentWinnerId().longValue(),
                        "User_" + savedAuction.getCurrentWinnerId(),
                        savedAuction.getEndDateUtc().atOffset(ZoneOffset.UTC),
                        timestampUtc,
                        null, null, null,
                        savedAuction.getStatus(),
                        "User_" + savedAuction.getCurrentWinnerId()
                );
                realtimeEventPublisher.publishEvent(newBidEvent);

                if (finalTimeExtended && eventIdExtended != null) {
                    AuctionEvent extendedEvent = new AuctionEvent(
                            eventIdExtended,
                            savedAuction.getId().longValue(),
                            "Extended",
                            savedAuction.getCurrentPrice(),
                            savedAuction.getCurrentWinnerId().longValue(),
                            "User_" + savedAuction.getCurrentWinnerId(),
                            savedAuction.getEndDateUtc().atOffset(ZoneOffset.UTC),
                            timestampUtc,
                            null, null, null,
                            savedAuction.getStatus(),
                            "User_" + savedAuction.getCurrentWinnerId()
                    );
                    realtimeEventPublisher.publishEvent(extendedEvent);
                }
            }
        });

        return savedAuction;
    }

    @Override
    @Transactional
    public void liquidateExpiredAuction(Auction auction) {
        Integer winnerId = auction.getCurrentWinnerId();
        BigDecimal finalAmount = auction.getCurrentPrice();
        String finalStatus;
        final String finalWinnerUsername;

        if (winnerId != null) {
            walletService.settleAuctionPayment(auction.getId(), auction.getSellerId(), winnerId, finalAmount);
            auction.setStatus("FINALIZADAS");
            finalStatus = "FINALIZADAS";
            finalWinnerUsername = "User_" + winnerId;
        } else {
            auction.setStatus("DESIERTAS");
            finalStatus = "DESIERTAS";
            finalWinnerUsername = null;
        }

        Auction savedAuction = auctionRepository.saveAndFlush(auction);
        String eventIdClosed = UUID.randomUUID().toString();
        OffsetDateTime timestampUtc = OffsetDateTime.now(Clock.systemUTC());

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                AuctionEvent closedEvent = new AuctionEvent(
                        eventIdClosed,
                        savedAuction.getId().longValue(),
                        "Closed",
                        finalAmount,
                        winnerId != null ? winnerId.longValue() : null,
                        finalWinnerUsername,
                        savedAuction.getEndDateUtc().atOffset(ZoneOffset.UTC),
                        timestampUtc,
                        null, null, null,
                        finalStatus,
                        finalWinnerUsername
                );
                realtimeEventPublisher.publishEvent(closedEvent);
            }
        });
    }
}