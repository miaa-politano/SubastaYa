using Microsoft.EntityFrameworkCore;
using SubastaYa.Api.Hubs;
using SubastaYa.Api.Middlewares;
using SubastaYa.Domain.Interfaces;
using SubastaYa.Infrastructure.Persistence;
using SubastaYa.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? ["http://localhost:5173", "https://localhost:5173"];
        policy.WithOrigins(origins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddScoped<IWalletService, WalletService>();
builder.Services.AddScoped<IBidService, BidService>();
builder.Services.AddScoped<IAuctionNotificationService, AuctionNotificationService>();
builder.Services.AddScoped<IAuctionEventRelayService, AuctionEventRelayService>();
builder.Services.AddSingleton<IEventDeduplicator, InMemoryEventDeduplicator>();

var app = builder.Build();

app.UseGlobalExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "SubastaYa API v1");
        options.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();

app.UseCors("FrontendPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<AuctionHub>("/hubs/auction");

app.Run();
