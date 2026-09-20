/* cSpell:disable */
import { useState } from 'react';
import { useToast } from '../../Context/ToastContext';

const MESSAGES = {
    invalidAmount: 'Por favor, ingresa un monto numérico válido mayor a 0.',
    lowAmount: 'La oferta es menor al monto mínimo permitido.',
    insufficientFunds: 'Fondos insuficientes en tu billetera virtual (Garantía Escrow).',
    defaultError: 'Error al procesar la puja. Inténtalo de nuevo.',
    closedAuction: 'La subasta ha finalizado. Las ofertas están cerradas.',
    title: 'Consola de Puja Dinámica',
    autoBid: 'Oferta Automática: $',
    manualPlaceholder: 'Monto manual (Min: $',
    submitBtn: 'Ofertar'
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

        if (walletBalance > 0 && bidAmount > walletBalance) {
            console.warn("Validación local: El monto supera el saldo disponible actual.");
        }

        setIsLoading(true);

        try {
            await onBidSubmit(bidAmount);
            setCustomBid('');
        } catch (error) {
            addToast(error.message || MESSAGES.defaultError, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (isClosed) {
        return (
            <div className="p-4 bg-gray-100 rounded-lg text-center font-medium text-gray-500 border border-gray-200">
                {MESSAGES.closedAuction}
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{MESSAGES.title}</h3>

            <button
                onClick={() => handleBid(suggestedBid)}
                disabled={isLoading}
                className="w-full mb-4 bg-amber-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
                ) : (
                    `${MESSAGES.autoBid}${suggestedBid}`
                )}
            </button>

            <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-medium">$</span>
                </div>

                <input
                    type="number"
                    value={customBid}
                    onChange={(e) => setCustomBid(e.target.value)}
                    disabled={isLoading}
                    placeholder={`${MESSAGES.manualPlaceholder}${suggestedBid})`}
                    className="w-full pl-8 pr-24 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-700 font-medium"
                />

                <button
                    onClick={() => handleBid(customBid)}
                    disabled={isLoading || !customBid}
                    className="absolute right-2 bg-gray-800 text-white text-sm font-semibold py-2 px-4 rounded-md transition-colors"
                >
                    {MESSAGES.submitBtn}
                </button>
            </div>
        </div>
    );
};