import React from 'react';
import { TrendingUp } from 'lucide-react';
import { usePortfolio } from './hooks/usePortfolio';
import { AddPositionForm } from './components/AddPositionForm';
import { PortfolioSummary } from './components/PortfolioSummary';
import { PositionsList } from './components/PositionsList';
import { TransactionHistory } from './components/TransactionHistory';
import { ErrorAlert } from './components/ErrorAlert';

function App() {
  const {
    portfolio,
    positions,
    tickerGroups,
    loading,
    error,
    lastUpdated,
    addPosition,
    updatePosition,
    deletePosition,
    sellShares,
    refreshPrices,
    getAllTransactions,
    getRemainingApiCalls,
    clearError
  } = usePortfolio();

  const allTransactions = getAllTransactions();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <TrendingUp size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Stock Portfolio Tracker</h1>
                <p className="text-sm text-gray-500">Track your investments and monitor performance</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Error Alert */}
          {error && (
            <ErrorAlert message={error} onClose={clearError} />
          )}

          {/* Portfolio Summary */}
          <PortfolioSummary
            portfolio={portfolio}
            lastUpdated={lastUpdated}
            loading={loading}
            onRefresh={refreshPrices}
            remainingApiCalls={getRemainingApiCalls()}
          />

          {/* Add Position Form */}
          <AddPositionForm onAddPosition={addPosition} />

          {/* Positions List */}
          <PositionsList
            tickerGroups={tickerGroups}
            onUpdatePosition={updatePosition}
            onDeletePosition={deletePosition}
            onSellShares={sellShares}
          />

          {/* Transaction History */}
          {allTransactions.length > 0 && (
            <TransactionHistory transactions={allTransactions} />
          )}

          {/* Footer Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="text-center text-sm text-gray-500">
              <p className="mb-2">
                <strong>Advanced Stock Portfolio Tracker</strong> - Data is stored locally in your browser
              </p>
              <p className="mb-2">
                ✨ <strong>New Features:</strong> Multiple purchases per ticker, selling functionality, realized vs unrealized gains tracking
              </p>
              <p className="mb-2">
                Real-time stock prices powered by Finnhub.io (60 API calls per minute)
              </p>
              <p className="text-xs">
                This is a comprehensive portfolio tracking tool. Please verify all data independently before making investment decisions.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
