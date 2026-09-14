package org.example.service.impl;

import org.example.api.contracts.CreateAuctionRequest;
import org.example.domain.entities.Auction;
import org.example.domain.repositories.AuctionRepository;
import org.example.service.AuctionService;
import org.example.service.AuditService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;

@Service
public class AuctionServiceImpl implements AuctionService {

    private final AuctionRepository auctionRepository;
    private final AuditService auditService;

    public AuctionServiceImpl(AuctionRepository auctionRepository, AuditService auditService) {
        this.auctionRepository = auctionRepository;
        this.auditService = auditService;
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

    @Override
    @Transactional
    public Auction createAuction(CreateAuctionRequest request) {
        if (request.endDateUtc().isBefore(request.startDateUtc()) || request.endDateUtc().isEqual(request.startDateUtc())) {
            throw new IllegalArgumentException("La fecha de finalización debe ser posterior a la fecha de inicio.");
        }

        Auction auction = new Auction();
        auction.setTitle(request.title());
        auction.setDescription(request.description());
        auction.setStartingPrice(request.startingPrice());
        auction.setCurrentPrice(request.startingPrice());
        auction.setMinIncrement(request.minIncrement());
        auction.setStartDateUtc(request.startDateUtc());
        auction.setEndDateUtc(request.endDateUtc());
        auction.setStatus("PROGRAMMED");

        Auction savedAuction = auctionRepository.save(auction);

        // Registramos el evento inicial en el log inmutable de auditoría usando el id Long nativo
        auditService.logStateChange(
                savedAuction.getId(),
                null,
                "PROGRAMMED",
                "Subasta creada e inicializada en estado programado automáticamente."
        );

        return savedAuction;
    }
}