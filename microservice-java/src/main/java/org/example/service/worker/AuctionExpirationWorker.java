package org.example.service.worker;

import org.springframework.stereotype.Component;
import org.springframework.scheduling.annotation.Scheduled;

@Component
public class AuctionExpirationWorker {

    @Scheduled(fixedRate = 60000)
    public void executeAuctionLiquidation() {
    }
}

