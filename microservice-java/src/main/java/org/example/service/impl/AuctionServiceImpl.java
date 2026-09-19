package org.example.service.impl;

import org.example.api.contracts.CreateAuctionRequest;
import org.example.domain.entities.Auction;
import org.example.domain.repositories.AuctionRepository;
import org.example.service.AuctionService;
import org.example.service.AuditService;
import org.example.service.WalletService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class AuctionServiceImpl implements AuctionService {

    private final AuctionRepository auctionRepository;
    private final WalletService walletService;
    private final AuditService auditService;

    public AuctionServiceImpl(
            AuctionRepository auctionRepository,
            WalletService walletService,
            AuditService auditService) {
        this.auctionRepository = auctionRepository;
        this.walletService = walletService;
        this.auditService = auditService;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Auction> getCatalog(Integer categoryId, String status, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        BigDecimal finalMinPrice = (minPrice == null) ? BigDecimal.ZERO : minPrice;
        BigDecimal finalMaxPrice = (maxPrice == null) ? new BigDecimal("9999999999") : maxPrice;

        if (finalMinPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Minimum search price cannot be negative.");
        }
        if (finalMaxPrice.compareTo(finalMinPrice) < 0) {
            throw new IllegalArgumentException("Maximum search price cannot be less than minimum price.");
        }

        return auctionRepository.findByFiltersPaginated(categoryId, status, finalMinPrice, finalMaxPrice, pageable);
    }

    @Override
    @Transactional
    public Auction createAuction(CreateAuctionRequest request) {
        if (request.endDateUtc().isBefore(request.startDateUtc()) || request.endDateUtc().isEqual(request.startDateUtc())) {
            throw new IllegalArgumentException("End date must be after start date.");
        }
        if (request.startingPrice().compareTo(BigDecimal.ZERO) <= 0 || request.minIncrement().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Starting price and minimum increment must be greater than zero.");
        }

        LocalDateTime nowUtc = LocalDateTime.now(Clock.systemUTC());
        String initialStatus = nowUtc.isAfter(request.startDateUtc()) || nowUtc.isEqual(request.startDateUtc())
                ? "ACTIVAS"
                : "PROXIMAS";

        Auction auction = new Auction();
        auction.setSellerId(request.sellerId());
        auction.setTitle(request.title());
        auction.setDescription(request.description());
        auction.setStartingPrice(request.startingPrice());
        auction.setCurrentPrice(request.startingPrice());
        auction.setMinIncrement(request.minIncrement());
        auction.setStartDateUtc(request.startDateUtc());
        auction.setEndDateUtc(request.endDateUtc());
        auction.setStatus(initialStatus);

        Auction savedAuction = auctionRepository.save(auction);
        auditService.logStateChange(savedAuction.getId(), "", initialStatus, "Auction created and dynamically initialized");

        return savedAuction;
    }

    @Override
    @Transactional
    public Auction placeBid(Integer auctionId, Integer bidderId, BigDecimal amount) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new IllegalArgumentException("Auction not found."));

        if (!"ACTIVAS".equalsIgnoreCase(auction.getStatus())) {
            auditService.logRejectedBid(auctionId, String.valueOf(bidderId), "Auction is not active");
            throw new IllegalArgumentException("Bids can only be placed on active auctions.");
        }

        LocalDateTime nowUtc = LocalDateTime.now(Clock.systemUTC());
        if (nowUtc.isAfter(auction.getEndDateUtc())) {
            auditService.logRejectedBid(auctionId, String.valueOf(bidderId), "Auction has expired");
            throw new IllegalArgumentException("The auction has already expired.");
        }

        BigDecimal minRequired = auction.getCurrentPrice().add(auction.getMinIncrement());
        if (amount.compareTo(minRequired) < 0) {
            auditService.logRejectedBid(auctionId, String.valueOf(bidderId), "Bid amount lower than minimum increment requirement");
            throw new IllegalArgumentException("Bid amount must be at least current price plus minimum increment.");
        }

        Integer previousWinnerId = auction.getCurrentWinnerId();
        BigDecimal previousPrice = auction.getCurrentPrice();

        try {
            walletService.processBidGuarantee(auctionId, previousWinnerId, bidderId, previousPrice, amount);
        } catch (IllegalArgumentException e) {
            auditService.logRejectedBid(auctionId, String.valueOf(bidderId), e.getMessage());
            throw e;
        }

        auction.setCurrentWinnerId(bidderId);
        auction.setCurrentPrice(amount);

        long secondsLeft = Duration.between(nowUtc, auction.getEndDateUtc()).toSeconds();
        if (secondsLeft <= 60) {
            auction.setEndDateUtc(auction.getEndDateUtc().plusMinutes(2));
            auditService.logTimeExtension(auctionId, 2, "Triggered within critical 60-second close window.");
        }

        return auctionRepository.save(auction);
    }

    @Override
    @Transactional
    public void liquidateExpiredAuction(Auction auction) {
        if (auction.getCurrentWinnerId() != null) {
            walletService.settleAuctionPayment(auction.getId(), auction.getSellerId(), auction.getCurrentWinnerId(), auction.getCurrentPrice());
            auction.setStatus("FINALIZADAS");
            auditService.logStateChange(auction.getId(), "ACTIVAS", "FINALIZADAS", "Auction processed by worker and closed with winner");
        } else {
            auction.setStatus("DESIERTAS");
            auditService.logStateChange(auction.getId(), "ACTIVAS", "DESIERTAS", "Auction processed by worker and closed with no bids");
        }
        auctionRepository.save(auction);
    }
}