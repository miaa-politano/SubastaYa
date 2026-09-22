import { useState, useEffect, useCallback } from 'react';
import { createAuctionHubConnection } from '../Services/AuctionHub.js';
import { useToast } from '../Context/ToastContext';

export const useAuctionSocket = (auctionId, initialPrice, currentUserId, onAntiSnipingExtend, onBidSuccess) => {
    const { addToast } = useToast();
    const [currentPrice, setCurrentPrice] = useState(Number(initialPrice || 0));
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [leadershipStatus, setLeadershipStatus] = useState('neutral');
    const [bidsHistory, setBidsHistory] = useState([
        {
            id: 1,
            amount: initialPrice,
            bidderUsername: 'Initial_User',
            bidderId: 'other-user',
            timestamp: new Date().toLocaleTimeString()
        }
    ]);
    const [isSimulatingNetwork, setIsSimulatingNetwork] = useState(false);

    const handleIncomingBid = useCallback((auctionIdReceived, amount, bidderUsername, timestamp, bidderId = null) => {
        if (Number(auctionIdReceived) !== Number(auctionId)) {
            return;
        }

        setCurrentPrice(amount);
        const isCurrentBidMine = bidderId ? String(bidderId) === String(currentUserId) : bidderUsername === String(currentUserId);

        setLeadershipStatus((prevStatus) => {
            if (isCurrentBidMine) {
                addToast(`Your bid for $${Number(amount).toLocaleString('en-US')} is currently winning.`, 'success');
                return 'leading';
            }
            if (prevStatus === 'leading') {
                addToast(`Alert! Your bid was outbid by ${bidderUsername}.`, 'error');
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
        if (Number(auctionIdReceived) !== Number(auctionId)) {
            return;
        }
        if (onAntiSnipingExtend) {
            onAntiSnipingExtend();
        }
        addToast(`Anti-Sniping triggered: Auction extended +2 minutes (${reason || 'Last minute bid'}).`, 'warning', 6000);
    }, [auctionId, onAntiSnipingExtend, addToast]);

    const handleAuctionClosed = useCallback((auctionIdReceived, winnerUsername, finalAmount) => {
        if (Number(auctionIdReceived) !== Number(auctionId)) {
            return;
        }
        addToast(`Auction closed. Winner: ${winnerUsername} ($${Number(finalAmount).toLocaleString('en-US')})`, 'info', 7000);
    }, [auctionId, addToast]);

    const parseNumericBidderId = (user) => {
        if (typeof user === 'number' && !isNaN(user)) {
            return user;
        }
        if (user && typeof user === 'object' && user.id) {
            return parseNumericBidderId(user.id);
        }
        if (typeof user === 'string') {
            const matches = user.match(/\d+/);
            if (matches) {
                return parseInt(matches[0], 10);
            }
            if (user.toLowerCase().includes('comprador2') || user.toLowerCase().includes('general')) {
                return 3;
            }
            if (user.toLowerCase().includes('comprador1')) {
                return 2;
            }
            if (user.toLowerCase().includes('vendedor')) {
                return 1;
            }
            if (user.toLowerCase().includes('sinfondos')) {
                return 4;
            }
        }
        return 3;
    };

    const handleBidSubmit = async (amount) => {
        setIsSimulatingNetwork(true);
        const numericBidderId = parseNumericBidderId(currentUserId);

        try {
            const response = await fetch(`/api/auctions/${auctionId}/bids`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    bidderId: numericBidderId,
                    amount: Number(amount)
                })
            });

            if (response.ok) {
                handleIncomingBid(auctionId, amount, 'YOU', new Date().toISOString(), numericBidderId);

                if (onBidSuccess) {
                    onBidSuccess(amount);
                }
                return true;
            }
            if (response.status === 409) {
                addToast('HTTP 409 Conflict: Bid rejected due to optimistic concurrency lock.', 'error');
                throw new Error('Concurrency collision while processing bid.');
            }
            if (response.status === 400 || response.status === 422) {
                addToast('Validation error: Insufficient funds or bid below minimum increment.', 'warning');
                throw new Error('Balance validation or increment check failed.');
            }
            addToast(`Server error (${response.status}) while placing bid.`, 'error');
            throw new Error('Internal backend error.');
        } catch (error) {
            console.error('Bid submission error:', error);
            if (!error.message || error.message.includes('Failed to fetch')) {
                addToast('Network error: Unable to reach the auction service.', 'error');
            }
            throw error;
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