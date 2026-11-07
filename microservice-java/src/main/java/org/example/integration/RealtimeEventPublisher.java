package org.example.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Component
public class RealtimeEventPublisher {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    @Value("${subastaya.realtime.base-url}")
    private String baseUrl;

    @Value("${subastaya.realtime.events-path}")
    private String eventsPath;

    @Value("${subastaya.realtime.internal-api-key}")
    private String internalApiKey;

    @Value("${subastaya.realtime.connect-timeout-ms:2000}")
    private long connectTimeoutMs;

    @Value("${subastaya.realtime.request-timeout-ms:3000}")
    private long requestTimeoutMs;

    public RealtimeEventPublisher(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofMillis(connectTimeoutMs))
                .build();
    }

    public void publishEvent(AuctionEvent event) {
        try {
            String jsonPayload = objectMapper.writeValueAsString(event);
            String targetUrl = baseUrl + eventsPath;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(targetUrl))
                    .header("Content-Type", "application/json")
                    .header("X-Internal-Api-Key", internalApiKey)
                    .timeout(Duration.ofMillis(requestTimeoutMs))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                    .thenAccept(response -> {
                        System.out.println("[RealtimeEventPublisher] Event ID " + event.eventId()
                                + " type " + event.eventType()
                                + " status HTTP: " + response.statusCode());
                    })
                    .exceptionally(ex -> {
                        System.err.println("[RealtimeEventPublisher] Error enviando evento a C#: " + ex.getMessage());
                        return null;
                    });

        } catch (Exception e) {
            System.err.println("[RealtimeEventPublisher] Error serializando evento: " + e.getMessage());
        }
    }
}