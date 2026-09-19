package org.example.domain.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "AUCTION")
public class Auction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "SELLER_ID")
    private Integer sellerId;

    @Column(name = "CURRENT_WINNER_ID")
    private Integer currentWinnerId;

    @Column(name = "CATEGORY_ID")
    private Integer categoryId;

    @Column(name = "TITLE")
    private String title;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "STARTING_PRICE")
    private BigDecimal startingPrice;

    @Column(name = "CURRENT_PRICE")
    private BigDecimal currentPrice;

    @Column(name = "MIN_INCREMENT")
    private BigDecimal minIncrement;

    @Column(name = "START_DATE_UTC")
    private LocalDateTime startDateUtc;

    @Column(name = "END_DATE_UTC")
    private LocalDateTime endDateUtc;

    @Column(name = "STATUS")
    private String status;

    @Version
    @Column(name = "VERSION")
    private Long version;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getSellerId() { return sellerId; }
    public void setSellerId(Integer sellerId) { this.sellerId = sellerId; }
    public Integer getCurrentWinnerId() { return currentWinnerId; }
    public void setCurrentWinnerId(Integer currentWinnerId) { this.currentWinnerId = currentWinnerId; }
    public Integer getCategoryId() { return categoryId; }
    public void setCategoryId(Integer categoryId) { this.categoryId = categoryId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getStartingPrice() { return startingPrice; }
    public void setStartingPrice(BigDecimal startingPrice) { this.startingPrice = startingPrice; }
    public BigDecimal getCurrentPrice() { return currentPrice; }
    public void setCurrentPrice(BigDecimal currentPrice) { this.currentPrice = currentPrice; }
    public BigDecimal getMinIncrement() { return minIncrement; }
    public void setMinIncrement(BigDecimal minIncrement) { this.minIncrement = minIncrement; }
    public LocalDateTime getStartDateUtc() { return startDateUtc; }
    public void setStartDateUtc(LocalDateTime startDateUtc) { this.startDateUtc = startDateUtc; }
    public LocalDateTime getEndDateUtc() { return endDateUtc; }
    public void setEndDateUtc(LocalDateTime endDateUtc) { this.endDateUtc = endDateUtc; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
}