/* cSpell:disable */
import { useState } from 'react';
import { useToast } from '../../Context/ToastContext.jsx';

export const AuctionCreationModal = ({ isOpen, onClose, onCreated, sellerId = 1 }) => {
    const { addToast } = useToast();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState(1);
    const [startingPrice, setStartingPrice] = useState('');
    const [minIncrement, setMinIncrement] = useState('5000');
    const [durationMinutes, setDurationMinutes] = useState('30');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const base = parseFloat(startingPrice);
        const inc = parseFloat(minIncrement);
        const dur = parseInt(durationMinutes, 10);

        if (!title.trim() || base <= 0 || inc <= 0 || dur <= 0) {
            addToast('Todos los campos deben ser válidos y positivos.', 'warning');
            return;
        }

        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + dur * 60000);

        setIsLoading(true);
        try {
            const res = await fetch('/api/auctions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sellerId,
                    categoryId: Number(categoryId),
                    title,
                    description,
                    startingPrice: base,
                    minIncrement: inc,
                    startDateUtc: startDate.toISOString(),
                    endDateUtc: endDate.toISOString()
                })
            });

            if (!res.ok) {
                const err = await res.text();
                throw new Error(err || 'Error al crear subasta');
            }

            addToast('¡Subasta publicada con éxito!', 'success');
            onClose();
            if (onCreated) onCreated();
        } catch (error) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-lg shadow-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h3 className="text-lg font-bold text-white">Publicar Nueva Subasta</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                    <div>
                        <label className="text-slate-400 font-semibold block mb-1">Título del Producto</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ej. MacBook Pro M3 16GB"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                    </div>

                    <div>
                        <label className="text-slate-400 font-semibold block mb-1">Descripción</label>
                        <textarea
                            rows="2"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Detalles del estado, accesorios incluidos..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-400 font-semibold block mb-1">Categoría</label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(Number(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            >
                                <option value="1">Tecnología</option>
                                <option value="2">Coleccionables</option>
                                <option value="3">Indumentaria</option>
                                <option value="4">Vehículos</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-slate-400 font-semibold block mb-1">Duración (minutos)</label>
                            <input
                                type="number"
                                min="1"
                                value={durationMinutes}
                                onChange={(e) => setDurationMinutes(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-slate-400 font-semibold block mb-1">Precio Base ($)</label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={startingPrice}
                                onChange={(e) => setStartingPrice(e.target.value)}
                                placeholder="50000"
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            />
                        </div>
                        <div>
                            <label className="text-slate-400 font-semibold block mb-1">Incremento Mínimo ($)</label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={minIncrement}
                                onChange={(e) => setMinIncrement(e.target.value)}
                                placeholder="2000"
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 font-semibold"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-lg hover:bg-cyan-400 disabled:opacity-50"
                        >
                            {isLoading ? 'Publicando...' : 'Crear Subasta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};