/* cSpell:disable */
import { useState, useEffect, useCallback, useRef } from 'react';
import { createAuctionHubConnection } from '../Services/AuctionHub.js';
import { useToast } from '../Context/ToastContext';

export const useAuctionSocket = (auctionId, initialPrice, currentUserId, onAntiSnipingExtend, onBidSuccess) => {
    const { addToast } = useToast();
    const [currentPrice, setCurrentPrice] = useState(Number(initialPrice || 0));
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [leadershipStatus, setLeadershipStatus] = useState('neutral');
    const [bidsHistory, setBidsHistory] = useState([]);
    const [isSimulatingNetwork, setIsSimulatingNetwork] = useState(false);

    const onAntiSnipingRef = useRef(onAntiSnipingExtend);
    const onBidSuccessRef = useRef(onBidSuccess);
    const currentUserIdRef = useRef(currentUserId);
    const addToastRef = useRef(addToast);
    const leadershipRef = useRef('neutral');

    useEffect(() => {
        onAntiSnipingRef.current = onAntiSnipingExtend;
        onBidSuccessRef.current = onBidSuccess;
        currentUserIdRef.current = currentUserId;
        addToastRef.current = addToast;
    }, [onAntiSnipingExtend, onBidSuccess, currentUserId, addToast]);

    const handleIncomingBid = useCallback((auctionIdReceived, amount, bidderUsername, timestamp, bidderId = null) => {
        if (Number(auctionIdReceived) !== Number(auctionId)) return;

        setCurrentPrice(Number(amount));
        const userId = Number(currentUserIdRef.current);
        const isCurrentBidMine = bidderId !== null ? Number(bidderId) === userId : false;

        if (isCurrentBidMine) {
            leadershipRef.current = 'leading';
            setLeadershipStatus('leading');
            addToastRef.current(`Tu oferta por $${Number(amount).toLocaleString('es-AR')} lidera la subasta.`, 'success');
        } else if (leadershipRef.current === 'leading') {
            leadershipRef.current = 'outbid';
            setLeadershipStatus('outbid');
            addToastRef.current(`¡Alerta! Tu oferta fue superada por ${bidderUsername}.`, 'error');
        }

        setBidsHistory((prev) => [
            {
                id: `${Date.now()}-${Math.random()}`,
                amount: Number(amount),
                bidderUsername: isCurrentBidMine ? `${bidderUsername} (TÚ)` : bidderUsername,
                bidderId: bidderId || bidderUsername,
                timestamp: new Date(timestamp).toLocaleTimeString()
            },
            ...prev
        ]);

        if (onBidSuccessRef.current) {
            onBidSuccessRef.current();
        }
    }, [auctionId]);

    const handleTimeExtended = useCallback((auctionIdReceived, newEndDate, reason) => {
        if (Number(auctionIdReceived) !== Number(auctionId)) return;
        if (onAntiSnipingRef.current) {
            onAntiSnipingRef.current(newEndDate);
        }
        addToastRef.current(`⏳ Anti-Sniping activado: Subasta extendida (${reason || 'Oferta en último minuto'}).`, 'warning', 6000);
    }, [auctionId]);

    const handleAuctionClosed = useCallback((auctionIdReceived, winnerUsername, finalAmount) => {
        if (Number(auctionIdReceived) !== Number(auctionId)) return;
        addToastRef.current(`🏆 Subasta finalizada. Ganador: ${winnerUsername} ($${Number(finalAmount).toLocaleString('es-AR')})`, 'info', 7000);
        if (onBidSuccessRef.current) {
            onBidSuccessRef.current();
        }
    }, [auctionId]);

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
                if (onBidSuccessRef.current) {
                    onBidSuccessRef.current();
                }
            } else if (response.status === 409) {
                addToast('HTTP 409 Conflict: Oferta rechazada por concurrencia (bloqueo optimista).', 'error');
            } else if (response.status === 400 || response.status === 422) {
                const errData = await response.json().catch(() => null);
                const serverMsg = errData?.message || errData?.error || 'Error de validación: No puedes pujar en tu propia subasta o el monto es inválido.';
                addToast(serverMsg, 'warning');
            } else {
                addToast('Error al procesar la oferta en el servidor.', 'error');
            }
        } catch (error) {
            console.error("Fallo de red en la puja:", error);
            addToast('Error de red. No se pudo conectar con el microservicio de Java.', 'error');
        } finally {
            setIsSimulatingNetwork(false);
        }
    };

    useEffect(() => {
        if (!auctionId) return;
        let isMounted = true;

        const safeSetStatus = (status) => {
            if (isMounted) setConnectionStatus(status);
        };

        const handlers = {
            onNewBid: handleIncomingBid,
            onTimeExtended: handleTimeExtended,
            onAuctionClosed: handleAuctionClosed
        };

        const connection = createAuctionHubConnection(auctionId, handlers, safeSetStatus);

        return () => {
            isMounted = false;
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