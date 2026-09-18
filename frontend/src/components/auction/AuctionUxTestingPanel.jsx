import React from 'react';

export const AuctionUxTestingPanel = ({
                                          currentPrice,
                                          currentUserId,
                                          auctionId,
                                          onIncomingBid,
                                          onExtend,
                                          onSimulateError
                                      }) => {
    return (
        <div className="border-t border-slate-800 pt-4 mt-6">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
        Validación de UX / Resiliencia de Red
      </span>
            <div className="flex flex-wrap gap-2.5">
                <button
                    onClick={() => {
                        const nextAmount = currentPrice + 50000;
                        onIncomingBid(auctionId, nextAmount, currentUserId, new Date().toISOString(), currentUserId);
                    }}
                    className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded text-xs font-medium transition-colors"
                >
                    Simular Mi Puja
                </button>

                <button
                    onClick={() => {
                        const nextAmount = currentPrice + 60000;
                        onIncomingBid(auctionId, nextAmount, 'Otro_Postor', new Date().toISOString(), 'other-user');
                    }}
                    className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded text-xs font-medium transition-colors"
                >
                    Simular Superación (Outbid)
                </button>

                <button
                    onClick={onExtend}
                    className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded text-xs font-medium transition-colors"
                >
                    Extender (+2 min Anti-Sniping)
                </button>

                <button
                    onClick={() => onSimulateError('409')}
                    className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded text-xs font-medium transition-colors"
                >
                    Probar Error 409 (Concurrencia)
                </button>

                <button
                    onClick={() => onSimulateError('422')}
                    className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded text-xs font-medium transition-colors"
                >
                    Probar Error 422 (Saldo Insuficiente)
                </button>
            </div>
        </div>
    );
};