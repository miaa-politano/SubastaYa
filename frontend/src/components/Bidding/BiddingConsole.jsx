/* cSpell:disable */
import { useState } from 'react';
import { useToast } from '../../Context/ToastContext.jsx';

export const BiddingConsole = ({ auction, onBidSubmit, walletBalance }) => {
    const { addToast } = useToast();
    const currentPrice = Number(auction?.currentPrice || 0);
    const minIncrement = Number(auction?.minIncrement || 1000);
    const isClosed = auction?.isClosed || false;

    const suggestedBid = currentPrice + minIncrement;

    const [customBid, setCustomBid] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleBid = async (amount) => {
        const bidAmount = Number(amount);

        if (!bidAmount || bidAmount <= 0) {
            addToast('Ingresa un monto numérico mayor a cero.', 'warning');
            return;
        }

        if (bidAmount < suggestedBid) {
            addToast(`La oferta mínima requerida es $${suggestedBid.toLocaleString('es-AR')}.`, 'warning');
            return;
        }

        if (walletBalance !== undefined && bidAmount > Number(walletBalance)) {
            addToast('Fondos insuficientes en saldo disponible para respaldar la oferta (Garantía Escrow).', 'error');
            return;
        }

        setIsLoading(true);
        try {
            await onBidSubmit(bidAmount);
            setCustomBid('');
        } catch (error) {
            addToast(error.message || 'Error al procesar la puja.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (isClosed) {
        return (
            <div className="p-4 bg-slate-800/80 rounded-xl text-center font-semibold text-slate-400 border border-slate-700">
                La subasta ha finalizado. Las ofertas están cerradas.
            </div>
        );
    }

    return (
        <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Consola de Puja Dinámica</h3>

            <button
                onClick={() => handleBid(suggestedBid)}
                disabled={isLoading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
                {isLoading ? (
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full"></span>
                ) : (
                    `⚡ Puja Automática: $${suggestedBid.toLocaleString('es-AR')}`
                )}
            </button>

            <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400 font-bold">$</span>
                <input
                    type="number"
                    value={customBid}
                    onChange={(e) => setCustomBid(e.target.value)}
                    disabled={isLoading}
                    placeholder={`Monto manual (Min: $${suggestedBid.toLocaleString('es-AR')})`}
                    className="w-full pl-8 pr-24 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                />
                <button
                    onClick={() => handleBid(customBid)}
                    disabled={isLoading || !customBid}
                    className="absolute right-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-xs py-1.5 px-3 rounded-md transition-colors border border-slate-600 disabled:opacity-50"
                >
                    Ofertar
                </button>
            </div>
        </div>
    );
};