/* cSpell:disable */
import { useState, useEffect, useCallback } from 'react';
import { createAuctionHubConnection } from '../Services/AuctionHub.js';
import { useToast } from '../Context/ToastContext';
import { placeBidRequest } from '../Services/auctionService.js';

export const useAuctionSocket = (auctionId, initialPrice, currentUserId, onAntiSnipingExtend) => {
    const { addToast } = useToast();
    const [currentPrice, setCurrentPrice] = useState(initialPrice);
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [leadershipStatus, setLeadershipStatus] = useState('neutral');
    const [bidsHistory, setBidsHistory] = useState([
        {
            id: 1,
            amount: initialPrice,
            bidderUsername: 'Usuario_Inicial',
            bidderId: 'other-user',
            timestamp: new Date().toLocaleTimeString()
        }
    ]);
    const [isSimulatingNetwork, setIsSimulatingNetwork] = useState(false);

    const handleIncomingBid = useCallback((auctionIdReceived, amount, bidderUsername, timestamp, bidderId = null) => {
        if (Number(auctionIdReceived) !== Number(auctionId)) return;

        setCurrentPrice(amount);
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
    }, [auctionId, currentUserId, addToast]);

    const handleTimeExtended = useCallback((auctionIdReceived, newEndDate, reason) => {
        if (Number(auctionIdReceived) !== Number(auctionId)) return;
        if (onAntiSnipingExtend) onAntiSnipingExtend();
        addToast(`⏳ Anti-Sniping activado: Subasta extendida +2 minutos (${reason || 'Oferta en último minuto'}).`, 'warning', 6000);
    }, [auctionId, onAntiSnipingExtend, addToast]);

    const handleAuctionClosed = useCallback((auctionIdReceived, winnerUsername, finalAmount) => {
        if (Number(auctionIdReceived) !== Number(auctionId)) return;
        addToast(`🏆 Subasta finalizada. Ganador: ${winnerUsername} ($${Number(finalAmount).toLocaleString()})`, 'info', 7000);
    }, [auctionId, addToast]);

    const handleBidSubmit = async (amount) => {
        setIsSimulatingNetwork(true);
        try {
            const result = await placeBidRequest(auctionId, currentUserId, amount);

            if (result.success) {
                // El socket se encargará de actualizar el precio y el historial vía handleIncomingBid
            } else if (result.status === 409) {
                addToast(result.error || 'Conflicto de concurrencia: tu oferta fue superada en el mismo instante.', 'error');
            } else if (result.status === 400 || result.status === 422) {
                addToast(result.error || 'Saldo insuficiente para cubrir la garantía de la puja.', 'error');
            } else {
                addToast(result.error || `Error inesperado del servidor (HTTP ${result.status}).`, 'error');
            }
        } catch (error) {
            addToast('Error de comunicación con el servicio de subastas.', 'error');
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