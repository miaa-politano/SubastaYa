import { useState, useEffect } from 'react';
import { AuctionRoom } from './components/AuctionRoom';
import { UserActivity } from './components/UserActivity';
import { ToastProvider } from './context/ToastContext';
import Wallet from './components/Wallet.jsx';

function AppContent() {
  const [currentView, setCurrentView] = useState('catalog');
  const [selectedAuctionId, setSelectedAuctionId] = useState(1);
  const [auctions, setAuctions] = useState([]);
  const [userBalance, setUserBalance] = useState(0);

  const currentUser = {
    id: 2,
    name: 'Comprador_General'
  };

  useEffect(() => {
    fetch(`http://localhost:8080/api/wallet/balance?userId=${currentUser.id}`)
        .then((res) => res.json())
        .then((data) => setUserBalance(data.availableBalance || 0))
        .catch((err) => console.error("Error fetching balance:", err));
  }, [currentView, currentUser.id]);

  useEffect(() => {
    fetch('http://localhost:8080/api/auctions?page=0&size=10')
        .then((res) => res.json())
        .then((data) => setAuctions(data.content || []))
        .catch((err) => console.error("Error fetching catalog:", err));
  }, [currentView]);

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
                  className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500 cursor-pointer"
              >
                SubastaYa
              </h1>
              <nav className="flex gap-2">
                <button
                    onClick={() => setCurrentView('catalog')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        currentView === 'catalog' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                  Catálogo
                </button>
                <button
                    onClick={() => setCurrentView('activity')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        currentView === 'activity' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                  Mi Actividad
                </button>
                <button
                    onClick={() => setCurrentView('wallet')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        currentView === 'wallet' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                  Billetera
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-2 text-xs">
                <span className="text-slate-400">Disponible:</span>
                <strong className="text-emerald-400">${userBalance.toLocaleString('es-AR')}</strong>
              </div>
              <span className="text-xs text-slate-400">
                Usuario: <strong className="text-slate-200">{currentUser.name}</strong>
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
                <AuctionRoom
                    auctionId={selectedAuctionId}
                    currentUserId={currentUser.id}
                    walletBalance={userBalance}
                />
              </div>
          )}

          {currentView === 'activity' && (
              <UserActivity onSelectAuction={handleOpenRoom} />
          )}

          {currentView === 'wallet' && (
              <Wallet />
          )}

          {currentView === 'catalog' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Subastas Activas</h2>
                  <p className="text-sm text-slate-400">Explora ofertas y participa en tiempo real</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {auctions.map((item) => (
                      <div
                          key={item.id}
                          className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-cyan-500/50 transition-all flex flex-col justify-between group shadow-lg"
                      >
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                            Subasta #{item.id} - {item.status}
                          </span>
                          <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-end">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Oferta Actual</span>
                            <span className="text-xl font-extrabold text-emerald-400">
                              \${Number(item.currentPrice).toLocaleString('es-AR')}
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

export function App() {
  return (
      <ToastProvider>
        <AppContent />
      </ToastProvider>
  );
}

export default App;