namespace SubastaYa.Api.Contracts;

// Input contract for simulated balance deposit (POST /api/wallets/deposit)
public record DepositFundsRequest(
    decimal Amount
);

// Output contract for wallet balance breakdown (GET /api/wallets/balance)
public record WalletBalanceResponse(
    decimal TotalBalance,
    decimal LockedBalance,
    decimal AvailableBalance
);