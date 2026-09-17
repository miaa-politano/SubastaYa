import React from 'react';

export const BidItem = ({ bid, onSelectAuction }) => {
    return (
        <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white text-base">{bid.title}</h3>
                    <span className="text-xs text-slate-500">#{bid.auctionId}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>Cierre: {bid.endDate}</span>
                    <span>•</span>
                    <span>
            Puja más alta:{' '}
                        <strong className="text-slate-200">${bid.currentHighestBid.toLocaleString()}</strong>
          </span>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <div className="text-left md:text-right">
                    <span className="text-xs text-slate-400 block">Mi Oferta</span>
                    <span className="text-base font-bold text-cyan-400">${bid.myBidAmount.toLocaleString()}</span>
                </div>

                <div className="flex flex-col gap-1 items-start md:items-end">
                    {bid.status === 'winning' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              👑 Liderando
            </span>
                    )}
                    {bid.status === 'outbid' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
              ⚠️ Superado
            </span>
                    )}
                    {bid.status === 'won' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              🏆 Ganada
            </span>
                    )}

                    <span className="text-[10px] text-slate-500">
            {bid.escrowLocked ? '🔒 Fondos retenidos' : '🔓 Fondos liberados'}
          </span>
                </div>

                <button
                    onClick={() => onSelectAuction(bid.auctionId)}
                    className="px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-medium transition-colors"
                >
                    Ir a la Sala
                </button>
            </div>
        </div>
    );
};