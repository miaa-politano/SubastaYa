package org.example.service.impl;

import org.example.api.contracts.CreateAuctionRequest;
import org.example.domain.entities.Auction;
import org.example.domain.entities.Wallet;
import org.example.domain.entities.TransactionLedger;
import org.example.domain.repositories.AuctionRepository;
import org.example.domain.repositories.WalletRepository;
import org.example.domain.repositories.TransactionLedgerRepository;
import org.example.service.AuctionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class AuctionServiceImpl implements AuctionService {

    private final AuctionRepository auctionRepository;
    private final WalletRepository walletRepository;
    private final TransactionLedgerRepository transactionLedgerRepository;

    public AuctionServiceImpl(
            AuctionRepository auctionRepository,
            WalletRepository walletRepository,
            TransactionLedgerRepository transactionLedgerRepository) {
        this.auctionRepository = auctionRepository;
        this.walletRepository = walletRepository;
        this.transactionLedgerRepository = transactionLedgerRepository;
    }

    @Override
    public Page<Auction> getCatalog(Integer categoryId, String status, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        BigDecimal finalMinPrice = (minPrice == null) ? BigDecimal.ZERO : minPrice;
        BigDecimal finalMaxPrice = (maxPrice == null) ? new BigDecimal("9999999999") : maxPrice;

        if (finalMinPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El precio minimo de busqueda no puede ser negativo.");
        }

        if (finalMaxPrice.compareTo(finalMinPrice) < 0) {
            throw new IllegalArgumentException("El precio maximo de busqueda no puede ser menor que el precio minimo.");
        }

        return auctionRepository.findByFiltersPaginated(categoryId, status, finalMinPrice, finalMaxPrice, pageable);
    }

    @Override
    @Transactional
    public Auction createAuction(CreateAuctionRequest request) {
        if (request.endDateUtc().isBefore(request.startDateUtc()) || request.endDateUtc().isEqual(request.startDateUtc())) {
            throw new IllegalArgumentException("La fecha de finalizacion debe ser posterior a la fecha de inicio.");
        }

        if (request.startingPrice().compareTo(BigDecimal.ZERO) <= 0 || request.minIncrement().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El precio inicial y el incremento minimo deben ser mayores a cero.");
        }

        Auction auction = new Auction();
        auction.setSellerId(request.sellerId());
        auction.setTitle(request.title());
        auction.setDescription(request.description());
        auction.setStartingPrice(request.startingPrice());
        auction.setCurrentPrice(request.startingPrice());
        auction.setMinIncrement(request.minIncrement());
        auction.setStartDateUtc(request.startDateUtc());
        auction.setEndDateUtc(request.endDateUtc());
        auction.setStatus("PROXIMAS");

        return auctionRepository.save(auction);
    }

    @Override
    @Transactional
    public void liquidateExpiredAuction(Auction auction) {
        LocalDateTime now = LocalDateTime.now();

        if (auction.getCurrentWinnerId() != null) {
            Wallet buyerWallet = walletRepository.findByUserId(auction.getCurrentWinnerId())
                    .orElseThrow(() -> new RuntimeException("Buyer wallet not found"));
            Wallet sellerWallet = walletRepository.findByUserId(auction.getSellerId())
                    .orElseThrow(() -> new RuntimeException("Seller wallet not found"));

            buyerWallet.setLockedBalance(buyerWallet.getLockedBalance().subtract(auction.getCurrentPrice()));
            buyerWallet.setTotalBalance(buyerWallet.getTotalBalance().subtract(auction.getCurrentPrice()));

            sellerWallet.setTotalBalance(sellerWallet.getTotalBalance().add(auction.getCurrentPrice()));
            sellerWallet.setAvailableBalance(sellerWallet.getAvailableBalance().add(auction.getCurrentPrice()));

            walletRepository.save(buyerWallet);
            walletRepository.save(sellerWallet);

            TransactionLedger buyerLog = new TransactionLedger();
            buyerLog.setWallet(buyerWallet);
            buyerLog.setType("DEBIT");
            buyerLog.setAmount(auction.getCurrentPrice());
            buyerLog.setDescription("Debit for winning auction ID: " + auction.getId());
            buyerLog.setCreatedAtUtc(now);
            transactionLedgerRepository.save(buyerLog);

            TransactionLedger sellerLog = new TransactionLedger();
            sellerLog.setWallet(sellerWallet);
            sellerLog.setType("CREDIT");
            sellerLog.setAmount(auction.getCurrentPrice());
            sellerLog.setDescription("Credit for successful sale on auction ID: " + auction.getId());
            sellerLog.setCreatedAtUtc(now);
            transactionLedgerRepository.save(sellerLog);

            auction.setStatus("FINALIZED");
        } else {
            auction.setStatus("DESERTED");
        }

        auctionRepository.save(auction);
    }
}