export const PublicationItem = ({ item }) => {
    return (
        <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
            <div className="space-y-1">
                <h3 className="font-semibold text-white text-base">{item.title}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>Precio base: ${item.initialPrice.toLocaleString()}</span>
                    <span>•</span>
                    <span>{item.totalBids} ofertas recibidas</span>
                    <span>•</span>
                    <span>{item.endDate}</span>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <div className="text-left md:text-right">
                    <span className="text-xs text-slate-400 block">Mayor Oferta Recibida</span>
                    <span className="text-base font-bold text-emerald-400">
            ${item.currentHighestBid.toLocaleString()}
          </span>
                </div>

                <div>
                    {item.status === 'active' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Subasta Activa
            </span>
                    ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
              Finalizada
            </span>
                    )}
                </div>
            </div>
        </div>
    );
};