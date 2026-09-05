using Microsoft.AspNetCore.Mvc;
using SubastaYa.Api.Contracts;
using SubastaYa.Api.Models;

namespace SubastaYa.Api.Controllers;

[ApiController]
[Route("api/auctions")]
[Produces("application/json")]
public class AuctionsController : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<AuctionSummaryResponse>), StatusCodes.Status200OK)]
    public IActionResult GetAuctions([FromQuery] string? status, [FromQuery] int? categoryId)
    {
        // Skeletal implementation: application services will fulfill query logic
        return Ok(Array.Empty<AuctionSummaryResponse>());
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(AuctionSummaryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public IActionResult GetAuctionById([FromRoute] int id)
    {
        // Skeletal implementation: returns dummy summary or 404 via service
        return Ok(new AuctionSummaryResponse(
            id,
            "Sample Auction Item",
            "Technology",
            "https://placeholder.com/image.png",
            1000m,
            0,
            DateTime.UtcNow.AddHours(2),
            "ACTIVE"
        ));
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public IActionResult CreateAuction([FromBody] CreateAuctionRequest request)
    {
        // Pre-validation constraint specified in assignment requirements
        if (request.EndDateUtc <= request.StartDateUtc)
        {
            return BadRequest(new ErrorResponse
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Title = "Bad Request - Validation Error",
                Detail = "End date must be strictly later than start date.",
                Instance = HttpContext.Request.Path,
                TimestampUtc = DateTime.UtcNow
            });
        }

        if (request.BasePrice <= 0 || request.MinIncrement <= 0)
        {
            return BadRequest(new ErrorResponse
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Title = "Bad Request - Validation Error",
                Detail = "Base price and minimum increment must be positive values.",
                Instance = HttpContext.Request.Path,
                TimestampUtc = DateTime.UtcNow
            });
        }

        return CreatedAtAction(nameof(GetAuctionById), new { id = 1 }, request);
    }

    [HttpPost("{id:int}/bids")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status422UnprocessableEntity)]
    public IActionResult PlaceBid([FromRoute] int id, [FromBody] PlaceBidRequest request)
    {
        if (request.Amount <= 0)
        {
            return BadRequest(new ErrorResponse
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Title = "Bad Request - Validation Error",
                Detail = "Bid amount must be strictly greater than zero.",
                Instance = HttpContext.Request.Path,
                TimestampUtc = DateTime.UtcNow
            });
        }

        // Domain logic and concurrency conflict handling (409) will be orchestrated via bidding service
        return Ok(new
        {
            auctionId = id,
            placedAmount = request.Amount,
            status = "Accepted",
            timestampUtc = DateTime.UtcNow
        });
    }
}