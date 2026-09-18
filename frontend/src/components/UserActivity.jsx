/* cSpell:disable */
import { useState } from 'react';
import { BidItem } from './activity/BidItem';
import { PublicationItem } from './activity/PublicationItem';

export const UserActivity = ({ onSelectAuction }) => {
    const [activeTab, setActiveTab] = useState('bids');

    const myBids = [
        {
            id: 1,
            auctionId: 1,
            title: 'Notebook Gamer RTX 4060',
            myBidAmount: 1450000,
            currentHighestBid: 1450000,
            status: 'winning',
            escrowLocked: true,
            endDate: 'Hoy, 20:00 hs'
        },
        {
            id: 2,
            auctionId: 2,
            title: 'Monitor 27" 165Hz IPS',
            myBidAmount: 320000,
            currentHighestBid: 350000,
            status: 'outbid',
            escrowLocked: false,
            endDate: 'Mañana, 18:30 hs'
        },
        {
            id: 3,
            auctionId: 3,
            title: 'Teclado Mecánico Wireless',
            myBidAmount: 85000,
            currentHighestBid: 85000,
            status: 'won',
            escrowLocked: false,
            endDate: 'Finalizada el 15/09'
        }
    ];

    const myPublications = [
        {
            id: 101,
            title: 'PlayStation 5 Slim 1TB',
            initialPrice: 800000,
            currentHighestBid: 920000,
            totalBids: 8,
            status: 'completed',
            endDate: 'Finalizada'
        },
        {
            id: 102,
            title: 'Auriculares Sony WH-1000XM5',
            initialPrice: 250000,
            currentHighestBid: 310000,
            totalBids: 14,
            status: 'completed',
            winnerUsername: 'Comprador_Gamer',
            endDate: 'Cerrada ayer'
        }
    ];

    const totalEscrowLocked = myBids
        .filter((b) => b.escrowLocked)
        .reduce((acc, curr) => acc + curr.myBidAmount, 0);

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
            ${totalEscrowLocked.toLocaleString()}
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
                    {myBids.map((bid) => (
                        <BidItem key={bid.id} bid={bid} onSelectAuction={onSelectAuction} />
                    ))}
                </div>
            )}

            {activeTab === 'publications' && (
                <div className="space-y-3">
                    {myPublications.map((item) => (
                        <PublicationItem key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
};