/* cSpell:disable */
import { useState } from 'react';
import { useToast } from '../../Context/ToastContext.jsx';

const DEFAULT_IMAGE = 'https://unsplash.com';

const CATEGORIES = [
    { id: 1, name: 'Tecnología' },
    { id: 2, name: 'Coleccionables' },
    { id: 3, name: 'Vehículos' }
];

export const CreateAuctionForm = ({ currentUserId, onSuccess, onCancel }) => {
    const { addToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState(1);
    const [startingPrice, setStartingPrice] = useState('');
    const [minIncrement, setMinIncrement] = useState('5000');
    const [durationMinutes, setDurationMinutes] = useState('60');
    const [imageUrl, setImageUrl] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const startPrice = Number(startingPrice);
        const increment = Number(minIncrement);
        const duration = Number(durationMinutes);

        if (!title.trim()) {
            addToast('Ingresá un título para la publicación.', 'warning');
            return;
        }
        if (startPrice <= 0 || increment <= 0) {
            addToast('El precio base y el incremento deben ser mayores a 0.', 'warning');
            return;
        }

        setIsSubmitting(true);
        const now = new Date();
        const end = new Date(now.getTime() + duration * 60 * 1000);
        const selectedCat = CATEGORIES.find((c) => c.id === Number(categoryId));

        const payload = {
            sellerId: Number(currentUserId),
            categoryId: Number(categoryId),
            categoryName: selectedCat ? selectedCat.name : 'Tecnología',
            title: title.trim(),
            description: description.trim() || 'Artículo verificado disponible para puja en tiempo real.',
            startingPrice: startPrice,
            initialPrice: startPrice,
            minIncrement: increment,
            startDateUtc: now.toISOString(),
            endDateUtc: end.toISOString(),
            endDate: end.toISOString(),
            imageUrl: imageUrl.trim() || DEFAULT_IMAGE
        };

        try {
            const response = await fetch('/api/auctions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                addToast('¡Subasta publicada con éxito!', 'success');
                onSuccess();
            } else {
                const errText = await response.text();
                addToast(errText || 'No se pudo crear la subasta.', 'error');
            }
        } catch (error) {
            console.error('Error al crear subasta:', error);
            addToast('Error de red al intentar publicar.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
                Publicar Nuevo Artículo en Subasta
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block text-xs font-medium text-slate-400">
                    Título del producto *
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ej: MacBook Pro M3 14 pulgadas"
                        className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                </label>

                <label className="block text-xs font-medium text-slate-400">
                    Categoría
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(Number(e.target.value))}
                        className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    >
                        {CATEGORIES.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="block text-xs font-medium text-slate-400">
                    Precio Base ($) *
                    <input
                        type="number"
                        required
                        min="1"
                        value={startingPrice}
                        onChange={(e) => setStartingPrice(e.target.value)}
                        placeholder="Ej: 50000"
                        className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                </label>

                <label className="block text-xs font-medium text-slate-400">
                    Incremento Mínimo ($) *
                    <input
                        type="number"
                        required
                        min="1"
                        value={minIncrement}
                        onChange={(e) => setMinIncrement(e.target.value)}
                        placeholder="Ej: 5000"
                        className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                </label>

                <label className="block text-xs font-medium text-slate-400">
                    Duración
                    <select
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(e.target.value)}
                        className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    >
                        <option value="2">2 minutos (Prueba Anti-Sniping)</option>
                        <option value="15">15 minutos</option>
                        <option value="60">1 hora</option>
                        <option value="1440">24 horas</option>
                    </select>
                </label>

                <label className="block text-xs font-medium text-slate-400">
                    URL de Imagen (opcional)
                    <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://..."
                        className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                </label>
            </div>

            <label className="block text-xs font-medium text-slate-400">
                Descripción
                <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalles del estado del producto, accesorios incluidos..."
                    className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
            </label>

            <div className="flex justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? 'Publicando...' : 'Publicar Subasta'}
                </button>
            </div>
        </form>
    );
};