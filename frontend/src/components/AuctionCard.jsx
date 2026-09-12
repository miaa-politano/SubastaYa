import React from 'react';
import { useCountdown } from '../hooks/useCountdown';

/**
 * Renders an auction item card with real-time countdown timer.
 *
 * @param {object} props - Component properties.
 * @param {object} props.auction - The auction data object.
 * @returns {JSX.Element} The rendered auction card.
 */
export function AuctionCard({ auction }) {
    const { title, categoryName, imageUrl, highestBid, totalBids, endDate } = auction;
    const { hours, minutes, seconds, isClosed, isCritical } = useCountdown(endDate);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <article className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:border-slate-700 hover:shadow-2xl">
            <div className="relative h-48 w-full bg-slate-800 overflow-hidden">
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm text-cyan-400 text-xs font-semibold px-2.5 py-1 rounded-md border border-cyan-500/20 uppercase tracking-wider">
                    {categoryName}
                </span>

                <div className="absolute bottom-3 right-3">
                    {isClosed ? (
                        <span className="bg-rose-950/90 text-rose-300 text-xs font-bold px-3 py-1.5 rounded-md border border-rose-600/40">
                            Finalizada
                        </span>
                    ) : (
                        <div
                            className={`flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-md border backdrop-blur-sm ${
                                isCritical
                                    ? 'bg-red-600/90 text-white border-red-500 animate-pulse'
                                    : 'bg-slate-950/80 text-amber-400 border-amber-500/30'
                            }`}
                        >
                            <span>⏱</span>
                            <span>{hours}:{minutes}:{seconds}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col p-5 flex-grow justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-white line-clamp-1 mb-1" title={title}>
                        {title}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                        {totalBids} {totalBids === 1 ? 'oferta realizada' : 'ofertas realizadas'}
                    </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-end justify-between">
                    <div>
                        <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase block">
                            Puja más alta
                        </span>
                        <span className="text-xl font-extrabold text-emerald-400">
                            {formatCurrency(highestBid)}
                        </span>
                    </div>

                    <button
                        disabled={isClosed}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                            isClosed
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-cyan-600 text-white hover:bg-cyan-500 active:scale-95'
                        }`}
                    >
                        {isClosed ? 'Cerrada' : 'Participar'}
                    </button>
                </div>
            </div>
        </article>
    );
}