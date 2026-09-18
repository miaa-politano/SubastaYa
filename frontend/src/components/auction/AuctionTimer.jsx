import React from 'react';

export const AuctionTimer = ({ timeLeft }) => {
    const formatTimer = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const isCritical = timeLeft <= 60 && timeLeft > 0;

    return (
        <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                isCritical
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-pulse'
                    : timeLeft === 0
                        ? 'bg-slate-800 text-slate-500 border-slate-700'
                        : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
            }`}
        >
            <span>⏱️ {timeLeft === 0 ? 'Cerrada' : formatTimer(timeLeft)}</span>
            {isCritical && <span className="text-[10px] uppercase">¡Zona Crítica!</span>}
        </div>
    );
};