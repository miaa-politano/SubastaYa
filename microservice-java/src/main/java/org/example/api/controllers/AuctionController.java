package org.example.api.controllers;

import jakarta.validation.Valid;
import org.example.api.contracts.CreateAuctionRequest;
import org.example.domain.entities.Auction;
import org.example.service.AuctionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/auctions")
public class AuctionController {

    private final AuctionService auctionService;

    @Autowired
    public AuctionController(AuctionService auctionService) {
        this.auctionService = auctionService;
    }

    @GetMapping
    public ResponseEntity<Page<Auction>> getAuctionsCatalog(
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,asc") String[] sort) {

        String sortField = sort[0];
        Sort.Direction direction = sort.length > 1 && sort[1].equalsIgnoreCase("desc")
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));
        Page<Auction> auctionsPage = auctionService.getCatalog(categoryId, status, minPrice, maxPrice, pageable);

        return ResponseEntity.ok(auctionsPage);
    }

    @PostMapping
    public ResponseEntity<?> createAuction(@Valid @RequestBody CreateAuctionRequest request) {
        if (request.endDateUtc().isBefore(request.startDateUtc()) || request.endDateUtc().isEqual(request.startDateUtc())) {
            return ResponseEntity.badRequest().body("La fecha de finalización debe ser posterior a la fecha de inicio.");
        }

        try {
            Auction savedAuction = auctionService.createAuction(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedAuction);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}