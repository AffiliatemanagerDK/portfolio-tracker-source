import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Percent, RefreshCw } from 'lucide-react';
import { Portfolio } from '../types/portfolio';
import { format } from 'date-fns';

interface PortfolioSummaryProps {
  portfolio: Portfolio;
  lastUpdated: Date | null;
  loading: boolean;
  onRefresh: () => void;
  remainingApiCalls: number;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  portfolio,
  lastUpdated,
  loading,
  onRefresh,
  remainingApiCalls
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const isPositive = portfolio.totalGainLoss >= 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Portfolio Summary</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            API calls remaining: <span className="font-medium">{remainingApiCalls}</span>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading || portfolio.positions.length === 0}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Updating...' : 'Refresh Prices'}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={20} className="text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Total Value</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(portfolio.totalValue)}
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={20} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Total Cost</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(portfolio.totalCost)}
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            {isPositive ? (
              <TrendingUp size={20} className="text-green-600" />
            ) : (
              <TrendingDown size={20} className="text-red-600" />
            )}
            <span className="text-sm font-medium text-gray-600">Unrealized Gain/Loss</span>
          </div>
          <p className={`text-2xl font-bold ${
            portfolio.totalUnrealizedGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(portfolio.totalUnrealizedGainLoss)}
          </p>
          {portfolio.totalRealizedGainLoss !== 0 && (
            <p className={`text-sm mt-1 ${
              portfolio.totalRealizedGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              Realized: {formatCurrency(portfolio.totalRealizedGainLoss)}
            </p>
          )}
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Percent size={20} className={isPositive ? 'text-green-600' : 'text-red-600'} />
            <span className="text-sm font-medium text-gray-600">Total Return</span>
          </div>
          <p className={`text-2xl font-bold ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatPercentage(portfolio.totalGainLossPercentage)}
          </p>
          <p className={`text-sm mt-1 ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(portfolio.totalGainLoss)} total
          </p>
        </div>
      </div>
      
      {lastUpdated && (
        <div className="mt-4 text-sm text-gray-500">
          Last updated: {format(lastUpdated, 'MMM dd, yyyy HH:mm:ss')}
        </div>
      )}
    </div>
  );
};