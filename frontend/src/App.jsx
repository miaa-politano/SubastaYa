import React from 'react';
import { AuctionCard } from './components/AuctionCard.jsx';

const MOCK_AUCTIONS = [
  {
    id: 1,
    title: 'Notebook Gamer Lenovo Legion Pro 5',
    categoryName: 'Tecnología',
    imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&q=80',
    highestBid: 1450000,
    totalBids: 14,
    endDate: new Date(Date.now() + 25 * 60 * 1000).toISOString() // Cierra en 25 minutos
  },
  {
    id: 2,
    title: 'Consola Retro GameBoy Color Atomic Purple',
    categoryName: 'Coleccionables',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&q=80',
    highestBid: 280000,
    totalBids: 8,
    endDate: new Date(Date.now() + 45 * 1000).toISOString() // Cierra en 45 seg (Zona crítica roja)
  },
  {
    id: 3,
    title: 'Camiseta Oficial Selección Argentina 1986',
    categoryName: 'Indumentaria',
    imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&q=80',
    highestBid: 950000,
    totalBids: 22,
    endDate: new Date(Date.now() - 10000).toISOString() // Ya finalizada
  }
];

export default function App() {
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

        <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_AUCTIONS.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
          ))}
        </section>
      </main>
  );
}