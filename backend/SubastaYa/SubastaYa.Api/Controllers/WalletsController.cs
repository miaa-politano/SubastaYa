using Microsoft.AspNetCore.Mvc;
using SubastaYa.Api.Contracts;
using SubastaYa.Api.Models;
using SubastaYa.Domain.Interfaces;

namespace SubastaYa.Api.Controllers;

[ApiController]
[Route("api/wallets")]
[Produces("application/json")]
public class WalletsController : ControllerBase
{
    private readonly IWalletService _walletService;

    public WalletsController(IWalletService walletService)
    {
        _walletService = walletService;
    }

    [HttpGet("balance")]
    [ProducesResponseType(typeof(WalletBalanceResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBalance([FromQuery] int userId = 1, CancellationToken cancellationToken = default)
    {
        try
        {
            var wallet = await _walletService.GetWalletByUserIdAsync(userId, cancellationToken);
            return Ok(new WalletBalanceResponse(
                TotalBalance: wallet.TotalBalance,
                LockedBalance: wallet.LockedBalance,
                AvailableBalance: wallet.AvailableBalance
            ));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ErrorResponse
            {
                StatusCode = StatusCodes.Status404NotFound,
                Title = "Resource Not Found",
                Detail = ex.Message,
                Instance = HttpContext.Request.Path,
                TimestampUtc = DateTime.UtcNow
            });
        }
    }

    [HttpPost("deposit")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DepositFunds(
        [FromQuery] int userId,
        [FromBody] DepositFundsRequest request,
        CancellationToken cancellationToken = default)
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

        var effectiveUserId = userId > 0 ? userId : 1;
        await _walletService.CreditFundsAsync(effectiveUserId, request.Amount, "Simulated wallet deposit via API", cancellationToken);

        return Ok(new
        {
            message = "Deposit completed successfully.",
            userId = effectiveUserId,
            creditedAmount = request.Amount,
            timestampUtc = DateTime.UtcNow
        });
    }
}