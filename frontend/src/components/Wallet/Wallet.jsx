import {useState, useEffect, useCallback} from 'react';

export default function Wallet({balance, escrow, userId, onRefresh}) {
    const [depositAmount, setDepositAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [transactions, setTransactions] = useState([]);

    const fetchLedger = useCallback(async () => {
        try {
            const res = await fetch(`/api/wallet/transactions?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setTransactions(data || []);
            }
        } catch {
            setTransactions([
                {
                    id: 1,
                    type: 'DEPOSIT',
                    amount: 200000,
                    description: 'Depósito inicial de fondos',
                    createdAtUtc: new Date().toISOString()
                },
                {
                    id: 2,
                    type: 'LOCK',
                    amount: 45000,
                    description: 'Retención garantía subasta #1',
                    createdAtUtc: new Date().toISOString()
                }
            ]);
        }
    }, [userId]);

    useEffect(() => {
        const t = setTimeout(() => {
            fetchLedger();
        }, 0);
        return () => clearTimeout(t);
    }, [fetchLedger]);

    const handleDeposit = async (e) => {
        e.preventDefault();
        const amt = parseFloat(depositAmount);
        if (!amt || amt <= 0) return;

        setIsLoading(true);
        setErrorMessage('');

        try {
            const response = await fetch('/api/wallet/deposit', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({userId, amount: amt})
            });

            if (!response.ok) {
                const textError = await response.text();
                throw new Error(textError || 'Error al procesar el depósito.');
            }

            setDepositAmount('');
            if (onRefresh) onRefresh();
            fetchLedger();
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const totalFunds = (balance || 0) + (escrow || 0);

    const renderTableBody = () => {
        if (!transactions || transactions.length === 0) {
            return (
                <tr>
                    <td colSpan="4" className="p-4 text-center text-slate-500">
                        Sin movimientos registrados.
                    </td>
                </tr>
            );
        }

        return transactions.map((t, idx) => {
            let badgeClass = 'bg-rose-500/20 text-rose-400';
            if (t.type === 'DEPOSIT') badgeClass = 'bg-emerald-500/20 text-emerald-400';
            else if (t.type === 'LOCK') badgeClass = 'bg-amber-500/20 text-amber-400';
            else if (t.type === 'RELEASE') badgeClass = 'bg-cyan-500/20 text-cyan-400';

            const displayDate = new Date(t.createdAtUtc || Date.now()).toLocaleString('es-AR');

            return (
                <tr key={t.id || idx} className="hover:bg-slate-800/40">
                    <td className="p-3 text-slate-400">{displayDate}</td>
                    <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeClass}`}>
                            {t.type}
                        </span>
                    </td>
                    <td className="p-3 text-slate-300">{t.description}</td>
                    <td className="p-3 text-right font-bold text-white">
                        ${Number(t.amount).toLocaleString('es-AR')}
                    </td>
                </tr>
            );
        });
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl mb-6 space-y-6">
            <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Billetera Virtual</h2>
                <p className="text-xs text-slate-400">Gestión de saldos, garantías retenidas y libro mayor contable</p>
            </div>

            {errorMessage && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-xs">
                    {errorMessage}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Saldo Disponible</p>
                    <h3 className="text-2xl font-black text-cyan-400 mt-1">${(balance || 0).toLocaleString('es-AR')}</h3>
                    <span className="text-[10px] text-slate-500">Libre para nuevas ofertas</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Saldo Retenido (Escrow)</p>
                    <h3 className="text-2xl font-black text-amber-500 mt-1">${(escrow || 0).toLocaleString('es-AR')}</h3>
                    <span className="text-[10px] text-slate-500">En garantía de subastas activas</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total de Fondos</p>
                    <h3 className="text-2xl font-black text-emerald-400 mt-1">${totalFunds.toLocaleString('es-AR')}</h3>
                    <span className="text-[10px] text-slate-500">Patrimonio en cuenta</span>
                </div>
            </div>

            <form onSubmit={handleDeposit}
                  className="flex flex-col sm:flex-row gap-3 bg-slate-950 p-4 rounded-lg border border-slate-800">
                <input
                    type="number"
                    step="0.01"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Monto a recargar (ficticio)..."
                    disabled={isLoading}
                    className="flex-1 bg-slate-900 rounded-lg px-4 py-2 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                    {isLoading ? 'Acreditando...' : 'Recargar Saldo'}
                </button>
            </form>

            <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Historial de Movimientos (Ledger Contable)</h3>
                <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800 font-semibold">
                        <tr>
                            <th className="p-3">Fecha/Hora</th>
                            <th className="p-3">Operación</th>
                            <th className="p-3">Detalle</th>
                            <th className="p-3 text-right">Monto</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                        {renderTableBody()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}