/**
 * @author MIA
 * @project SubastaYa - Financial Microservice
 * @sprint Sprint 1
 * @date 2026-09-10 10:40
 * @description REST Controller exposing baseline wallet and escrow endpoints.
 */
package org.example.api.controllers;

import org.example.api.contracts.DepositFundsRequest;
import org.example.api.contracts.WalletBalanceResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/wallets")
@Tag(name = "Wallets", description = "Endpoints for virtual wallet financial management (Escrow)")
public class WalletController {

    @GetMapping
    @Operation(summary = "Get wallet balance breakdown", description = "Returns total, locked, and available balances for the specified user")
    @ApiResponse(responseCode = "200", description = "Balances retrieved successfully")
    public ResponseEntity<WalletBalanceResponse> getBalance(@RequestParam Long userId) {
        WalletBalanceResponse mockResponse = new WalletBalanceResponse(
                new BigDecimal("555000.00"),
                new BigDecimal("450000.00"),
                new BigDecimal("105000.00")
        );
        return ResponseEntity.ok(mockResponse);
    }

    @PostMapping("/transactions")
    @Operation(summary = "Create financial transaction", description = "Allows creating a new ledger movement to upload funds into the user's virtual wallet")
    @ApiResponse(responseCode = "200", description = "Deposit processed successfully")
    @ApiResponse(responseCode = "400", description = "Invalid amount or bad request data")
    public ResponseEntity<Void> deposit(@RequestBody DepositFundsRequest request) {
        if (request.amount() == null || request.amount().compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }
}