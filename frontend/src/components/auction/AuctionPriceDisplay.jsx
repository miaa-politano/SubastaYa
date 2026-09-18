import React from 'react';

export const AuctionPriceDisplay = ({ currentPrice }) => {
    return (
        <div className="bg-slate-950/60 p-6 rounded-lg border border-slate-800 flex flex-col justify-center items-center text-center">
            <span className="text-slate-400 text-sm font-medium">Mayor Oferta Actual</span>
            <span className="text-4xl lg:text-5xl font-extrabold text-emerald-400 my-3 tracking-tight">
        ${Number(currentPrice).toLocaleString()}
      </span>
            <span className="text-xs text-slate-500">Sincronizado vía WebSockets</span>
        </div>
    );
};