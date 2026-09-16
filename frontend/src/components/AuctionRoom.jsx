import React, { useState, useEffect } from 'react';
import { createAuctionHubConnection } from '../services/auctionHub';

export const AuctionRoom = ({ auctionId = 1, initialPrice = 1450000 }) => {
    const [currentPrice, setCurrentPrice] = useState(initialPrice);
    const [bidsHistory, setBidsHistory] = useState([
        {
            id: 1,
            amount: initialPrice,
            bidderUsername: 'Usuario_Inicial',
            timestamp: new Date().toLocaleTimeString()
        }
    ]);
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [notification, setNotification] = useState(null);

    // Manejadores centralizados para SignalR y para la simulación local
    const handleIncomingBid = (auctionIdReceived, amount, bidderUsername, timestamp) => {
        if (Number(auctionIdReceived) !== Number(auctionId)) return;

        setCurrentPrice(amount);
        setBidsHistory((prev) => [
            {
                id: Date.now(),
                amount,
                bidderUsername,
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
    }, [auctionId]);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Contenedor Principal de la Sala */}
            <div className="p-6 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-800">
                <header className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Sala en Tiempo Real</span>
                        <h2 className="text-2xl font-bold tracking-tight">Subasta #{auctionId}</h2>
                    </div>

                    {/* Badge de Conexión SignalR */}
                    <div>
                        {connectionStatus === 'connected' && (
                            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Socket Conectado
              </span>
                        )}
                        {connectionStatus === 'connecting' && (
                            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                Conectando...
              </span>
                        )}
                        {connectionStatus === 'disconnected' && (
                            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                Modo Offline (Simulación Activa)
              </span>
                        )}
                    </div>
                </header>

                {/* Notificaciones Dinámicas Anti-Sniping / Cierre */}
                {notification && (
                    <div
                        className={`mb-6 p-4 rounded-lg text-sm font-medium border animate-fade-in ${
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
                            {bidsHistory.map((bid) => (
                                <div
                                    key={bid.id}
                                    className="flex justify-between items-center p-2.5 rounded bg-slate-900 border border-slate-800 text-xs"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 text-[10px]">
                                            {bid.bidderUsername.slice(0, 2).toUpperCase()}
                                        </div>
                                        <span className="text-slate-300 font-medium">{bid.bidderUsername}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-emerald-400 block">${Number(bid.amount).toLocaleString()}</span>
                                        <span className="text-[10px] text-slate-500">{bid.timestamp}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Panel de Pruebas y Simulación (Ideal para revisar la UI antes del merge del backend) */}
                <div className="border-t border-slate-800 pt-4 mt-6">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
            Controles de Prueba UI (TASK-018)
          </span>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => {
                                const nextAmount = currentPrice + 50000;
                                handleIncomingBid(auctionId, nextAmount, 'Usuario_Prueba', new Date().toISOString());
                            }}
                            className="px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded text-xs font-medium transition-colors"
                        >
                            + Simular Nueva Puja (+$50.000)
                        </button>

                        <button
                            onClick={() => {
                                handleTimeExtended(auctionId, new Date().toISOString(), 'Oferta registrada en el último minuto.');
                            }}
                            className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded text-xs font-medium transition-colors"
                        >
                            ⏳ Simular Extensión Anti-Sniping
                        </button>

                        <button
                            onClick={() => {
                                handleAuctionClosed(auctionId, 'Usuario_Ganador', currentPrice);
                            }}
                            className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded text-xs font-medium transition-colors"
                        >
                            🏆 Simular Fin de Subasta
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};