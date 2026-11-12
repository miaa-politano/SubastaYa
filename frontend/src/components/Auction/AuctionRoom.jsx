import { useState, useEffect, useCallback } from 'react';
import { useAuctionSocket } from '../../Hooks/useAuctionSocket.js';
import { parseUtcDate } from '../../Hooks/useCountdown.js';
import { LoadingSpinner } from '../Common/LoadingSpinner.jsx';
import { AuctionTimer } from './AuctionTimer.jsx';
import { AuctionPriceDisplay } from './AuctionPriceDisplay.jsx';
import { AuctionBidsFeed } from './AuctionBidsFeed.jsx';
import { BiddingConsole } from '../Bidding/BiddingConsole.jsx';

export const AuctionRoom = ({
                                auctionId = 1,
                                auctionTitle = null,
                                initialPrice = 1450000,
                                initialEndDate = null,
                                minIncrement = 5000,
                                currentUserId,
                                walletBalance,
                                onRefreshBalance
                            }) => {
    const [endDate, setEndDate] = useState(initialEndDate);
    const [timeLeft, setTimeLeft] = useState(null);

    const handleAntiSnipingExtend = useCallback((newEndDate) => {
        if (newEndDate) {
            setEndDate(newEndDate);
        }
    }, []);

    const {
        currentPrice,
        connectionStatus,
        leadershipStatus,
        bidsHistory,
        isSimulatingNetwork,
        handleBidSubmit
    } = useAuctionSocket(
        auctionId,
        initialPrice,
        currentUserId,
        handleAntiSnipingExtend,
        onRefreshBalance
    );

    useEffect(() => {
        if (!endDate) return;
        const targetTime = parseUtcDate(endDate);
        if (Number.isNaN(targetTime)) return;

        const updateTimer = () => {
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((targetTime - now) / 1000));
            setTimeLeft(remaining);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [endDate]);

    const isClosed = timeLeft !== null && timeLeft <= 0;

    const auctionData = {
        currentPrice: currentPrice,
        minIncrement: minIncrement,
        isClosed
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-6 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-800 relative overflow-hidden">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4 mb-6">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Sala en Tiempo Real</span>
                        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 flex-wrap">
                            {auctionTitle || `Subasta #${auctionId}`}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <AuctionTimer timeLeft={timeLeft} />

                        {leadershipStatus === 'leading' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                Liderando
                            </span>
                        )}

                        {leadershipStatus === 'outbid' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-bounce">
                                Outbid
                            </span>
                        )}

                        <span
                            className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full border ${
                                connectionStatus === 'connected'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                        >
                            <span
                                className={`w-2 h-2 rounded-full ${
                                    connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                                }`}
                            ></span>
                            {connectionStatus === 'connected'
                                ? 'Socket Conectado'
                                : connectionStatus === 'connecting'
                                    ? 'Conectando...'
                                    : 'Offline'}
                        </span>
                    </div>
                </header>

                {isSimulatingNetwork && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-20 flex items-center justify-center">
                        <LoadingSpinner text="Procesando transacción atómica..." size="lg" />
                    </div>
                )}

                {leadershipStatus === 'outbid' && (
                    <div className="mb-6 p-4 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-200 flex justify-between items-center">
                        <div>
                            <p className="font-bold text-sm">Tu oferta ya no es la más alta</p>
                            <p className="text-xs text-rose-300/80">Alguien ofertó un monto mayor. Vuelve a ofertar para recuperar el liderazgo.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-6">
                        <AuctionPriceDisplay currentPrice={currentPrice} />
                        <BiddingConsole
                            auction={auctionData}
                            onBidSubmit={handleBidSubmit}
                            walletBalance={walletBalance}
                        />
                    </div>
                    <AuctionBidsFeed bidsHistory={bidsHistory} currentUserId={currentUserId} />
                </div>
            </div>
        </div>
    );
};