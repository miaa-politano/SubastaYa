export function AuctionCard({ auction, onOpenRoom }) {
    const { id, title, description, currentPrice, status } = auction;

    return (
        <article className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-cyan-500/50 transition-all group shadow-lg">
            <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
          Subasta #{id} - {status}
        </span>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2">{description}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-end grow">
                <div>
                    <span className="text-[10px] text-slate-400 block">Oferta Actual</span>
                    <span className="text-xl font-extrabold text-emerald-400">
            ${Number(currentPrice).toLocaleString('es-AR')}
          </span>
                </div>

                <button
                    onClick={() => onOpenRoom(id)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
                >
                    Ingresar
                </button>
            </div>
        </article>
    );
}