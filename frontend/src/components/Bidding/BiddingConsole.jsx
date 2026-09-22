import { useState } from 'react';
import { useToast } from '../../Context/ToastContext';

const MESSAGES = {
    invalidAmount: 'Please enter a valid numeric amount greater than 0.',
    lowAmount: 'The bid amount is lower than the minimum required increment.',
    insufficientFunds: 'Insufficient funds in your wallet (Escrow Guarantee).',
    defaultError: 'Error processing bid. Please try again.',
    closedAuction: 'The auction has ended. Bidding is closed.',
    title: 'Dynamic Bidding Console',
    autoBid: 'Automatic Bid: $',
    manualPlaceholder: 'Custom amount (Min: $',
    submitBtn: 'Bid'
};

export const BiddingConsole = ({ auction, onBidSubmit, walletBalance }) => {
    const { addToast } = useToast();
    const currentPrice = Number(auction?.currentPrice || 0);
    const minIncrement = Number(auction?.minIncrement || 0);
    const isClosed = auction?.isClosed || false;

    const suggestedBid = currentPrice + minIncrement;

    const [customBid, setCustomBid] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleBid = async (amount) => {
        const bidAmount = Number(amount);

        if (!bidAmount || bidAmount <= 0) {
            addToast(MESSAGES.invalidAmount, 'warning');
            return;
        }

        if (bidAmount < suggestedBid) {
            addToast(MESSAGES.lowAmount, 'warning');
            return;
        }

        const available = Number(walletBalance);
        if (!isNaN(available) && available > 0 && bidAmount > available) {
            addToast(MESSAGES.insufficientFunds, 'error');
            return;
        }

        setIsLoading(true);

        try {
            await onBidSubmit(bidAmount);
            setCustomBid('');
        } catch {
        } finally {
            setIsLoading(false);
        }
    };

    if (isClosed) {
        return (
            <div className="p-4 bg-slate-900 rounded-lg text-center font-medium text-slate-400 border border-slate-800">
                {MESSAGES.closedAuction}
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-900 rounded-xl shadow-md border border-slate-800 max-w-md mx-auto text-slate-100">
            <h3 className="text-lg font-semibold text-white mb-4">{MESSAGES.title}</h3>

            <button
                type="button"
                onClick={() => handleBid(suggestedBid)}
                disabled={isLoading}
                className="w-full mb-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
                ) : (
                    `${MESSAGES.autoBid}${suggestedBid.toLocaleString('en-US')}`
                )}
            </button>

            <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-medium">$</span>
                </div>

                <input
                    type="number"
                    value={customBid}
                    onChange={(e) => setCustomBid(e.target.value)}
                    disabled={isLoading}
                    placeholder={`${MESSAGES.manualPlaceholder}${suggestedBid.toLocaleString('en-US')})`}
                    className="w-full pl-8 pr-24 py-3 bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white font-medium placeholder-slate-500"
                />

                <button
                    type="button"
                    onClick={() => handleBid(customBid)}
                    disabled={isLoading || !customBid}
                    className="absolute right-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800/50 text-cyan-400 text-sm font-semibold py-2 px-4 rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                    {MESSAGES.submitBtn}
                </button>
            </div>
        </div>
    );
};