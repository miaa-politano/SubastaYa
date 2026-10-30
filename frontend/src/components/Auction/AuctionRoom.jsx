/* cSpell:disable */
import { useState, useEffect } from 'react';
import { useToast } from '../../Context/ToastContext.jsx';
import { useAuctionSocket } from '../../Hooks/useAuctionSocket.js';
import { LoadingSpinner } from '../Common/LoadingSpinner.jsx';
import { AuctionTimer } from './AuctionTimer.jsx';
import { AuctionPriceDisplay } from './AuctionPriceDisplay.jsx';
import { AuctionBidsFeed } from './AuctionBidsFeed.jsx';
import { AuctionUxTestingPanel } from './AuctionUxTestingPanel.jsx';
import { BiddingConsole } from '../Bidding/BiddingConsole.jsx';

export const AuctionRoom = ({
                                auctionId = 1,
                                initialPrice = 100000,
                                minIncrement = 5000,
                                currentUserId,
                                walletBalance,
                                onBidSuccess,
                                auctionEndDate,
                                auctionTitle = "Artículo en Subasta"
                            }) => {
    const { addToast } = useToast();
    const [endDate, setEndDate] = useState(auctionEndDate);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (auctionEndDate) {
            const timer = setTimeout(() => {
                setEndDate(auctionEndDate);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [auctionEndDate]);

    useEffect(() => {
        if (!endDate) return;

        const updateTimer = () => {
            const targetTime = new Date(String(endDate || Date.now())).getTime();
            if (isNaN(targetTime)) return;
            const diff = Math.floor((targetTime - Date.now()) / 1000);
            setTimeLeft(diff > 0 ? diff : 0);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [endDate]);

    const {
        currentPrice,
        connectionStatus,
        leadershipStatus,
        bidsHistory,
        isSimulatingNetwork,
        handleIncomingBid,
        handleTimeExtended,
        handleBidSubmit
    } = useAuctionSocket(
        auctionId,
        initialPrice,
        currentUserId,
        (newEndDateUtc) => {
            if (newEndDateUtc) {
                setEndDate(newEndDateUtc);
            } else {
                setTimeLeft((prev) => prev + 120);
            }
        },
        onBidSuccess
    );

    const isClosed = timeLeft <= 0;

    const auctionData = {
        currentPrice,
        minIncrement: Number(minIncrement || 5000),
        isClosed
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-6 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-800 relative overflow-hidden">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4 mb-6">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Sala en Tiempo Real</span>
                        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 flex-wrap">
                            Subasta #{auctionId}
                            <span className="text-slate-400 font-medium text-lg">- {auctionTitle}</span>
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
                                ? 'SignalR Conectado'
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

                <AuctionUxTestingPanel
                    currentPrice={currentPrice}
                    currentUserId={currentUserId}
                    auctionId={auctionId}
                    onIncomingBid={handleIncomingBid}
                    onExtend={() => handleTimeExtended(auctionId, null, 'Puja en zona crítica')}
                    onSimulateError={(type) => {
                        if (type === '409') addToast('HTTP 409 Conflict: Colisión concurrente.', 'error');
                        if (type === '422') addToast('HTTP 422: Saldo insuficiente.', 'error');
                    }}
                />
            </div>
        </div>
    );
};