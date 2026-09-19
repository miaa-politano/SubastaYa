package org.example.domain.repositories;

import org.example.domain.entities.Auction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Repository
public interface AuctionRepository extends JpaRepository<Auction, Integer> {

    @Query("SELECT a FROM Auction a WHERE " +
            "(:categoryId IS NULL OR a.categoryId = :categoryId) AND " +
            "(:status IS NULL OR a.status = :status) AND " +
            "(:minPrice IS NULL OR a.currentPrice >= :minPrice) AND " +
            "(:maxPrice IS NULL OR a.currentPrice <= :maxPrice)")
    Page<Auction> findByFiltersPaginated(
            @Param("categoryId") Integer categoryId,
            @Param("status") String status,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable
    );

    Page<Auction> findByEndDateUtcBeforeAndStatus(LocalDateTime dateTime, String status, Pageable pageable);
}
