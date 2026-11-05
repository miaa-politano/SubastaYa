import { useState } from 'react';
import { useToast } from '../../Context/ToastContext.jsx';

export const AuctionCreationModal = ({ isOpen, onClose, onCreated, sellerId = 1 }) => {
    const { addToast } = useToast();
    const [form, setForm] = useState({ title: '', description: '', categoryId: 1, startingPrice: '', minIncrement: '5000', durationMinutes: '30' });
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

    const handleSubmit = async (event) => {
        event.preventDefault();
        const startingPrice = Number(form.startingPrice);
        const minIncrement = Number(form.minIncrement);
        const durationMinutes = Number(form.durationMinutes);
        if (!form.title.trim() || startingPrice <= 0 || minIncrement <= 0 || durationMinutes <= 0) {
            addToast('Completá los datos con valores positivos.', 'warning');
            return;
        }
        const startDateUtc = new Date();
        const endDateUtc = new Date(startDateUtc.getTime() + durationMinutes * 60_000);
        setIsLoading(true);
        try {
            const response = await fetch('/api/auctions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sellerId, categoryId: Number(form.categoryId), title: form.title.trim(), description: form.description.trim(), startingPrice, minIncrement, startDateUtc: startDateUtc.toISOString(), endDateUtc: endDateUtc.toISOString() })
            });
            if (!response.ok) throw new Error((await response.text()) || 'No se pudo crear la subasta.');
            addToast('Subasta publicada correctamente.', 'success');
            onClose();
            onCreated?.();
        } catch (error) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-lg shadow-2xl space-y-4">
                <div className="flex justify-between items-center"><h2 className="text-lg font-bold text-white">Publicar subasta</h2><button type="button" onClick={onClose} className="text-slate-400">✕</button></div>
                <input name="title" required value={form.title} onChange={updateField} placeholder="Título del producto" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" />
                <textarea name="description" value={form.description} onChange={updateField} placeholder="Descripción" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" />
                <div className="grid grid-cols-2 gap-3">
                    <select name="categoryId" value={form.categoryId} onChange={updateField} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"><option value="1">Tecnología</option><option value="2">Coleccionables</option><option value="3">Indumentaria</option><option value="4">Vehículos</option></select>
                    <input name="durationMinutes" type="number" min="1" value={form.durationMinutes} onChange={updateField} placeholder="Duración (min.)" className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" />
                    <input name="startingPrice" type="number" min="0.01" step="0.01" required value={form.startingPrice} onChange={updateField} placeholder="Precio base" className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" />
                    <input name="minIncrement" type="number" min="0.01" step="0.01" required value={form.minIncrement} onChange={updateField} placeholder="Incremento mínimo" className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" />
                </div>
                <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300">Cancelar</button><button type="submit" disabled={isLoading} className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-lg disabled:opacity-50">{isLoading ? 'Publicando...' : 'Crear subasta'}</button></div>
            </form>
        </div>
    );
};
