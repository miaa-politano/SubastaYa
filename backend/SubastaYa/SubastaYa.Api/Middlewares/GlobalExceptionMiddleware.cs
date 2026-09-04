using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SubastaYa.Api.Models;
using SubastaYa.Domain.Exceptions;

namespace SubastaYa.Api.Middlewares;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception captured while processing {Path}", context.Request.Path);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, title) = exception switch
        {
            EntityNotFoundException => (StatusCodes.Status404NotFound, "Resource Not Found"),
            InsufficientFundsException => (StatusCodes.Status422UnprocessableEntity, "Unprocessable Entity - Insufficient Funds"),
            InvalidBidAmountException => (StatusCodes.Status400BadRequest, "Bad Request - Invalid Bid Amount"),
            BusinessRuleValidationException => (StatusCodes.Status400BadRequest, "Bad Request - Domain Rule Violation"),
            ConcurrencyConflictException or DbUpdateConcurrencyException => (StatusCodes.Status409Conflict, "Conflict - Concurrency Violation"),
            _ => (StatusCodes.Status500InternalServerError, "Internal Server Error")
        };

        context.Response.StatusCode = statusCode;

        var response = new ErrorResponse
        {
            StatusCode = statusCode,
            Title = title,
            Detail = statusCode == StatusCodes.Status500InternalServerError
                ? "An unexpected internal server error occurred."
                : exception.Message,
            Instance = context.Request.Path,
            TimestampUtc = DateTime.UtcNow
        };

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, jsonOptions));
    }
}