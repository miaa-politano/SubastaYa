import { useCountdown } from '../../Hooks/useCountdown.js';

export const AuctionCard = ({ auction, onOpenRoom }) => {
    // Desestructuramos el Hook directamente para capturar cada re-render del cronómetro
    const timeLeft = useCountdown(auction.endDateUtc);
    const { hours, minutes, seconds, isClosed, isCritical } = timeLeft;

    const getCategoryImage = (id) => {
        if (id === 1) {
            return 'https://images.unsplash.com/photo-1763162139130-240507e9fad5?q=80&w=1321&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D'; // Laptop plateada limpia
        }
        if (id === 2 || id === 100) {
            return 'https://images.unsplash.com/photo-1753998941540-081eed4f6397?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D'; // Monitor gamer en ambiente oscuro
        }
        return 'https://images.unsplash.com/photo-1647489238347-dbd651c2f37a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D'; // Caja de tecnología genérica
    };

    return (
        <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-0 rounded-xl flex flex-col justify-between h-full transition-all shadow-lg overflow-hidden group">
            {/* Contenedor de Imagen de Producto */}
            <div className="relative h-40 w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                <img
                    src={getCategoryImage(auction.id)}
                    alt={auction.title}
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                />

                <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded border border-cyan-500/20">
                        Subasta #{auction.id}
                    </span>
                </div>

                <div className="absolute top-3 right-3">
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded backdrop-blur-sm ${
                        isClosed
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                        {isClosed ? 'Finalizada' : 'Activa'}
                    </span>
                </div>
            </div>

            {/* Bloque Informativo */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                    <h3 className="text-base font-bold text-white tracking-tight line-clamp-1">{auction.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{auction.description || "Sin descripción disponible."}</p>
                </div>

                {/* Reloj Sincronizado Reactivo */}
                <div className={`p-2 rounded-lg border text-center transition-colors duration-300 ${
                    isCritical
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'
                        : 'bg-slate-950/40 text-cyan-400 border-slate-800'
                }`}>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Tiempo Restante</span>
                    <span className="text-sm font-mono font-bold tracking-widest">{hours}:{minutes}:{seconds}</span>
                </div>

                {/* Datos Financieros */}
                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-medium tracking-wider">Oferta Actual</span>
                        <span className="text-lg font-black text-emerald-400">
                            ${Number(auction.currentPrice || auction.startingPrice || 0).toLocaleString('es-AR')}
                        </span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">
                            {auction.bidsCount || 0} ofertas realizadas
                        </span>
                    </div>

                    <button
                        onClick={() => onOpenRoom(auction.id)}
                        disabled={isClosed}
                        className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors border border-slate-700"
                    >
                        Ingresar
                    </button>
                </div>
            </div>
        </div>
    );
};