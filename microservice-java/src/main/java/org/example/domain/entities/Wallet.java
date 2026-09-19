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

    @Column(name = "USER_ID")
    private Integer userId;

    @Column(name = "TOTAL_BALANCE")
    private BigDecimal totalBalance;

    @Column(name = "LOCKED_BALANCE")
    private BigDecimal lockedBalance;

    @Column(name = "AVAILABLE_BALANCE")
    private BigDecimal availableBalance;

    @Version
    @Column(name = "VERSION")
    private Long version;

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