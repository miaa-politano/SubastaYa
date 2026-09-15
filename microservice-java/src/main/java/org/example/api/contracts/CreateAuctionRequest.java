package org.example.api.contracts;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CreateAuctionRequest(
        @NotNull(message = "El ID del vendedor es obligatorio")
        Integer sellerId,

        @NotNull(message = "El ID de la categoría es obligatorio")
        Integer categoryId,

        @NotBlank(message = "El título no puede estar vacío")
        @Size(max = 150, message = "El título no puede superar los 150 caracteres")
        String title,

        @NotBlank(message = "La descripción no puede estar vacía")
        @Size(max = 500, message = "La descripción no puede superar los 500 caracteres")
        String description,

        @NotNull(message = "El precio inicial es obligatorio")
        @Positive(message = "El precio inicial debe ser mayor a cero")
        BigDecimal startingPrice,

        @NotNull(message = "El incremento mínimo es obligatorio")
        @Positive(message = "El incremento mínimo debe ser mayor a cero")
        BigDecimal minIncrement,

        @NotNull(message = "La fecha de inicio es obligatoria")
        @FutureOrPresent(message = "La fecha de inicio no puede ser en el pasado")
        LocalDateTime startDateUtc,

        @NotNull(message = "La fecha de finalización es obligatoria")
        @Future(message = "La fecha de finalización debe ser en el futuro")
        LocalDateTime endDateUtc
) {}