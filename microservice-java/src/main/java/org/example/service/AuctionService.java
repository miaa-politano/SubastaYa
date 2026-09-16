package org.example.service;

import org.example.api.contracts.CreateAuctionRequest;
import org.example.domain.entities.Auction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;

public interface AuctionService {

    Page<Auction> getCatalog(Integer categoryId, String status, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);

    Auction createAuction(CreateAuctionRequest request);

    void liquidateExpiredAuction(Auction auction);
}