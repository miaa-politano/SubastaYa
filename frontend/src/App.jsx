import { useState, useEffect, useCallback } from 'react';
import { AuctionRoom } from './components/Auction/AuctionRoom.jsx';
import { UserActivity } from './components/Activity/UserActivity.jsx';
import { AuctionCard } from './components/Auction/AuctionCard.jsx';
import { AuctionCreationModal } from './components/Auction/AuctionCreationModal.jsx';
import { ToastProvider } from './Context/ToastContext';
import Wallet from './components/Wallet/Wallet.jsx';

function AppContent() {
  const [currentView, setCurrentView] = useState('catalog');
  const [previousView, setPreviousView] = useState('catalog');
  const [selectedAuctionId, setSelectedAuctionId] = useState(1);
  const [auctions, setAuctions] = useState([]);
  const [userBalance, setUserBalance] = useState(105000);
  const [userEscrow, setUserEscrow] = useState(45000);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isCreationOpen, setIsCreationOpen] = useState(false);
  const [catalogRefreshKey, setCatalogRefreshKey] = useState(0);

  const currentUser = {
    id: 2,
    name: 'Comprador_General'
  };

  const triggerBalanceRefresh = useCallback(() => {
    fetch(`/api/wallet/balance?userId=${currentUser.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setUserBalance(data.availableBalance || data['availableBalance'] || 105000);
            setUserEscrow(data.lockedBalance || data['lockedBalance'] || 45000);
          }
        })
        .catch((err) => console.error("Error fetching financial metrics:", err));
  }, [currentUser.id]);

  useEffect(() => {
    triggerBalanceRefresh();
  }, [currentView, currentUser.id, triggerBalanceRefresh]);

  useEffect(() => {
    const params = new URLSearchParams({ page: '0', size: '10', _t: String(Date.now()) });
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (selectedStatus !== 'ALL') params.set('status', selectedStatus);

    fetch(`/api/auctions?${params.toString()}`)
        .then((res) => res.json())
        .then((data) => setAuctions(data.content || data['content'] || []))
        .catch((err) => console.error("Error fetching catalog:", err));
  }, [currentView, minPrice, maxPrice, selectedStatus, catalogRefreshKey]);

  const handleOpenRoom = (auctionId) => {
    setPreviousView(currentView);
    setSelectedAuctionId(auctionId);
    setCurrentView('room');
  };

  const handleBid = (amount) => {
    const finalBidAmount = Number(amount);

    return fetch(`/api/auctions/${selectedAuctionId}/bids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bidderId: currentUser.id, amount: finalBidAmount })
    })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error((await response.text()) || 'La puja fue rechazada por el servidor.');
          }
          triggerBalanceRefresh();
        })
        .catch((err) => { throw err; });
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

            <div className="flex items-center gap-3">
              <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-2 text-xs">
                <span className="text-slate-400">Disponible:</span>
                <strong className="text-emerald-400">${userBalance.toLocaleString('es-AR')}</strong>
              </div>
              <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-2 text-xs">
                <span className="text-slate-400">Retenido:</span>
                <strong className="text-amber-500">${userEscrow.toLocaleString('es-AR')}</strong>
              </div>
              <span className="text-xs text-slate-400 ml-2">
                Usuario: <strong className="text-slate-200">{currentUser.name}</strong>
              </span>
              <button
                  onClick={() => setIsCreationOpen(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400"
              >
                Publicar
              </button>
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
                  const priceToPass = currentAuction ? (currentAuction.currentPrice || currentAuction.initialPrice) : 100000;
                  return (
                      <AuctionRoom
                          auctionId={selectedAuctionId}
                          initialPrice={priceToPass}
                          currentUserId={currentUser.id}
                          walletBalance={userBalance}
                          onBidSubmit={handleBid}
                      />
                  );
                })()}
              </div>
          )}

          {currentView === 'activity' && (
              <UserActivity onSelectAuction={handleOpenRoom} currentEscrow={userEscrow} />
          )}

          {currentView === 'wallet' && (
              <Wallet userId={currentUser.id} />
          )}

          {currentView === 'catalog' && (
              <div className="space-y-6">
                <div className="flex flex-wrap justify-between items-end gap-4">
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

                  <div className="flex flex-wrap gap-2 items-center text-[11px]">
                    {[
                      ['ALL', 'Todas'],
                      ['ACTIVE', 'Activas'],
                      ['PROXIMA', 'Próximas'],
                      ['FINALIZADA', 'Finalizadas']
                    ].map(([value, label]) => (
                      <button
                          key={value}
                          onClick={() => setSelectedStatus(value)}
                          className={`px-3 py-1 rounded-md border ${selectedStatus === value ? 'bg-slate-800 text-amber-400 border-amber-400/30' : 'text-slate-400 border-slate-800'}`}
                      >
                        {label}
                      </button>
                    ))}
                    <input type="number" min="0" placeholder="Precio mín." value={minPrice} onChange={(event) => setMinPrice(event.target.value)} className="w-24 bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-white" />
                    <input type="number" min="0" placeholder="Precio máx." value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} className="w-24 bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {auctions
                      .filter((item) => {
                        if (selectedStatus === 'ALL') return true;
                        const status = String(item.status || '').toUpperCase();
                        return selectedStatus === 'ACTIVE'
                          ? ['ACTIVE', 'ACTIVA', 'ACTIVAS'].includes(status)
                          : status === selectedStatus;
                      })
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
        <AuctionCreationModal
            isOpen={isCreationOpen}
            onClose={() => setIsCreationOpen(false)}
            onCreated={() => {
              setCatalogRefreshKey((current) => current + 1);
              setCurrentView('catalog');
            }}
            sellerId={1}
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
