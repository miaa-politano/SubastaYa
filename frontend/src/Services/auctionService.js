const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const placeBidRequest = async (auctionId, bidderId, amount) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auctions/${auctionId}/bids`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bidderId: Number(bidderId),
                amount: Number(amount)
            })
        });

        if (response.ok) {
            const data = await response.json().catch(() => null);
            return { success: true, status: response.status, data };
        }

        if (response.status === 409) {
            return {
                success: false,
                status: 409,
                error: 'Conflicto de concurrencia: tu oferta fue superada en el mismo instante.'
            };
        }

        if (response.status === 400 || response.status === 422) {
            const errorPayload = await response.json().catch(() => ({}));
            return {
                success: false,
                status: response.status,
                error: errorPayload.message || 'Saldo insuficiente o datos de oferta inválidos.'
            };
        }

        return {
            success: false,
            status: response.status,
            error: `Error inesperado del servidor (HTTP ${response.status}).`
        };
    } catch (err) {
        return {
            success: false,
            status: 0,
            error: 'No se pudo establecer conexión con el microservicio.'
        };
    }
};

export const fetchAuctionDetails = async (auctionId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auctions/${auctionId}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Error al recuperar la subasta #${auctionId}:`, error);
        return null;
    }
};