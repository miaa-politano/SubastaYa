using Microsoft.AspNetCore.Mvc;
using SubastaYa.Api.Contracts;
using SubastaYa.Domain.DTOs;
using SubastaYa.Domain.Interfaces;

namespace SubastaYa.Api.Controllers;

[ApiController]
[Route("api/internal/auctions")]
public sealed class InternalAuctionEventsController : ControllerBase
{
    private const string ApiKeyHeader = "X-Internal-Api-Key";
    private readonly IAuctionEventRelayService _relayService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<InternalAuctionEventsController> _logger;

    public InternalAuctionEventsController(IAuctionEventRelayService relayService, IConfiguration configuration, ILogger<InternalAuctionEventsController> logger)
    {
        _relayService = relayService;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpPost("notify-event")]
    public async Task<IActionResult> NotifyEvent([FromBody] AuctionEventRequest request, CancellationToken cancellationToken)
    {
        var configuredApiKey = _configuration["InternalApiKey"] ?? Environment.GetEnvironmentVariable("INTERNAL_API_KEY");
        if (string.IsNullOrWhiteSpace(configuredApiKey) || !Request.Headers.TryGetValue(ApiKeyHeader, out var suppliedApiKey) ||
            !string.Equals(suppliedApiKey.ToString(), configuredApiKey, StringComparison.Ordinal))
            return Unauthorized();

        var errors = request.Validate();
        if (errors.Count > 0) return ValidationProblem(new ValidationProblemDetails(errors));

        var notification = new AuctionEventNotification(request.EventId!.Value, request.AuctionId!.Value, request.EventType!,
            request.NewAmount, request.BidderId, request.BidderUsername, request.NewEndDateUtc, request.EventTimestampUtc!.Value,
            request.AvailableBalance, request.LockedBalance, request.TotalBalance, request.AuctionStatus, request.WinnerUsername);

        _logger.LogInformation("Received internal auction event {EventId} for auction {AuctionId}", notification.EventId, notification.AuctionId);
        var relayed = await _relayService.ProcessAsync(notification, cancellationToken);
        return Accepted(new { eventId = notification.EventId, status = relayed ? "Relayed" : "Duplicate" });
    }
}
