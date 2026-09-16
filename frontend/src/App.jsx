import React, { useState } from 'react';
import Wallet from './components/Wallet.jsx';
import { AuctionCard } from './components/AuctionCard.jsx';
import { AuctionRoom } from './components/AuctionRoom.jsx';

const MOCK_AUCTIONS = [
  {
    id: 1,
    title: 'Notebook Gamer Lenovo Legion Pro 5',
    categoryName: 'Tecnología',
    imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80',
    highestBid: 1450000,
    totalBids: 14,
    endDate: new Date(Date.now() + 25 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    title: 'Consola Retro GameBoy Color Atomic Purple',
    categoryName: 'Coleccionables',
    imageUrl: 'https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?auto=format&fit=crop&w=600&q=80',
    highestBid: 280000,
    totalBids: 8,
    endDate: new Date(Date.now() + 45 * 1000).toISOString()
  },
  {
    id: 3,
    title: 'Camiseta Oficial Selección Argentina 1986',
    categoryName: 'Indumentaria',
    imageUrl: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=600&q=80',
    highestBid: 950000,
    totalBids: 22,
    endDate: new Date(Date.now() - 10000).toISOString()
  }
];

export default function App() {
  const [selectedAuctionId, setSelectedAuctionId] = useState(null);

  return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
        <header className="max-w-6xl mx-auto mb-10 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Subasta<span className="text-cyan-400">Ya</span>
          </h1>
          <p className="text-sm text-slate-400">
            Catálogo de subastas en vivo respaldadas con saldo real en garantía
          </p>
        </header>

        <section className="max-w-6xl mx-auto mb-8">
          <Wallet />
        </section>

        {selectedAuctionId ? (
            <section className="max-w-4xl mx-auto space-y-4">
              <button
                  onClick={() => setSelectedAuctionId(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors border border-slate-700"
              >
                ← Volver al catálogo
              </button>
              <AuctionRoom auctionId={selectedAuctionId} />
            </section>
        ) : (
            <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_AUCTIONS.map((auction) => (
                  <div
                      key={auction.id}
                      onClick={() => setSelectedAuctionId(auction.id)}
                      className="cursor-pointer transition-transform hover:-translate-y-1"
                  >
                    <AuctionCard auction={auction} />
                  </div>
              ))}
            </section>
        )}
      </main>
  );
}