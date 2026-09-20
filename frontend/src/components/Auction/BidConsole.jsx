import React, { useState, useEffect } from 'react';

export const BidConsole = ({
                               currentPrice,
                               minIncrement = 10000,
                               userAvailableBalance = 0,
                               isAuctionActive = true,
                               isSubmitting = false,
                               onPlaceBid
                           }) => {
    const minValidBid = currentPrice + minIncrement;
    const [bidAmount, setBidAmount] = useState(minValidBid);
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        setBidAmount(currentPrice + minIncrement);
    }, [currentPrice, minIncrement]);

    const handleAmountChange = (e) => {
        const value = Number(e.target.value);
        setBidAmount(value);
        validateBid(value);
    };

    const validateBid = (amount) => {
        if (amount < minValidBid) {
            setValidationError(`La oferta mínima debe ser de $${minValidBid.toLocaleString()}`);
            return false;
        }
        if (amount > userAvailableBalance) {
            setValidationError(`Saldo insuficiente. Disponible: $${userAvailableBalance.toLocaleString()}`);
            return false;
        }
        setValidationError('');
        return true;
    };

    const handleQuickIncrement = (increment) => {
        const nextAmount = (bidAmount < minValidBid ? minValidBid : bidAmount) + increment;
        setBidAmount(nextAmount);
        validateBid(nextAmount);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateBid(bidAmount)) return;
        onPlaceBid(bidAmount);
    };

    const isBidValid = bidAmount >= minValidBid && bidAmount <= userAvailableBalance;

    return (
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 border-b border-slate-800/80 pb-3">
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Consola de Oferta</h3>
                    <p className="text-xs text-slate-400">
                        Mínimo requerido: <strong className="text-emerald-400">${minValidBid.toLocaleString()}</strong>
                    </p>
                </div>
                <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Garantía disponible</span>
                    <span className={`text-xs font-bold ${userAvailableBalance < minValidBid ? 'text-rose-400' : 'text-slate-300'}`}>
            ${userAvailableBalance.toLocaleString()}
          </span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                        <input
                            type="number"
                            step="1000"
                            min={minValidBid}
                            disabled={!isAuctionActive || isSubmitting}
                            value={bidAmount}
                            onChange={handleAmountChange}
                            className={`w-full bg-slate-900 border rounded-lg pl-8 pr-4 py-2.5 text-sm font-semibold text-white focus:outline-none transition-colors ${
                                validationError
                                    ? 'border-rose-500/80 focus:border-rose-500 text-rose-200'
                                    : 'border-slate-700 focus:border-cyan-500'
                            }`}
                        />
                    </div>

                    {validationError && (
                        <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                            <span>⚠️</span> {validationError}
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        disabled={!isAuctionActive || isSubmitting}
                        onClick={() => handleQuickIncrement(minIncrement)}
                        className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-xs font-medium text-slate-300 transition-colors"
                    >
                        +${minIncrement.toLocaleString()}
                    </button>
                    <button
                        type="button"
                        disabled={!isAuctionActive || isSubmitting}
                        onClick={() => handleQuickIncrement(50000)}
                        className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-xs font-medium text-slate-300 transition-colors"
                    >
                        +$50.000
                    </button>
                    <button
                        type="button"
                        disabled={!isAuctionActive || isSubmitting}
                        onClick={() => handleQuickIncrement(100000)}
                        className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-xs font-medium text-slate-300 transition-colors"
                    >
                        +$100.000
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={!isAuctionActive || isSubmitting || !isBidValid}
                    className={`w-full py-3 rounded-lg text-xs font-bold tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 ${
                        !isAuctionActive
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                            : !isBidValid || isSubmitting
                                ? 'bg-cyan-950/40 text-cyan-600 border border-cyan-900/30 cursor-not-allowed'
                                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/20 active:scale-[0.99]'
                    }`}
                >
                    {isSubmitting ? (
                        <>
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Procesando puja atómica...
                        </>
                    ) : !isAuctionActive ? (
                        'Subasta Finalizada'
                    ) : (
                        `Confirmar Oferta por $${Number(bidAmount).toLocaleString()}`
                    )}
                </button>
            </form>
        </div>
    );
};