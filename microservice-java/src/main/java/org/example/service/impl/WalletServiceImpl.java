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

        return new WalletBalanceResponse(
                wallet.getTotalBalance(),
                wallet.getLockedBalance(),
                wallet.getAvailableBalance()
        );
    }

    @Override
    @Transactional
    public void depositFunds(DepositFundsRequest request) {
        Integer mappedUserId = (request.userId() != null) ? request.userId().intValue() : null;

        Wallet wallet = walletRepository.findByUserId(mappedUserId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found for user ID: " + mappedUserId));

        wallet.setTotalBalance(wallet.getTotalBalance().add(request.amount()));
        wallet.setAvailableBalance(wallet.getAvailableBalance().add(request.amount()));
        walletRepository.save(wallet);

        TransactionLedger ledger = new TransactionLedger();
        ledger.setWallet(wallet);
        ledger.setType("DEPOSIT");
        ledger.setAmount(request.amount());
        ledger.setDescription("User financial fund deposit injection");
        ledger.setCreatedAtUtc(LocalDateTime.now());
        transactionLedgerRepository.save(ledger);
    }
}
