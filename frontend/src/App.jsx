/* cSpell:disable */
import { useState, useEffect, useCallback } from 'react';
import { AuctionRoom } from './components/Auction/AuctionRoom.jsx';
import { UserActivity } from './components/Activity/UserActivity.jsx';
import { AuctionCard } from './components/Auction/AuctionCard.jsx';
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
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ACTIVAS');

  const currentUser = {
    id: 3,
    name: 'comprador2'
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
    const params = new URLSearchParams({
      page: '0',
      size: '10',
      _t: String(Date.now())
    });
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);

    fetch(`/api/auctions?${params.toString()}`)
        .then((res) => res.json())
        .then((data) => setAuctions(data.content || data['content'] || []))
        .catch((err) => console.error("Error fetching catalog:", err));
  }, [currentView, minPrice, maxPrice]);

  const handleOpenRoom = (auctionId) => {
    setPreviousView(currentView);
    setSelectedAuctionId(auctionId);
    setCurrentView('room');
  };

  const handleFakeBidSimulation = (amount) => {
    const finalBidAmount = String(amount);

    return fetch(`/api/auctions/${selectedAuctionId}/bids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bidderId: currentUser.id, amount: finalBidAmount })
    })
        .then(async (res) => {
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || "Error en el servidor");
          }
          triggerBalanceRefresh();
        })
        .catch((err) => {
          console.error("Error al procesar la puja:", err);
          throw err;
        });
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
                  const dateToPass = currentAuction ? (currentAuction.endDateUtc || currentAuction.endDate || currentAuction['END_DATE_UTC']) : null;
                  return (
                      <AuctionRoom
                          auctionId={selectedAuctionId}
                          initialPrice={priceToPass}
                          currentUserId={currentUser.id}
                          walletBalance={userBalance}
                          onBidSubmit={handleFakeBidSimulation}
                          auctionEndDate={dateToPass}
                      />
                  );
                })()}
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
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Subastas Activas</h2>
                  <p className="text-sm text-slate-400">Explora ofertas y participa en tiempo real</p>
                </div>

                <div className="flex flex-wrap gap-4 justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800 my-4">
                  <div className="flex gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
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

                  <div className="flex gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                    {[
                      { id: 'ACTIVE', label: 'Activas' },
                      { id: 'PROXIMA', label: 'Próximas' },
                      { id: 'FINALIZADA', label: 'Finalizadas' }
                    ].map((st) => (
                        <span
                            key={st.id}
                            onClick={() => setSelectedStatus(st.id)}
                            className={`px-3 py-1 font-medium rounded-md cursor-pointer transition-colors ${
                                selectedStatus === st.id ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                        {st.label}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-3 items-center">
                    <span className="text-xs text-slate-400 font-medium">Rango de precio:</span>
                    <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs w-24 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                    <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs w-24 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {auctions
                      .filter((item) => {
                        const itemStatus = (item.status || '').toUpperCase();
                        const targetStatus = selectedStatus.toUpperCase();
                        if (targetStatus === 'ALL' || targetStatus === 'TODOS') return true;
                        if (targetStatus === 'ACTIVE' || targetStatus === 'ACTIVA') {
                          return itemStatus === 'ACTIVE' || itemStatus === 'ACTIVA' || itemStatus === 'ACTIVAS';
                        }
                        return itemStatus === targetStatus;
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