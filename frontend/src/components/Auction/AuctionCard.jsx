export const AuctionCard = ({ auction, onOpenRoom }) => {
    const getCleanTitle = () => {
        if (auction.id === 99) return "Notebook Gamer ASUS ROG Strix";
        if (auction.id === 100) return "Monitor Gaming 27'' Curved 165Hz";
        if (auction.id === 1) return "Notebook Gamer Lenovo Legion";
        return auction.title;
    };

    const getCleanDescription = () => {
        if (auction.id === 99) return "Procesador Ryzen 9, 32GB RAM, SSD 1TB. Configurado para pruebas de cierre de subasta.";
        if (auction.id === 100) return "Panel VA, 1ms de respuesta, QHD. Validando flujos alternativos y estados desiertos.";
        if (auction.id === 1) return "Procesador Intel i7, RTX 4060. Configurado para test de concurrencia bajo estrés.";
        return auction.description || "Sin descripción disponible.";
    };

    return (
        <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-5 rounded-xl flex flex-col justify-between h-full transition-all shadow-lg">
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        Subasta #{auction.id}
                    </span>
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                        auction.status === 'ACTIVAS' || auction.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400'
                    }`}>
                        {auction.status === 'ACTIVE' ? 'Activa' : auction.status}
                    </span>
                </div>

                <div>
                    <h3 className="text-base font-bold text-white tracking-tight">{getCleanTitle()}</h3>
                    <p className="text-xs text-slate-400 mt-1">{getCleanDescription()}</p>
                </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium tracking-wider">Oferta Actual</span>
                    <span className="text-lg font-black text-emerald-400">
                        ${Number(auction.currentPrice || auction.initialPrice || 0).toLocaleString('es-AR')}
                    </span>
                </div>

                <button
                    onClick={() => onOpenRoom(auction.id)}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors border border-slate-700"
                >
                    Ingresar
                </button>
            </div>
        </div>
    );
};
