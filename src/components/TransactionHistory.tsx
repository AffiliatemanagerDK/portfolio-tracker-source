import React, { useState } from 'react';
import { History, ChevronDown, ChevronRight, TrendingDown } from 'lucide-react';
import { SellTransaction } from '../types/portfolio';
import { format } from 'date-fns';

interface TransactionHistoryProps {
  transactions: SellTransaction[];
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  if (transactions.length === 0) {
    return null;
  }

  const totalRealizedGainLoss = transactions.reduce((sum, tx) => sum + tx.realizedGainLoss, 0);
  const totalSaleAmount = transactions.reduce((sum, tx) => sum + tx.totalSaleAmount, 0);
  const isPositive = totalRealizedGainLoss >= 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div 
        className="px-6 py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History size={20} className="text-gray-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
              <p className="text-sm text-gray-500">
                {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} • 
                Total realized: 
                <span className={`ml-1 font-medium ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(totalRealizedGainLoss)}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shares Sold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sale Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sale Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Realized Gain/Loss
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return %
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => {
                const isGain = transaction.realizedGainLoss >= 0;
                return (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(transaction.saleDate), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <TrendingDown size={16} className="text-red-600" />
                        <div className="text-sm font-medium text-gray-900">{transaction.ticker}</div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transaction.sharesSold.toLocaleString()}</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{formatCurrency(transaction.salePricePerShare)}</div>
                        <div className="text-xs text-gray-500">
                          Cost: {formatCurrency(transaction.purchasePricePerShare)}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(transaction.totalSaleAmount)}</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        isGain ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(transaction.realizedGainLoss)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        isGain ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatPercentage(transaction.realizedGainLossPercentage)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};