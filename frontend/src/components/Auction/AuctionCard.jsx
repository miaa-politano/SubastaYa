import { useCountdown } from '../../Hooks/useCountdown.js';

export const AuctionCard = ({ auction, onOpenRoom }) => {
    const { hours, minutes, seconds, isClosed, isCritical } = useCountdown(
        auction.endDateUtc || auction.endDate || auction['END_DATE_UTC']
    );
    const status = String(auction.status || '').toUpperCase();
    const isActive = ['ACTIVE', 'ACTIVA', 'ACTIVAS'].includes(status) && !isClosed;

    return (
        <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-0 rounded-xl flex flex-col h-full transition-all shadow-lg overflow-hidden">
            <div className="relative h-40 overflow-hidden bg-slate-950">
                <img
                    src={auction.imageUrl || 'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?w=800&auto=format&fit=crop'}
                    alt={auction.title || 'Producto en subasta'}
                    className="w-full h-full object-cover opacity-80"
                    loading="lazy"
                />
                <span className="absolute top-3 left-3 text-[10px] font-bold uppercase text-cyan-400 bg-slate-950/80 px-2 py-0.5 rounded">
                    Subasta #{auction.id}
                </span>
                <span className={`absolute top-3 right-3 text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                    {isClosed ? 'Finalizada' : auction.status || 'Activa'}
                </span>
            </div>

            <div className="p-5 space-y-4 flex-1">
                <h3 className="text-base font-bold text-white tracking-tight">{auction.title || 'Subasta sin título'}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{auction.description || 'Sin descripción disponible.'}</p>

                <div className={`p-2 rounded-lg border text-center ${isCritical ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse' : 'bg-slate-950/40 text-cyan-400 border-slate-800'}`}>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Tiempo restante</span>
                    <span className="font-mono font-bold">{hours}:{minutes}:{seconds}</span>
                </div>

                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-medium tracking-wider">Oferta actual</span>
                        <span className="text-lg font-black text-emerald-400">
                            ${Number(auction.currentPrice || auction.startingPrice || auction.initialPrice || 0).toLocaleString('es-AR')}
                        </span>
                        <span className="text-[10px] text-slate-500 block">{auction.bidsCount || 0} ofertas</span>
                    </div>
                    <button
                        onClick={() => onOpenRoom(auction.id)}
                        disabled={isClosed}
                        className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors border border-slate-700"
                    >
                        Ingresar
                    </button>
                </div>
            </div>
        </div>
    );
};
