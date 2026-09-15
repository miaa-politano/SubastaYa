import { useState, useEffect, useCallback } from 'react';

export default function Wallet() {
    const [balance, setBalance] = useState({ total: 0, available: 0, escrow: 0 });
    const [depositAmount, setDepositAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const fetchWalletBalance = useCallback(async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    total: 150000,
                    available: 105000,
                    escrow: 45000
                });
            }, 3000);
        });
    }, []);

    useEffect(() => {
        let isMounted = true;

        const loadInitialBalance = async () => {
            const data = await fetchWalletBalance();
            if (isMounted) {
                setBalance(data);
            }
        };

        loadInitialBalance();
        return () => { isMounted = false; };
    }, [fetchWalletBalance]);

    const handleDeposit = async (e) => {
        e.preventDefault();
        if (!depositAmount || parseFloat(depositAmount) <= 0) return;

        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 3000));
            setDepositAmount('');
            const data = await fetchWalletBalance();
            setBalance(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl mb-6">
            <h2 className="text-xl font-bold text-white mb-4 tracking-tight">Billetera Virtual</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Saldo Disponible</p>
                    <h3 className="text-2xl font-bold text-cyan-400 mt-1">${balance.available.toLocaleString()}</h3>
                </div>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Saldo en Garantía (Escrow)</p>
                    <h3 className="text-2xl font-bold text-amber-500 mt-1">${balance.escrow.toLocaleString()}</h3>
                </div>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total de Fondos</p>
                    <h3 className="text-2xl font-bold text-emerald-400 mt-1">${balance.total.toLocaleString()}</h3>
                </div>
            </div>

            <form onSubmit={handleDeposit} className="flex flex-col sm:flex-row gap-3">
                <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Ingresa el monto a depositar"
                    disabled={isLoading}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 placeholder-slate-500 disabled:opacity-50"
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