package org.example.api.controllers;

import jakarta.validation.Valid;
import org.example.api.contracts.CreateAuctionRequest;
import org.example.domain.entities.Auction;
import org.example.service.AuctionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/auctions")
public class AuctionController {

    private final AuctionService auctionService;

    public AuctionController(AuctionService auctionService) {
        this.auctionService = auctionService;
    }

    @GetMapping
    public ResponseEntity<Page<Auction>> getAuctionsCatalog(
            @RequestParam(value = "categoryId", required = false) Integer categoryId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "minPrice", required = false) BigDecimal minPrice,
            @RequestParam(value = "maxPrice", required = false) BigDecimal maxPrice,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(auctionService.getCatalog(categoryId, status, minPrice, maxPrice, pageable));
    }

    @PostMapping
    public ResponseEntity<?> createAuction(@Valid @RequestBody CreateAuctionRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(auctionService.createAuction(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/bids")
    public ResponseEntity<?> placeBid(@PathVariable("id") Integer id, @Valid @RequestBody LocalPlaceBidRequest request) {
        try {
            return ResponseEntity.ok(auctionService.placeBid(id, request.bidderId(), request.amount()));
        } catch (org.springframework.dao.ConcurrencyFailureException |
                 org.springframework.transaction.TransactionSystemException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("HTTP 409 Conflict: Otro postor ha enviado una puja superior simultáneamente.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    public record LocalPlaceBidRequest(Integer bidderId, BigDecimal amount) {}
}