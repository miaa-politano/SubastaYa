/**
 * @author MIA
 * @project SubastaYa - Financial Microservice
 * @sprint Sprint 1
 * @date 2026-09-13 15:00
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
    private Integer id;

    @Column(name = "USER_ID", nullable = false, unique = true)
    private Integer userId;

    @Column(name = "TOTAL_BALANCE", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalBalance;

    @Column(name = "LOCKED_BALANCE", nullable = false, precision = 18, scale = 2)
    private BigDecimal lockedBalance;

    @Column(name = "AVAILABLE_BALANCE", nullable = false, precision = 18, scale = 2)
    private BigDecimal availableBalance;

    @Version
    @Column(name = "VERSION", nullable = false)
    private Long version;

    public Wallet() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
    public BigDecimal getTotalBalance() { return totalBalance; }
    public void setTotalBalance(BigDecimal totalBalance) { this.totalBalance = totalBalance; }
    public BigDecimal getLockedBalance() { return lockedBalance; }
    public void setLockedBalance(BigDecimal lockedBalance) { this.lockedBalance = lockedBalance; }
    public BigDecimal getAvailableBalance() { return availableBalance; }
    public void setAvailableBalance(BigDecimal availableBalance) { this.availableBalance = availableBalance; }
    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
}