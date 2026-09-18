import React, { useState } from 'react';
import { AuctionRoom } from './components/AuctionRoom';
import { UserActivity } from './components/UserActivity';
import { ToastProvider } from './context/ToastContext';

function AppContent() {
  const [currentView, setCurrentView] = useState('catalog');
  const [selectedAuctionId, setSelectedAuctionId] = useState(1);

  const mockAuctions = [
    { id: 1, title: 'Notebook Gamer RTX 4060', price: 1450000, bids: 12, closesIn: '2 horas' },
    { id: 2, title: 'Monitor 27" 165Hz IPS', price: 350000, bids: 8, closesIn: '45 minutos' },
    { id: 3, title: 'Teclado Mecánico Wireless', price: 85000, bids: 5, closesIn: 'Finalizada' }
  ];

  const handleOpenRoom = (auctionId) => {
    setSelectedAuctionId(auctionId);
    setCurrentView('room');
  };

  return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <h1
                  onClick={() => setCurrentView('catalog')}
                  className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 cursor-pointer"
              >
                SubastaYa
              </h1>
              <nav className="flex gap-2">
                <button
                    onClick={() => setCurrentView('catalog')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        currentView === 'catalog'
                            ? 'bg-slate-800 text-cyan-400'
                            : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                  Catálogo
                </button>
                <button
                    onClick={() => setCurrentView('activity')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        currentView === 'activity'
                            ? 'bg-slate-800 text-cyan-400'
                            : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                  Mi Actividad
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              Usuario: <strong className="text-slate-200">Mateo</strong>
            </span>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
          {currentView === 'room' && (
              <div className="space-y-4">
                <button
                    onClick={() => setCurrentView('catalog')}
                    className="px-4 py-2 text-xs font-semibold bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  ← Volver al catálogo
                </button>
                <AuctionRoom auctionId={selectedAuctionId} />
              </div>
          )}

          {currentView === 'activity' && (
              <UserActivity onSelectAuction={handleOpenRoom} />
          )}

          {currentView === 'catalog' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Subastas Activas</h2>
                  <p className="text-sm text-slate-400">Explora ofertas y participa en tiempo real</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockAuctions.map((item) => (
                      <div
                          key={item.id}
                          className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-cyan-500/50 transition-all flex flex-col justify-between group shadow-lg"
                      >
                        <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      Subasta #{item.id}
                    </span>
                          <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-500">Cierre estimado: {item.closesIn}</p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-end">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Oferta Actual</span>
                            <span className="text-xl font-extrabold text-emerald-400">
                        ${item.price.toLocaleString()}
                      </span>
                          </div>

                          <button
                              onClick={() => handleOpenRoom(item.id)}
                              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
                          >
                            Ingresar
                          </button>
                        </div>
                      </div>
                  ))}
                </div>
              </div>
          )}
        </main>
      </div>
  );
}

function App() {
  return (
      <ToastProvider>
        <AppContent />
      </ToastProvider>
  );
}

export default App;