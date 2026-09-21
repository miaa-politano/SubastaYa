/* cSpell:disable */
import { useState, useEffect } from 'react';
import { BidItem } from './BidItem.jsx';
import { PublicationItem } from './PublicationItem.jsx';

export const UserActivity = ({ onSelectAuction, currentEscrow }) => {
    const [activeTab, setActiveTab] = useState('bids');
    const [myBids, setMyBids] = useState([]);
    const [myPublications, setMyPublications] = useState([]);

    const currentUserId = 2;

    useEffect(() => {
        fetch(`/api/auctions/bids/user/${currentUserId}`)
            .then((res) => res.json())
            .then((data) => {
                const mappedBids = (data || []).map((bid, index) => ({
                    id: bid['id'] || index,
                    auctionId: bid['auctionId'],
                    title: bid['auctionTitle'] || `Subasta #${bid['auctionId']}`,
                    myBidAmount: bid['amount'],
                    currentHighestBid: bid['currentAuctionPrice'] || bid['amount'],
                    status: bid['isHighest'] ? 'winning' : 'outbid',
                    escrowLocked: bid['isHighest'],
                    endDate: 'Activa'
                }));
                setMyBids(mappedBids);
            })
            .catch((err) => {
                console.error("Error al conectar con el historial de Java:", err);
                setMyBids([
                    {
                        id: 1,
                        auctionId: 1,
                        title: 'Notebook Gamer Lenovo Legion',
                        myBidAmount: 60000,
                        currentHighestBid: 120000,
                        status: 'outbid',
                        escrowLocked: false,
                        endDate: 'Activa'
                    }
                ]);
            });

        fetch(`/api/auctions/seller/${currentUserId}`)
            .then((res) => res.json())
            .then((data) => {
                const mappedPubs = (data || []).map((pub, index) => ({
                    id: pub['id'] || index,
                    title: pub['title'],
                    initialPrice: pub['startingPrice'] || pub['initialPrice'] || 0,
                    currentHighestBid: pub['currentPrice'] || 0,
                    totalBids: pub['version'] || 0,
                    status: pub['status'] === 'ACTIVE' ? 'active' : 'completed',
                    endDate: pub['status'] === 'ACTIVE' ? 'En progreso' : 'Finalizada'
                }));
                setMyPublications(mappedPubs);
            })
            .catch((err) => console.error("Error al buscar publicaciones:", err));
    }, [activeTab]);

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg">
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Panel de Actividad</h2>
                    <p className="text-xs text-slate-400">Control de pujas, garantías retenidas y ventas activas</p>
                </div>

                <div className="bg-slate-950 px-4 py-2.5 rounded-lg border border-slate-800 flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                        Total en Garantía (Escrow):
                    </span>
                    <span className="text-lg font-extrabold text-amber-400">
                        ${(currentEscrow || 0).toLocaleString('es-AR')}
                    </span>
                </div>
            </div>

            <div className="flex border-b border-slate-800 space-x-4">
                <button
                    onClick={() => setActiveTab('bids')}
                    className={`pb-3 px-2 text-sm font-semibold transition-colors relative ${
                        activeTab === 'bids'
                            ? 'text-cyan-400 border-b-2 border-cyan-400'
                            : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                    Mis Compras y Pujas ({myBids.length})
                </button>

                <button
                    onClick={() => setActiveTab('publications')}
                    className={`pb-3 px-2 text-sm font-semibold transition-colors relative ${
                        activeTab === 'publications'
                            ? 'text-cyan-400 border-b-2 border-cyan-400'
                            : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                    Mis Publicaciones ({myPublications.length})
                </button>
            </div>

            {activeTab === 'bids' && (
                <div className="space-y-3">
                    {myBids.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">No registras ninguna puja en este sprint.</p>
                    ) : (
                        myBids.map((bid) => (
                            <BidItem key={bid.id} bid={bid} onSelectAuction={onSelectAuction} />
                        ))
                    )}
                </div>
            )}

            {activeTab === 'publications' && (
                <div className="space-y-3">
                    {myPublications.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">No registras publicaciones de venta.</p>
                    ) : (
                        myPublications.map((item) => (
                            <PublicationItem key={item.id} item={item} />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};