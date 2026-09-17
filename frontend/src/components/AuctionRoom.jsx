import React, { useState, useEffect } from 'react';
import { createAuctionHubConnection } from '../services/auctionHub';

export const AuctionRoom = ({ auctionId = 1, initialPrice = 1450000, currentUserId = 'user-mateo' }) => {
    const [currentPrice, setCurrentPrice] = useState(initialPrice);
    const [bidsHistory, setBidsHistory] = useState([
        {
            id: 1,
            amount: initialPrice,
            bidderUsername: 'Usuario_Inicial',
            bidderId: 'other-user',
            timestamp: new Date().toLocaleTimeString()
        }
    ]);
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [notification, setNotification] = useState(null);

    // Estados de liderazgo (TASK-019)
    // Valores posibles: 'neutral' | 'leading' | 'outbid'
    const [leadershipStatus, setLeadershipStatus] = useState('neutral');

    const handleIncomingBid = (auctionIdReceived, amount, bidderUsername, timestamp, bidderId = null) => {
        if (Number(auctionIdReceived) !== Number(auctionId)) return;

        setCurrentPrice(amount);

        const isCurrentBidMine = bidderId ? bidderId === currentUserId : bidderUsername === currentUserId;

        setLeadershipStatus((prevStatus) => {
            if (isCurrentBidMine) {
                return 'leading';
            }
            // Si el usuario estaba liderando y otro oferta, pasa inmediatamente a "outbid"
            if (prevStatus === 'leading') {
                return 'outbid';
            }
            return prevStatus;
        });

        setBidsHistory((prev) => [
            {
                id: Date.now(),
                amount,
                bidderUsername,
                bidderId: bidderId || bidderUsername,
                timestamp: new Date(timestamp).toLocaleTimeString()
            },
            ...prev
        ]);
    };

    const handleTimeExtended = (auctionIdReceived, newEndDate, reason) => {
        if (Number(auctionIdReceived) !== Number(auctionId)) return;

        setNotification({
            type: 'warning',
            message: `⏳ Regla Anti-Sniping: ${reason || 'Subasta extendida por 2 minutos.'}`
        });
        setTimeout(() => setNotification(null), 6000);
    };

    const handleAuctionClosed = (auctionIdReceived, winnerUsername, finalAmount) => {
        if (Number(auctionIdReceived) !== Number(auctionId)) return;

        setNotification({
            type: 'success',
            message: `🏆 Subasta cerrada. Ganador: ${winnerUsername} por $${Number(finalAmount).toLocaleString()}`
        });
    };

    useEffect(() => {
        const handlers = {
            onNewBid: handleIncomingBid,
            onTimeExtended: handleTimeExtended,
            onAuctionClosed: handleAuctionClosed
        };

        const connection = createAuctionHubConnection(auctionId, handlers, setConnectionStatus);

        return () => {
            if (connection) {
                connection.stop();
            }
        };
    }, [auctionId, currentUserId]);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-6 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-800">

                {/* Cabecera con estado de socket y estado de liderazgo */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4 mb-6">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Sala en Tiempo Real</span>
                        <h2 className="text-2xl font-bold tracking-tight">Subasta #{auctionId}</h2>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Badge de Liderazgo (TASK-019) */}
                        {leadershipStatus === 'leading' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                👑 Liderando la subasta
              </span>
                        )}

                        {leadershipStatus === 'outbid' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-bounce">
                ⚠️ ¡Te han superado! (Outbid)
              </span>
                        )}

                        {/* Badge de Conexión SignalR */}
                        {connectionStatus === 'connected' ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Socket Conectado
              </span>
                        ) : (
                            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                                {connectionStatus === 'connecting' ? 'Conectando...' : 'Offline'}
              </span>
                        )}
                    </div>
                </header>

                {/* Alerta Destacada de Outbid (TASK-019) */}
                {leadershipStatus === 'outbid' && (
                    <div className="mb-6 p-4 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-200 flex justify-between items-center">
                        <div>
                            <p className="font-bold text-sm">¡Tu oferta ya no es la más alta!</p>
                            <p className="text-xs text-rose-300/80">Alguien ofertó un monto mayor. Vuelve a ofertar para recuperar el liderazgo.</p>
                        </div>
                        <span className="text-xl">🚨</span>
                    </div>
                )}

                {/* Notificaciones Temporales Anti-Sniping / Cierre */}
                {notification && (
                    <div
                        className={`mb-6 p-4 rounded-lg text-sm font-medium border ${
                            notification.type === 'warning'
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        }`}
                    >
                        {notification.message}
                    </div>
                )}

                {/* Panel de Métricas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-slate-950/60 p-6 rounded-lg border border-slate-800 flex flex-col justify-center items-center text-center">
                        <span className="text-slate-400 text-sm font-medium">Mayor Oferta Actual</span>
                        <span className="text-4xl lg:text-5xl font-extrabold text-emerald-400 my-3 tracking-tight">
              ${Number(currentPrice).toLocaleString()}
            </span>
                        <span className="text-xs text-slate-500">Sincronizado vía WebSockets</span>
                    </div>

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
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                                                isMine ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-400'
                                            }`}>
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
                </div>

                {/* Panel de Pruebas Interactivo para validar TASK-019 */}
                <div className="border-t border-slate-800 pt-4 mt-6">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
            Prueba de Liderazgo y Reactividad (TASK-019)
          </span>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => {
                                const nextAmount = currentPrice + 50000;
                                handleIncomingBid(auctionId, nextAmount, currentUserId, new Date().toISOString(), currentUserId);
                            }}
                            className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded text-xs font-medium transition-colors"
                        >
                            Simular Mi Puja (Quedo Liderando)
                        </button>

                        <button
                            onClick={() => {
                                const nextAmount = currentPrice + 60000;
                                handleIncomingBid(auctionId, nextAmount, 'Otro_Postor', new Date().toISOString(), 'other-user');
                            }}
                            className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded text-xs font-medium transition-colors"
                        >
                            Simular Puja Rival (Disparar Outbid)
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};