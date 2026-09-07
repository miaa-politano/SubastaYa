package org.example.api.contracts;

import java.math.BigDecimal;

public record DepositFundsRequest(
        Long userId,
        BigDecimal amount
) {}
