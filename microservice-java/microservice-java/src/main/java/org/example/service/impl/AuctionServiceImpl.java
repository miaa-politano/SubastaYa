package org.example.service.impl;

import org.example.domain.entities.Auction;
import org.example.domain.repositories.AuctionRepository;
import org.example.service.AuctionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
public class AuctionServiceImpl implements AuctionService {

    private final AuctionRepository auctionRepository;

    @Autowired
    public AuctionServiceImpl(AuctionRepository auctionRepository) {
        this.auctionRepository = auctionRepository;
    }
    @Override
    public Page<Auction> getCatalog(Long categoryId, String status, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        BigDecimal finalMinPrice = (minPrice == null) ? BigDecimal.ZERO : minPrice;
        BigDecimal finalMaxPrice = (maxPrice == null) ? new BigDecimal("9999999999") : maxPrice;

        if (finalMinPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El precio mínimo de búsqueda no puede ser negativo.");
        }

        if (finalMaxPrice.compareTo(finalMinPrice) < 0) {
            throw new IllegalArgumentException("El precio máximo de búsqueda no puede ser menor que el precio mínimo.");
        }
        return auctionRepository.findByFiltersPaginated(categoryId, status, finalMinPrice, finalMaxPrice, pageable);
    }
}