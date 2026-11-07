package org.example.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;

@Component
public class RealtimeEventPublisher {
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String baseUrl;
    private final String eventsPath;
    private final String internalApiKey;
    private final long requestTimeoutMs;

    public RealtimeEventPublisher(
            ObjectMapper objectMapper,
            @Value("${subastaya.realtime.base-url}") String baseUrl,
            @Value("${subastaya.realtime.events-path}") String eventsPath,
            @Value("${subastaya.realtime.internal-api-key}") String internalApiKey,
            @Value("${subastaya.realtime.connect-timeout-ms:2000}") long connectTimeoutMs,
            @Value("${subastaya.realtime.request-timeout-ms:3000}") long requestTimeoutMs) {
        this.objectMapper = objectMapper;
        this.baseUrl = baseUrl;
        this.eventsPath = eventsPath;
        this.internalApiKey = internalApiKey;
        this.requestTimeoutMs = requestTimeoutMs;
        this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofMillis(connectTimeoutMs)).build();
    }

    public CompletableFuture<DeliveryResult> publishEvent(AuctionEvent event) {
        try {
            return publishPayload(event.eventId(), event.eventType(), objectMapper.writeValueAsString(event));
        } catch (Exception exception) {
            return CompletableFuture.failedFuture(exception);
        }
    }

    public CompletableFuture<DeliveryResult> publishPayload(String eventId, String eventType, String payload) {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + eventsPath))
                .header("Content-Type", "application/json")
                .header("X-Internal-Api-Key", internalApiKey)
                .timeout(Duration.ofMillis(requestTimeoutMs))
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();

        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(response -> new DeliveryResult(response.statusCode(), response.body()))
                .whenComplete((result, error) -> {
                    if (error != null) {
                        System.err.println("[RealtimeEventPublisher] eventId=" + eventId + " type=" + eventType + " error=" + error.getMessage());
                    } else {
                        System.out.println("[RealtimeEventPublisher] eventId=" + eventId + " type=" + eventType + " status=" + result.statusCode());
                    }
                });
    }

    public record DeliveryResult(int statusCode, String responseBody) {
        public boolean accepted() { return statusCode == 202; }
        public boolean retryable() { return statusCode >= 500 || statusCode == 408 || statusCode == 429; }
    }
}
