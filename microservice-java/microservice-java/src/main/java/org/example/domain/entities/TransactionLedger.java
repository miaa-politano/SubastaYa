/**
 * @author MIA
 * @project SubastaYa - Financial Microservice
 * @sprint Sprint 1
 * @date 2026-09-05 16:52
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

    @Column(name = "MOVEMENT_TYPE", nullable = false)
    private String movementType;

    @Column(name = "AMOUNT", nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(name = "BID_DATE", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "SUBASTA_ID")
    private Long auctionId;

    public TransactionLedger() {
    }

    public TransactionLedger(Wallet wallet, String movementType, BigDecimal amount, Long auctionId) {
        this.wallet = wallet;
        this.movementType = movementType;
        this.amount = amount;
        this.auctionId = auctionId;
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

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public Long getAuctionId() {
        return auctionId;
    }
}