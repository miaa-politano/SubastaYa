package org.example.api.contracts;

import java.math.BigDecimal;

public record WalletBalanceResponse(
        BigDecimal totalBalance,
        BigDecimal lockedBalance,
        BigDecimal availableBalance
) {}
