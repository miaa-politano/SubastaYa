/* cSpell:disable */
import { useState, useEffect, useCallback } from 'react';
import { createAuctionHubConnection } from '../Services/AuctionHub.js';
import { useToast } from '../Context/ToastContext.jsx';

export const useAuctionSocket = (auctionId, initialPrice, currentUserId, onAntiSnipingExtend, onBidSuccess) => {
    const { addToast } = useToast();
    const [currentPrice, setCurrentPrice] = useState(Number(initialPrice || 0));
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [leadershipStatus, setLeadershipStatus] = useState('neutral');
    const [bidsHistory, setBidsHistory] = useState([]);
    const [isSimulatingNetwork, setIsSimulatingNetwork] = useState(false);

    const handleIncomingBid = useCallback((auctionIdReceived, amount, bidderUsername, timestamp, bidderId = null) => {
        if (Number(auctionIdReceived) !== Number(auctionId)) return;

        setCurrentPrice(Number(amount));
        const isCurrentBidMine = bidderId ? Number(bidderId) === Number(currentUserId) : bidderUsername === currentUserId;

        setLeadershipStatus((prevStatus) => {
            if (isCurrentBidMine) {
                addToast(`Tu oferta por $${Number(amount).toLocaleString()} lidera la subasta.`, 'success');
                return 'leading';
            }
            if (prevStatus === 'leading') {
                addToast(`¡Alerta! Tu oferta fue superada por ${bidderUsername}.`, 'error');
                return 'outbid';
            }
            return 'outbid';
        });

        setBidsHistory((prev) => [
            {
                id: Date.now(),
                amount: Number(amount),
                bidderUsername,
                bidderId: bidderId || bidderUsername,
                timestamp: new Date(timestamp).toLocaleTimeString()
            },
            ...prev
        ]);
    }, [auctionId, currentUserId, addToast]);

    const handleTimeExtended = useCallback((auctionIdReceived, newEndDate, reason) => {
        if (Number(auctionIdReceived) !== Number(auctionId)) return;
        if (onAntiSnipingExtend) onAntiSnipingExtend(newEndDate);
        addToast(`⏳ Anti-Sniping activado: Subasta extendida +2 minutos (${reason || 'Oferta en último minuto'}).`, 'warning', 6000);
    }, [auctionId, onAntiSnipingExtend, addToast]);

    const handleAuctionClosed = useCallback((auctionIdReceived, winnerUsername, finalAmount) => {
        if (Number(auctionIdReceived) !== Number(auctionId)) return;
        addToast(`🏆 Subasta finalizada. Ganador: ${winnerUsername} ($${Number(finalAmount).toLocaleString()})`, 'info', 7000);
    }, [auctionId, addToast]);

    const handleBidSubmit = async (amount) => {
        setIsSimulatingNetwork(true);
        try {
            const response = await fetch(`/api/auctions/${auctionId}/bids`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    bidderId: Number(currentUserId),
                    amount: Number(amount)
                })
            });

            if (response.ok) {
                addToast(`¡Puja enviada con éxito por $${Number(amount).toLocaleString()}!`, 'success');
                if (onBidSuccess) {
                    onBidSuccess();
                }
            } else if (response.status === 409) {
                addToast('HTTP 409 Conflict: Oferta rechazada por concurrencia (bloqueo optimista).', 'error');
            } else if (response.status === 400 || response.status === 422) {
                const errorData = await response.json().catch(() => null);
                addToast(errorData?.detail || 'Error de validación: Saldo insuficiente o incremento no alcanzado.', 'warning');
            } else {
                addToast('Error al procesar la oferta en el servidor.', 'error');
            }
        } catch (error) {
            console.error("Fallo de red en la puja:", error);
            addToast('Error de red al conectar con el servidor transaccional.', 'error');
        } finally {
            setIsSimulatingNetwork(false);
        }
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
                connection.stop().catch(() => {});
            }
        };
    }, [auctionId, handleIncomingBid, handleTimeExtended, handleAuctionClosed]);

    return {
        currentPrice,
        connectionStatus,
        leadershipStatus,
        bidsHistory,
        isSimulatingNetwork,
        handleIncomingBid,
        handleTimeExtended,
        handleBidSubmit
    };
};