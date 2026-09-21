package org.example.api.controllers;

import jakarta.validation.Valid;
import org.example.api.contracts.DepositFundsRequest;
import org.example.api.contracts.WalletBalanceResponse;
import org.example.service.WalletService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/wallet")
@Tag(name = "Wallets")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping("/balance")
    @Operation(summary = "Get wallet balance breakdown")
    public ResponseEntity<WalletBalanceResponse> getBalance(@RequestParam("userId") Integer userId) {
        try {
            return ResponseEntity.ok(walletService.getUserBalance(userId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/deposit")
    @Operation(summary = "Create financial transaction")
    public ResponseEntity<?> deposit(@Valid @RequestBody DepositFundsRequest request) {
        if (request.amount() == null || request.amount().compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body("El monto de deposito debe ser mayor a cero.");
        }
        try {
            walletService.depositFunds(request);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}