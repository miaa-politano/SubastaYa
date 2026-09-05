using Microsoft.AspNetCore.Mvc;
using SubastaYa.Api.Contracts;
using SubastaYa.Api.Models;

namespace SubastaYa.Api.Controllers;

[ApiController]
[Route("api/wallets")]
[Produces("application/json")]
public class WalletsController : ControllerBase
{
    [HttpGet("balance")]
    [ProducesResponseType(typeof(WalletBalanceResponse), StatusCodes.Status200OK)]
    public IActionResult GetBalance()
    {
        // Skeletal response: integration with wallet repository will inject real values
        return Ok(new WalletBalanceResponse(
            TotalBalance: 0m,
            LockedBalance: 0m,
            AvailableBalance: 0m
        ));
    }

    [HttpPost("deposit")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public IActionResult DepositFunds([FromBody] DepositFundsRequest request)
    {
        if (request.Amount <= 0)
        {
            return BadRequest(new ErrorResponse
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Title = "Bad Request - Validation Error",
                Detail = "Deposit amount must be strictly positive.",
                Instance = HttpContext.Request.Path,
                TimestampUtc = DateTime.UtcNow
            });
        }

        return Ok(new
        {
            message = "Simulated deposit completed successfully.",
            creditedAmount = request.Amount,
            timestampUtc = DateTime.UtcNow
        });
    }
}