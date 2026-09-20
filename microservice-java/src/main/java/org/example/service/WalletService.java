package org.example.service;

import org.example.api.contracts.DepositFundsRequest;
import org.example.api.contracts.WalletBalanceResponse;
import java.math.BigDecimal;

public interface WalletService {
    WalletBalanceResponse getUserBalance(Integer userId);
    void depositFunds(DepositFundsRequest request);
    void settleAuctionPayment(Integer auctionId, Integer sellerId, Integer buyerId, BigDecimal amount);
    void processBidGuarantee(Integer auctionId, Integer previousWinnerId, Integer newBidderId, BigDecimal currentPrice, BigDecimal newAmount);
}