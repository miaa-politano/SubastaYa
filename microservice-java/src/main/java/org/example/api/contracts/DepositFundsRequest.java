package org.example.api.contracts;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record DepositFundsRequest(
        @NotNull(message = "El ID de usuario es obligatorio")
        Integer userId,
        @NotNull(message = "El monto de deposito es obligatorio")
        @Positive(message = "El monto de deposito debe ser mayor a cero")
        BigDecimal amount
) {}