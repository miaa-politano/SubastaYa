/* cSpell:disable */
import { useState, useEffect, useCallback } from 'react';

export default function Wallet() {
    const [balance, setBalance] = useState({ total: 0, available: 0, escrow: 0 });
    const [depositAmount, setDepositAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const userId = 2;

    const fetchWalletBalance = useCallback(async () => {
        try {
            const response = await fetch(`/api/wallet/balance?userId=${userId}`);
            if (!response.ok) return;

            const data = await response.json();
            setBalance({
                total: data.totalBalance || 0,
                available: data.availableBalance || 0,
                escrow: data.lockedBalance || 0
            });
            setErrorMessage('');
        } catch (error) {
            setErrorMessage('Error al conectar con el microservicio financiero.');
            console.error(error);
        }
    }, [userId]);

    useEffect(() => {
        let isMounted = true;

        const startSync = async () => {
            if (isMounted) {
                await fetchWalletBalance();
            }
        };

        startSync().catch(console.error);

        return () => {
            isMounted = false;
        };
    }, [fetchWalletBalance]);

    const handleDeposit = async (e) => {
        e.preventDefault();
        if (!depositAmount || parseFloat(depositAmount) <= 0) return;

        setIsLoading(true);
        setErrorMessage('');

        try {
            const response = await fetch('/api/wallet/deposit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userId,
                    amount: parseFloat(depositAmount)
                })
            });

            if (!response.ok) {
                const textError = await response.text();
                setErrorMessage(textError || 'Error al procesar el depósito.');
                setIsLoading(false);
                return;
            }

            setDepositAmount('');
            await fetchWalletBalance();
        } catch (error) {
            setErrorMessage('Error al procesar el depósito.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl mb-6">
            <h2 className="text-xl font-bold text-white mb-4 tracking-tight">Billetera Virtual</h2>

            {errorMessage && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm mb-4">
                    {errorMessage}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Saldo Disponible</p>
                    <h3 className="text-2xl font-bold text-cyan-400 mt-1">${balance.available.toLocaleString('es-AR')}</h3>
                </div>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Saldo en Garantía (Escrow)</p>
                    <h3 className="text-2xl font-bold text-amber-500 mt-1">${balance.escrow.toLocaleString('es-AR')}</h3>
                </div>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total de Fondos</p>
                    <h3 className="text-2xl font-bold text-emerald-400 mt-1">${balance.total.toLocaleString('es-AR')}</h3>
                </div>
            </div>

            <form onSubmit={handleDeposit} className="flex flex-col sm:flex-row gap-3">
                <input
                    type="number"
                    step="0.01"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Ingresa el monto a depositar"
                    disabled={isLoading}
                    className="flex-1 bg-slate-950 rounded-lg px-4 py-2 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 text-white"
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                    {isLoading ? 'Procesando...' : 'Cargar Fondos'}
                </button>
            </form>
        </div>
    );
}