package org.example.service;

import org.example.api.contracts.DepositFundsRequest;
import org.example.api.contracts.WalletBalanceResponse;

public interface WalletService {
    WalletBalanceResponse getUserBalance(Integer userId);
    void depositFunds(DepositFundsRequest request);
}