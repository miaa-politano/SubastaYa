/**
 * @author MIA
 * @project SubastaYa - Financial Microservice
 * @sprint Sprint 1
 * @date 2026-09-13 15:00
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
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "WALLET_ID", nullable = false)
    private Wallet wallet;

    @Column(name = "TYPE", nullable = false)
    private String type;

    @Column(name = "AMOUNT", nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(name = "DESCRIPTION", nullable = false)
    private String description;

    @Column(name = "CREATED_AT_UTC", nullable = false)
    private LocalDateTime createdAtUtc;

    public TransactionLedger() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Wallet getWallet() { return wallet; }
    public void setWallet(Wallet wallet) { this.wallet = wallet; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getCreatedAtUtc() { return createdAtUtc; }
    public void setCreatedAtUtc(LocalDateTime createdAtUtc) { this.createdAtUtc = createdAtUtc; }
}