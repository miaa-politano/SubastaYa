export const AuctionBidsFeed = ({ bidsHistory, currentUserId }) => {
    return (
        <div className="bg-slate-950/60 p-5 rounded-lg border border-slate-800 flex flex-col">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-slate-300">Historial de Pujas</h3>
                <span className="text-xs text-slate-500">{bidsHistory.length} registradas</span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-56 space-y-2 pr-1">
                {bidsHistory.map((bid) => {
                    const isMine = bid.bidderId === currentUserId || bid.bidderUsername === currentUserId;
                    return (
                        <div
                            key={bid.id}
                            className={`flex justify-between items-center p-2.5 rounded text-xs border ${
                                isMine
                                    ? 'bg-emerald-950/30 border-emerald-800/50'
                                    : 'bg-slate-900 border-slate-800'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                                        isMine ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-400'
                                    }`}
                                >
                                    {isMine ? 'TÚ' : bid.bidderUsername.slice(0, 2).toUpperCase()}
                                </div>
                                <span className={`font-medium ${isMine ? 'text-emerald-300' : 'text-slate-300'}`}>
                  {isMine ? `${bid.bidderUsername} (Tú)` : bid.bidderUsername}
                </span>
                            </div>
                            <div className="text-right">
                                <span className="font-bold text-emerald-400 block">${Number(bid.amount).toLocaleString()}</span>
                                <span className="text-[10px] text-slate-500">{bid.timestamp}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};