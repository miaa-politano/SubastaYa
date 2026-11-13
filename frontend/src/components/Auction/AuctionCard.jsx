import { useState } from 'react';
import { useCountdown } from '../../Hooks/useCountdown.js';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1656543802898-41c8c46683a7?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D';

const cleanDescription = (rawDesc) => {
    if (!rawDesc) return 'Producto verificado disponible para puja en tiempo real.';
    const lower = rawDesc.toLowerCase();
    if (
        lower.includes('puja') ||
        lower.includes('semilla') ||
        lower.includes('seed') ||
        lower.includes('anti-sniping') ||
        lower.includes('prueba')
    ) {
        return 'Artículo seleccionado en subasta oficial con garantía Escrow.';
    }
    return rawDesc;
};

export const AuctionCard = ({ auction, onOpenRoom }) => {
    const rawImage = auction.imageUrl || auction.urlImagen || auction.imagenUrl;
    const [imgUrl, setImgUrl] = useState(rawImage ? String(rawImage) : DEFAULT_IMAGE);

    const endDate = auction.endDate || auction.endDateUtc || auction.fechaFin || auction.endsAt;
    const { hours, minutes, seconds, isClosed, isCritical, isInvalid } = useCountdown(endDate);

    const categoryLabel = auction.categoryName || auction.categoria || 'General';
    const bidsCount = auction.bidsCount ?? auction.version ?? auction.cantidadPujas ?? (Array.isArray(auction.bids) ? auction.bids.length : 0);
    const isActuallyActive = !isClosed && (auction.status === 'ACTIVAS' || auction.status === 'ACTIVE' || auction.status === 'ACTIVA');

    return (
        <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col justify-between h-full transition-all shadow-lg overflow-hidden">
            <div>
                <div className="relative h-44 w-full bg-slate-950 overflow-hidden border-b border-slate-800">
                    <img
                        src={imgUrl}
                        alt={String(auction.title || 'Producto en subasta')}
                        onError={() => setImgUrl(DEFAULT_IMAGE)}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-slate-950/85 backdrop-blur-sm px-2.5 py-1 rounded-md border border-cyan-500/30">
                            {categoryLabel}
                        </span>
                    </div>
                    <div className="absolute top-3 right-3">
                        <span
                            className={`text-[10px] font-semibold uppercase px-2.5 py-1 rounded-md backdrop-blur-sm border ${
                                isActuallyActive
                                    ? 'bg-emerald-950/85 text-emerald-400 border-emerald-500/30'
                                    : 'bg-slate-950/85 text-slate-400 border-slate-700'
                            }`}
                        >
                            {isActuallyActive ? 'Activa' : 'Finalizada'}
                        </span>
                    </div>
                </div>

                <div className="p-5 space-y-3">
                    <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-400 font-medium">
                            {bidsCount} {bidsCount === 1 ? 'oferta' : 'ofertas'}
                        </span>

                        {!isInvalid && (
                            <span
                                className={`font-mono font-bold px-2 py-0.5 rounded border ${
                                    isClosed
                                        ? 'bg-slate-800 text-slate-500 border-slate-700'
                                        : isCritical
                                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                                            : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                                }`}
                            >
                                {isClosed ? 'Finalizada' : `⏱️ ${hours}:${minutes}:${seconds}`}
                            </span>
                        )}
                    </div>

                    <div>
                        <h3 className="text-base font-bold text-white tracking-tight line-clamp-1">
                            {auction.title || auction.titulo}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {cleanDescription(auction.description || auction.descripcion)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-5 pb-5 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium tracking-wider">Oferta Actual</span>
                    <span className="text-lg font-black text-emerald-400">
                        ${Number(auction.currentPrice || auction.initialPrice || auction.precioBase || 0).toLocaleString('es-AR')}
                    </span>
                </div>

                <button
                    onClick={() => onOpenRoom(auction.id)}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                    Ingresar
                </button>
            </div>
        </div>
    );
};