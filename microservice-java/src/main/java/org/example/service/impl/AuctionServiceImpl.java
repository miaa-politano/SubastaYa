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

    public AuctionServiceImpl(AuctionRepository auctionRepository, WalletService walletService, AuditService auditService) {
        this.auctionRepository = auctionRepository;
        this.walletService = walletService;
        this.auditService = auditService;
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

        LocalDateTime nowUtc = LocalDateTime.now(Clock.systemUTC());
        if (nowUtc.isAfter(auction.getEndDateUtc())) {
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

        long secondsLeft = Duration.between(nowUtc, auction.getEndDateUtc()).toSeconds();
        if (secondsLeft <= 60) {
            auction.setEndDateUtc(auction.getEndDateUtc().plusMinutes(2));
            auditService.logTimeExtension(auctionId, 2, "Anti-sniping triggered.");
        }

        return auctionRepository.saveAndFlush(auction);
    }

    @Override
    @Transactional
    public void liquidateExpiredAuction(Auction auction) {
        if (auction.getCurrentWinnerId() != null) {
            walletService.settleAuctionPayment(auction.getId(), auction.getSellerId(), auction.getCurrentWinnerId(), auction.getCurrentPrice());
            auction.setStatus("FINALIZADAS");
        } else {
            auction.setStatus("DESIERTAS");
        }
        auctionRepository.save(auction);
    }
}