package org.example.domain.entities;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "AUCTION")
public class Auction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "category_id")
    public Category category;

    public String status;
    public BigDecimal currentPrice;
    private LocalDateTime endTime;
}