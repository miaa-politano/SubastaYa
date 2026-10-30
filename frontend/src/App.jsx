/* cSpell:disable */
import { useState, useEffect, useCallback } from 'react';
import { AuctionRoom } from './components/Auction/AuctionRoom.jsx';
import { UserActivity } from './components/Activity/UserActivity.jsx';
import { AuctionCard } from './components/Auction/AuctionCard.jsx';
import { ToastProvider } from './Context/ToastContext.jsx';
import Wallet from './components/Wallet/Wallet.jsx';
import { AuctionCreationModal } from './components/Auction/AuctionCreationModal.jsx';

const SEED_USERS = [
  { id: 2, name: 'comprador1 (Líder $105k)', email: 'comprador1@test.com' },
  { id: 3, name: 'comprador2 (Habilitado $200k)', email: 'comprador2@test.com' },
  { id: 4, name: 'sinfondos ($500)', email: 'sinfondos@test.com' },
  { id: 1, name: 'vendedor', email: 'vendedor@test.com' }
];

function AppContent() {
  const [currentView, setCurrentView] = useState('catalog');
  const [previousView, setPreviousView] = useState('catalog');
  const [selectedAuctionId, setSelectedAuctionId] = useState(1);
  const [auctions, setAuctions] = useState([]);
  const [userBalance, setUserBalance] = useState(0);
  const [userEscrow, setUserEscrow] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [currentUser, setCurrentUser] = useState(SEED_USERS[1]); // Default comprador2 para ofertar
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const triggerBalanceRefresh = useCallback(() => {
    fetch(`/api/wallet/balance?userId=${currentUser.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setUserBalance(data.availableBalance || 0);
            setUserEscrow(data.lockedBalance || 0);
          }
        })
        .catch((err) => console.error("Error fetching financial metrics:", err));
  }, [currentUser.id]);

  const fetchCatalog = useCallback(() => {
    fetch(`/api/auctions?page=0&size=20&_t=${Date.now()}`)
        .then((res) => res.json())
        .then((data) => setAuctions(data.content || []))
        .catch((err) => console.error("Error fetching catalog:", err));
  }, []);

  useEffect(() => {
    triggerBalanceRefresh();
  }, [currentUser, triggerBalanceRefresh]);

  useEffect(() => {
    fetchCatalog();
  }, [currentView, fetchCatalog]);

  const handleOpenRoom = (auctionId) => {
    setPreviousView(currentView);
    setSelectedAuctionId(auctionId);
    setCurrentView('room');
  };

  const selectedAuction = auctions.find(a => a.id === selectedAuctionId);

  return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center gap-4 flex-wrap">
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
              <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
              >
                + Publicar Subasta
              </button>

              <div className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-2 text-xs">
                <span className="text-slate-400">Usuario:</span>
                <select
                    value={currentUser.id}
                    onChange={(e) => {
                      const found = SEED_USERS.find(u => u.id === Number(e.target.value));
                      if (found) setCurrentUser(found);
                    }}
                    className="bg-slate-900 text-white font-bold rounded px-1.5 py-0.5 border border-slate-600 focus:outline-none"
                >
                  {SEED_USERS.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-2 text-xs">
                <span className="text-slate-400">Disp:</span>
                <strong className="text-emerald-400">${userBalance.toLocaleString('es-AR')}</strong>
              </div>
              <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-2 text-xs">
                <span className="text-slate-400">Escrow:</span>
                <strong className="text-amber-500">${userEscrow.toLocaleString('es-AR')}</strong>
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
                  ← Volver al Catálogo
                </button>
                <AuctionRoom
                    auctionId={selectedAuctionId}
                    initialPrice={selectedAuction?.currentPrice || selectedAuction?.startingPrice || 100000}
                    minIncrement={selectedAuction?.minIncrement || 5000}
                    currentUserId={currentUser.id}
                    walletBalance={userBalance}
                    auctionEndDate={selectedAuction?.endDateUtc || selectedAuction?.endDate}
                    auctionTitle={selectedAuction?.title || `Subasta #${selectedAuctionId}`}
                    onBidSuccess={() => {
                      triggerBalanceRefresh();
                      fetchCatalog();
                    }}
                />
              </div>
          )}

          {currentView === 'activity' && (
              <UserActivity onSelectAuction={handleOpenRoom} currentEscrow={userEscrow} />
          )}

          {currentView === 'wallet' && (
              <Wallet
                  balance={userBalance}
                  escrow={userEscrow}
                  userId={currentUser.id}
                  onRefresh={triggerBalanceRefresh}
              />
          )}

          {currentView === 'catalog' && (
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Subastas en Vivo</h2>
                    <p className="text-sm text-slate-400">Explora ofertas activas con garantía Escrow</p>
                  </div>

                  <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px]">
                    {['Todos', 'Tecnología', 'Coleccionables', 'Indumentaria', 'Vehículos'].map((cat) => (
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
                      .filter((item) => {
                        if (selectedCategory === 'Todos') return true;
                        return item.categoryName === selectedCategory || item.category?.name === selectedCategory;
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

        <AuctionCreationModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreated={fetchCatalog}
            sellerId={currentUser.id}
        />
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