import { useState, useEffect, useCallback } from 'react';
import { AuctionRoom } from './components/Auction/AuctionRoom.jsx';
import { UserActivity } from './components/Activity/UserActivity.jsx';
import { AuctionCard } from './components/Auction/AuctionCard.jsx';
import { ToastProvider } from './Context/ToastContext';
import Wallet from './components/Wallet/Wallet.jsx';

const DEMO_USERS = [
  { id: 1, name: 'Vendedor Demo' },
  { id: 2, name: 'Comprador Uno' },
  { id: 3, name: 'Comprador Dos' },
  { id: 4, name: 'Usuario Sin Fondos' }
];

function AppContent() {
  const [currentView, setCurrentView] = useState('catalog');
  const [previousView, setPreviousView] = useState('catalog');
  const [selectedAuctionId, setSelectedAuctionId] = useState(1);
  const [auctions, setAuctions] = useState([]);
  const [userBalance, setUserBalance] = useState(0);
  const [userEscrow, setUserEscrow] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedUserId, setSelectedUserId] = useState(2);

  const currentUser = DEMO_USERS.find((u) => u.id === selectedUserId) || DEMO_USERS[0];

  const triggerBalanceRefresh = useCallback(() => {
    fetch(`/api/wallet/balance?userId=${currentUser.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setUserBalance(data.availableBalance ?? data['availableBalance'] ?? 0);
            setUserEscrow(data.lockedBalance ?? data['lockedBalance'] ?? 0);
          }
        })
        .catch((err) => console.error("Error fetching financial metrics:", err));
  }, [currentUser.id]);

  useEffect(() => {
    triggerBalanceRefresh();
  }, [currentView, currentUser.id, triggerBalanceRefresh]);

  useEffect(() => {
    fetch(`/api/auctions?page=0&size=20&_t=${Date.now()}`)
        .then((res) => res.json())
        .then((data) => setAuctions(data.content || data['content'] || (Array.isArray(data) ? data : [])))
        .catch((err) => console.error("Error fetching catalog:", err));
  }, [currentView]);

  const handleOpenRoom = (auctionId) => {
    setPreviousView(currentView);
    setSelectedAuctionId(auctionId);
    setCurrentView('room');
  };

  return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-4">
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

            <div className="flex items-center gap-3 flex-wrap">
              <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-2 text-xs">
                <span className="text-slate-400">Disponible:</span>
                <strong className="text-emerald-400">${userBalance.toLocaleString('es-AR')}</strong>
              </div>
              <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-2 text-xs">
                <span className="text-slate-400">Retenido:</span>
                <strong className="text-amber-500">${userEscrow.toLocaleString('es-AR')}</strong>
              </div>
              <div className="flex items-center gap-2 ml-1">
                <label htmlFor="user-selector" className="text-xs text-slate-400">
                  Usuario:
                </label>
                <select
                    id="user-selector"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-100 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {DEMO_USERS.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} (#{user.id})
                      </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
          {currentView === 'room' && (
              <div className="space-y-4">
                <button
                    onClick={() => setCurrentView(previousView)}
                    className="px-4 py-2 text-xs font-semibold bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  ← Volver atrás
                </button>
                {(() => {
                  const currentAuction = auctions.find(a => a.id === selectedAuctionId);
                  const titleToPass = currentAuction ? (currentAuction.title || currentAuction.titulo) : null;
                  const priceToPass = currentAuction ? (currentAuction.currentPrice || currentAuction.initialPrice || currentAuction.startingPrice) : 100000;
                  const endDateToPass = currentAuction ? (currentAuction.endDate || currentAuction.endDateUtc || currentAuction.fechaFin || currentAuction.endsAt) : null;
                  const incrementToPass = currentAuction ? (currentAuction.minIncrement || currentAuction.incrementoMinimo || 5000) : 5000;
                  const sellerToPass = currentAuction ? (currentAuction.sellerId || currentAuction.vendedorId) : null;
                  return (
                      <AuctionRoom
                          auctionId={selectedAuctionId}
                          auctionTitle={titleToPass}
                          sellerId={sellerToPass}
                          initialPrice={priceToPass}
                          initialEndDate={endDateToPass}
                          minIncrement={incrementToPass}
                          currentUserId={currentUser.id}
                          walletBalance={userBalance}
                          onRefreshBalance={triggerBalanceRefresh}
                      />
                  );
                })()}
              </div>
          )}

          {currentView === 'activity' && (
              <UserActivity
                  onSelectAuction={handleOpenRoom}
                  currentEscrow={userEscrow}
                  currentUserId={currentUser.id}
              />
          )}

          {currentView === 'wallet' && (
              <Wallet userId={currentUser.id} onBalanceUpdated={triggerBalanceRefresh} />
          )}

          {currentView === 'catalog' && (
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Subastas Activas</h2>
                    <p className="text-sm text-slate-400">Explora ofertas y participa en tiempo real</p>
                  </div>

                  <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px]">
                    {['Todos', 'Tecnología', 'Coleccionables', 'Vehículos'].map((cat) => (
                        <span
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1 font-medium rounded-md cursor-pointer transition-colors ${
                                selectedCategory === cat ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {auctions
                      .filter((item) => item.status === 'ACTIVA' || item.status === 'ACTIVE' || item.status === 'ACTIVAS')
                      .filter((item) => {
                        if (selectedCategory === 'Todos') return true;
                        const catId = item.categoryId || item['categoryId'] || item['CATEGORY_ID'];
                        if (selectedCategory === 'Tecnología' && (catId === 1 || item.id === 1 || item.id === 2)) return true;
                        return item.categoryName === selectedCategory || item['categoryName'] === selectedCategory;
                      })
                      .map((item) => (
                          <AuctionCard
                              key={item.id}
                              auction={item}
                              onOpenRoom={handleOpenRoom}
                          />
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