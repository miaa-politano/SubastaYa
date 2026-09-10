/**
 * @author MIA
 * @project SubastaYa - Financial Microservice
 * @sprint Sprint 1
 * @date 2026-09-10 09:55
 * @description Persistence entity mapping the WALLET table with Optimistic Locking.
 */
package org.example.domain.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "WALLET")
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "USER_ID", nullable = false, unique = true)
    private Long userId;

    @Column(name = "TOTAL_BALANCE", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalBalance;

    @Column(name = "LOCKED_BALANCE", nullable = false, precision = 18, scale = 2)
    private BigDecimal lockedBalance;

    @Column(name = "AVAILABLE_BALANCE", nullable = false, precision = 18, scale = 2)
    private BigDecimal availableBalance;

    @Version
    @Column(name = "VERSION")
    private Integer version;

    public Wallet() {
    }

    public Wallet(Long userId, BigDecimal totalBalance, BigDecimal lockedBalance, BigDecimal availableBalance) {
        this.userId = userId;
        this.totalBalance = totalBalance;
        this.lockedBalance = lockedBalance;
        this.availableBalance = availableBalance;
    }

    public void deposit(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Deposit amount must be positive");
        }
        this.totalBalance = this.totalBalance.add(amount);
        this.availableBalance = this.availableBalance.add(amount);
    }

    public void lockFunds(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount to lock must be positive");
        }
        if (this.availableBalance.compareTo(amount) < 0) {
            throw new IllegalStateException("Insufficient available funds to escrow");
        }
        this.lockedBalance = this.lockedBalance.add(amount);
        this.availableBalance = this.availableBalance.subtract(amount);
    }

    public void unlockFunds(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount to unlock must be positive");
        }
        if (this.lockedBalance.compareTo(amount) < 0) {
            throw new IllegalStateException("Cannot unlock more funds than currently locked");
        }
        this.lockedBalance = this.lockedBalance.subtract(amount);
        this.availableBalance = this.availableBalance.add(amount);
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public BigDecimal getTotalBalance() {
        return totalBalance;
    }

    public void setTotalBalance(BigDecimal totalBalance) {
        this.totalBalance = totalBalance;
    }

    public BigDecimal getLockedBalance() {
        return lockedBalance;
    }

    public void setLockedBalance(BigDecimal lockedBalance) {
        this.lockedBalance = lockedBalance;
    }

    public BigDecimal getAvailableBalance() {
        return availableBalance;
    }

    public void setAvailableBalance(BigDecimal availableBalance) {
        this.availableBalance = availableBalance;
    }

    public Integer getVersion() {
        return version;
    }
}