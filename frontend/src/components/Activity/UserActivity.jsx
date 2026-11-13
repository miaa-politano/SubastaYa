/* cSpell:disable */
import { useState, useEffect, useCallback } from 'react';
import { BidItem } from './BidItem.jsx';
import { PublicationItem } from './PublicationItem.jsx';
import { CreateAuctionForm } from './CreateAuctionForm.jsx';

export const UserActivity = ({ onSelectAuction, currentEscrow, currentUserId = 2 }) => {
    const [activeTab, setActiveTab] = useState('bids');
    const [myBids, setMyBids] = useState([]);
    const [myPublications, setMyPublications] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const loadActivityData = useCallback(async () => {
        try {
            const allRes = await fetch(`/api/auctions?page=0&size=50&_t=${Date.now()}`);
            const allData = allRes.ok ? await allRes.json() : [];
            const allAuctions = Array.isArray(allData) ? allData : (allData?.content || []);

            const sellerPubs = allAuctions
                .filter((pub) => Number(pub.sellerId) === Number(currentUserId))
                .map((pub, index) => {
                    const st = String(pub.status || '').toUpperCase();
                    const isActive = st === 'ACTIVE' || st === 'ACTIVA' || st === 'ACTIVAS';
                    return {
                        id: pub.id || index,
                        title: pub.title || pub.titulo || `Subasta #${pub.id}`,
                        initialPrice: Number(pub.startingPrice || pub.initialPrice || pub.basePrice || 0),
                        currentHighestBid: Number(pub.currentPrice || pub.startingPrice || pub.initialPrice || 0),
                        totalBids: pub.bidsCount ?? pub.version ?? 0,
                        status: isActive ? 'active' : 'completed',
                        endDate: isActive ? 'En progreso' : 'Finalizada'
                    };
                });
            setMyPublications(sellerPubs);

            const bidsRes = await fetch(`/api/auctions/bids/user/${currentUserId}?_t=${Date.now()}`);
            if (bidsRes.ok) {
                const data = await bidsRes.json();
                const rawList = Array.isArray(data) ? data : (data?.content || []);
                const groupedByAuction = new Map();

                rawList.forEach((bid, index) => {
                    const aId = bid.auctionId;
                    const amount = Number(bid.amount || 0);
                    const highest = Number(bid.currentAuctionPrice || amount);
                    const auctionStatus = String(bid.auctionStatus || bid.status || 'ACTIVE').toUpperCase();
                    const isClosed = auctionStatus === 'CLOSED' || auctionStatus === 'FINALIZADA' || auctionStatus === 'COMPLETED';
                    const isLeading = Boolean(bid.isHighest) || (amount >= highest && highest > 0);

                    const existing = groupedByAuction.get(aId);
                    if (!existing || amount >= existing.myBidAmount) {
                        let status = 'outbid';
                        if (isClosed && isLeading) {
                            status = 'won';
                        } else if (isLeading) {
                            status = 'winning';
                        }

                        groupedByAuction.set(aId, {
                            id: bid.id || `${aId}-${index}`,
                            auctionId: aId,
                            title: bid.auctionTitle || `Subasta #${aId}`,
                            myBidAmount: amount,
                            currentHighestBid: highest,
                            status,
                            escrowLocked: !isClosed && isLeading,
                            endDate: isClosed ? 'Finalizada' : 'Activa'
                        });
                    }
                });
                setMyBids(Array.from(groupedByAuction.values()));
            } else {
                const winningFromCatalog = allAuctions
                    .filter((a) => Number(a.currentWinnerId) === Number(currentUserId))
                    .map((a) => {
                        const st = String(a.status || '').toUpperCase();
                        const isClosed = st === 'CLOSED' || st === 'FINISHED' || st === 'FINALIZADA';
                        return {
                            id: a.id,
                            auctionId: a.id,
                            title: a.title || `Subasta #${a.id}`,
                            myBidAmount: Number(a.currentPrice || 0),
                            currentHighestBid: Number(a.currentPrice || 0),
                            status: isClosed ? 'won' : 'winning',
                            escrowLocked: !isClosed,
                            endDate: isClosed ? 'Finalizada' : 'Activa'
                        };
                    });
                setMyBids(winningFromCatalog);
            }
        } catch (err) {
            console.error('Error al cargar actividad:', err);
        }
    }, [currentUserId]);

    useEffect(() => {
        let isMounted = true;
        const syncActivity = async () => {
            if (isMounted) {
                await loadActivityData();
            }
        };
        syncActivity().catch(console.error);
        return () => {
            isMounted = false;
        };
    }, [activeTab, loadActivityData]);


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

            <div className="flex flex-wrap justify-between items-center border-b border-slate-800 gap-4">
                <div className="flex space-x-4">
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

                <button
                    onClick={() => {
                        setActiveTab('publications');
                        setShowCreateForm((prev) => !prev);
                    }}
                    className="mb-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                    {showCreateForm ? 'Cancelar' : '+ Nueva Subasta'}
                </button>
            </div>

            {showCreateForm && activeTab === 'publications' && (
                <CreateAuctionForm
                    currentUserId={currentUserId}
                    onCancel={() => setShowCreateForm(false)}
                    onSuccess={() => {
                        setShowCreateForm(false);
                        loadActivityData().catch(console.error);
                    }}
                />
            )}

            {activeTab === 'bids' && (
                <div className="space-y-3">
                    {myBids.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">No registras ninguna puja todavía.</p>
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