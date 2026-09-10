/**
 * @author MIA
 * @project SubastaYa - Financial Microservice
 * @sprint Sprint 1
 * @date 2026-09-10 20:18
 * @description Persistence entity modeling the immutable transaction audit book.
 */
package org.example.domain.entities;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "TRANSACTION_LEDGER")
public class TransactionLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "WALLET_ID", nullable = false)
    private Wallet wallet;

    @Column(name = "TYPE", nullable = false)
    private String movementType;

    @Column(name = "AMOUNT", nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(name = "DESCRIPTION", nullable = false)
    private String description;

    @Column(name = "CREATED_AT_UTC", nullable = false)
    private LocalDateTime timestamp;

    public TransactionLedger() {
    }

    public TransactionLedger(Wallet wallet, String movementType, BigDecimal amount, String description) {
        this.wallet = wallet;
        this.movementType = movementType;
        this.amount = amount;
        this.description = description;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Wallet getWallet() {
        return wallet;
    }

    public String getMovementType() {
        return movementType;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getDescription() {
        return description;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}