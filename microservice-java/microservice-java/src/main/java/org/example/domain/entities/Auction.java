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

    @Column(name = "SELLER_ID", nullable = false)
    private Integer sellerId;

    @Column(name = "CURRENT_WINNER_ID")
    private Integer currentWinnerId;

    @Column(name = "TITLE", nullable = false, length = 150)
    private String title;

    @Column(name = "DESCRIPTION", nullable = false, length = 500)
    private String description;

    @Column(name = "STARTING_PRICE", nullable = false, precision = 18, scale = 2)
    private BigDecimal startingPrice;

    @Column(name = "CURRENT_PRICE", nullable = false, precision = 18, scale = 2)
    private BigDecimal currentPrice;

    @Column(name = "MIN_INCREMENT", nullable = false, precision = 18, scale = 2)
    private BigDecimal minIncrement;

    @Column(name = "START_DATE_UTC", nullable = false)
    private LocalDateTime startDateUtc;

    @Column(name = "END_DATE_UTC", nullable = false)
    private LocalDateTime endDateUtc;

    @Column(name = "STATUS", nullable = false, length = 50)
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CATEGORY_ID", nullable = false)
    private Category category;

    @Version
    @Column(name = "VERSION", nullable = false)
    private Long version;

    public Auction() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getSellerId() { return sellerId; }
    public void setSellerId(Integer sellerId) { this.sellerId = sellerId; }
    public Integer getCurrentWinnerId() { return currentWinnerId; }
    public void setCurrentWinnerId(Integer currentWinnerId) { this.currentWinnerId = currentWinnerId; }
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
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
}