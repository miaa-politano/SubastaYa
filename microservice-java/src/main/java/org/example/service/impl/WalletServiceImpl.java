package org.example.service.impl;

import org.example.api.contracts.DepositFundsRequest;
import org.example.api.contracts.WalletBalanceResponse;
import org.example.domain.entities.Wallet;
import org.example.domain.entities.TransactionLedger;
import org.example.domain.repositories.WalletRepository;
import org.example.domain.repositories.TransactionLedgerRepository;
import org.example.service.WalletService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDateTime;

@Service
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;
    private final TransactionLedgerRepository transactionLedgerRepository;

    public WalletServiceImpl(WalletRepository walletRepository, TransactionLedgerRepository transactionLedgerRepository) {
        this.walletRepository = walletRepository;
        this.transactionLedgerRepository = transactionLedgerRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public WalletBalanceResponse getUserBalance(Integer userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found for user ID: " + userId));
        return new WalletBalanceResponse(wallet.getTotalBalance(), wallet.getLockedBalance(), wallet.getAvailableBalance());
    }

    @Override
    @Transactional
    public void depositFunds(DepositFundsRequest request) {
        if (request.userId() == null) {
            throw new IllegalArgumentException("User ID parameter cannot be null.");
        }
        Integer userId = request.userId();
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found for user ID: " + userId));

        wallet.setTotalBalance(wallet.getTotalBalance().add(request.amount()));
        wallet.setAvailableBalance(wallet.getAvailableBalance().add(request.amount()));
        walletRepository.save(wallet);

        TransactionLedger ledger = new TransactionLedger();
        ledger.setWallet(wallet);
        ledger.setType("DEPOSIT");
        ledger.setAmount(request.amount());
        ledger.setDescription("User financial fund deposit injection");
        ledger.setCreatedAtUtc(LocalDateTime.now(Clock.systemUTC()));
        transactionLedgerRepository.save(ledger);
    }

    @Override
    @Transactional
    public void settleAuctionPayment(Integer auctionId, Integer sellerId, Integer buyerId, BigDecimal amount) {
        LocalDateTime nowUtc = LocalDateTime.now(Clock.systemUTC());
        Wallet buyerWallet = walletRepository.findByUserId(buyerId)
                .orElseThrow(() -> new RuntimeException("Buyer wallet not found"));
        Wallet sellerWallet = walletRepository.findByUserId(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller wallet not found"));

        if (buyerWallet.getLockedBalance().compareTo(amount) >= 0) {
            buyerWallet.setLockedBalance(buyerWallet.getLockedBalance().subtract(amount));
        } else {
            buyerWallet.setLockedBalance(BigDecimal.ZERO);
        }
        buyerWallet.setTotalBalance(buyerWallet.getTotalBalance().subtract(amount));
        buyerWallet.setAvailableBalance(buyerWallet.getTotalBalance().subtract(buyerWallet.getLockedBalance()));

        sellerWallet.setTotalBalance(sellerWallet.getTotalBalance().add(amount));
        sellerWallet.setAvailableBalance(sellerWallet.getAvailableBalance().add(amount));

        walletRepository.save(buyerWallet);
        walletRepository.save(sellerWallet);

        TransactionLedger buyerLog = new TransactionLedger();
        buyerLog.setWallet(buyerWallet);
        buyerLog.setType("DEBIT");
        buyerLog.setAmount(amount);
        buyerLog.setDescription("Debit for winning auction ID: " + auctionId);
        buyerLog.setCreatedAtUtc(nowUtc);
        transactionLedgerRepository.save(buyerLog);

        TransactionLedger sellerLog = new TransactionLedger();
        sellerLog.setWallet(sellerWallet);
        sellerLog.setType("CREDIT");
        sellerLog.setAmount(amount);
        sellerLog.setDescription("Credit for successful sale on auction ID: " + auctionId);
        sellerLog.setCreatedAtUtc(nowUtc);
        transactionLedgerRepository.save(sellerLog);
    }

    @Override
    @Transactional
    public void processBidGuarantee(Integer auctionId, Integer previousWinnerId, Integer newBidderId, BigDecimal currentPrice, BigDecimal newAmount) {
        LocalDateTime nowUtc = LocalDateTime.now(Clock.systemUTC());

        if (previousWinnerId != null) {
            Wallet previousWinnerWallet = walletRepository.findByUserId(previousWinnerId)
                    .orElseThrow(() -> new IllegalStateException("Previous winner wallet not found."));
            previousWinnerWallet.setLockedBalance(previousWinnerWallet.getLockedBalance().subtract(currentPrice));
            previousWinnerWallet.setAvailableBalance(previousWinnerWallet.getAvailableBalance().add(currentPrice));
            walletRepository.saveAndFlush(previousWinnerWallet);

            TransactionLedger refundLog = new TransactionLedger();
            refundLog.setWallet(previousWinnerWallet);
            refundLog.setType("REFUND");
            refundLog.setAmount(currentPrice);
            refundLog.setDescription("Refund due to outbid in auction ID: " + auctionId);
            refundLog.setCreatedAtUtc(nowUtc);
            transactionLedgerRepository.save(refundLog);
        }

        Wallet newBidderWallet = walletRepository.findByUserId(newBidderId)
                .orElseThrow(() -> new IllegalArgumentException("Bidder wallet not found."));

        if (newBidderWallet.getAvailableBalance().compareTo(newAmount) < 0) {
            throw new IllegalArgumentException("Insufficient available balance to cover the bid amount.");
        }

        newBidderWallet.setAvailableBalance(newBidderWallet.getAvailableBalance().subtract(newAmount));
        newBidderWallet.setLockedBalance(newBidderWallet.getLockedBalance().add(newAmount));
        walletRepository.saveAndFlush(newBidderWallet);

        TransactionLedger lockLog = new TransactionLedger();
        lockLog.setWallet(newBidderWallet);
        lockLog.setType("LOCK");
        lockLog.setAmount(newAmount);
        lockLog.setDescription("Escrow retention for leading bid in auction ID: " + auctionId);
        lockLog.setCreatedAtUtc(nowUtc);
        transactionLedgerRepository.save(lockLog);
    }
}