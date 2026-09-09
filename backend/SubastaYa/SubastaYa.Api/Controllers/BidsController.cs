using Microsoft.AspNetCore.Mvc;
using SubastaYa.Api.Contracts;
using SubastaYa.Domain.DTOs;
using SubastaYa.Domain.Interfaces;

namespace SubastaYa.Api.Controllers;

[ApiController]
[Route("api/auctions/{auctionId:int}/bids")]
public class BidsController : ControllerBase
{
    private readonly IBidService _bidService;

    public BidsController(IBidService bidService)
    {
        _bidService = bidService;
    }

    [HttpPost]
    public async Task<ActionResult<BidResultDto>> PlaceBid(
        int auctionId,
        [FromBody] PlaceBidRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _bidService.PlaceBidAsync(auctionId, request.BidderId, request.Amount, cancellationToken);
        return Ok(result);
    }
}