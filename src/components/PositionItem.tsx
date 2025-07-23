import React, { useState } from 'react';
import { Edit2, Trash2, Save, X, TrendingDown, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { StockPosition } from '../types/portfolio';
import { SellSharesForm } from './SellSharesForm';
import { format } from 'date-fns';

interface PositionItemProps {
  position: StockPosition;
  onUpdate: (position: StockPosition) => void;
  onDelete: (positionId: string) => void;
  onSell: (positionId: string, sellData: {
    sharesSold: number;
    saleDate: string;
    salePricePerShare: number;
  }) => void;
  isGrouped?: boolean;
  showTransactionHistory?: boolean;
}

export const PositionItem: React.FC<PositionItemProps> = ({
  position,
  onUpdate,
  onDelete,
  onSell,
  isGrouped = false,
  showTransactionHistory = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showSellForm, setShowSellForm] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [editData, setEditData] = useState({
    shares: position.shares,
    totalPurchasePrice: position.totalPurchasePrice,
    purchaseDate: position.purchaseDate
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const handleSave = () => {
    const updatedPosition: StockPosition = {
      ...position,
      shares: editData.shares,
      totalPurchasePrice: editData.totalPurchasePrice,
      purchaseDate: editData.purchaseDate,
      purchasePricePerShare: editData.totalPurchasePrice / editData.shares,
      originalShares: position.originalShares || position.shares
    };

    // Recalculate current values if we have current price
    if (position.currentPrice) {
      updatedPosition.currentValue = position.currentPrice * editData.shares;
      updatedPosition.unrealizedGainLoss = updatedPosition.currentValue - (updatedPosition.purchasePricePerShare * editData.shares);
      updatedPosition.unrealizedGainLossPercentage = (updatedPosition.unrealizedGainLoss! / (updatedPosition.purchasePricePerShare * editData.shares)) * 100;
    }

    onUpdate(updatedPosition);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      shares: position.shares,
      totalPurchasePrice: position.totalPurchasePrice,
      purchaseDate: position.purchaseDate
    });
    setIsEditing(false);
  };

  const handleSell = (sellData: {
    sharesSold: number;
    saleDate: string;
    salePricePerShare: number;
  }) => {
    try {
      onSell(position.id, sellData);
      setShowSellForm(false);
    } catch (error) {
      console.error('Error selling shares:', error);
    }
  };

  const isPositive = (position.unrealizedGainLoss || 0) >= 0;
  const hasCurrentData = position.currentPrice !== undefined;
  const hasTransactions = position.sellTransactions.length > 0;
  const isClosed = position.shares === 0;

  if (isEditing) {
    return (
      <tr className={`hover:bg-gray-50 ${isGrouped ? 'bg-blue-25' : ''}`}>
        <td className="px-6 py-4 whitespace-nowrap">
          <div>
            <div className={`text-sm font-medium ${isGrouped ? 'text-blue-800 pl-6' : 'text-gray-900'}`}>
              {position.ticker}
            </div>
            <input
              type="date"
              value={editData.purchaseDate}
              onChange={(e) => setEditData(prev => ({ ...prev, purchaseDate: e.target.value }))}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <input
            type="number"
            step="0.001"
            min="0.001"
            value={editData.shares}
            onChange={(e) => setEditData(prev => ({ ...prev, shares: Number(e.target.value) }))}
            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={editData.totalPurchasePrice}
            onChange={(e) => setEditData(prev => ({ ...prev, totalPurchasePrice: Number(e.target.value) }))}
            className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="text-xs text-gray-500 mt-1">
            Per share: {editData.shares > 0 ? formatCurrency(editData.totalPurchasePrice / editData.shares) : '$0.00'}
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            {hasCurrentData ? formatCurrency(position.currentPrice!) : '-'}
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            {hasCurrentData && editData.shares > 0 
              ? formatCurrency(position.currentPrice! * editData.shares) 
              : formatCurrency(editData.totalPurchasePrice)
            }
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-400">-</div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-400">-</div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={editData.shares <= 0 || editData.totalPurchasePrice <= 0}
              className="text-green-600 hover:text-green-800 disabled:text-gray-400 disabled:cursor-not-allowed"
              title="Save changes"
            >
              <Save size={16} />
            </button>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
              title="Cancel"
            >
              <X size={16} />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <>
      <tr className={`hover:bg-gray-50 ${isGrouped ? 'bg-blue-25' : ''} ${isClosed ? 'opacity-75' : ''}`}>
        <td className="px-6 py-4 whitespace-nowrap">
          <div>
            <div className={`text-sm font-medium ${isGrouped ? 'text-blue-800 pl-6' : 'text-gray-900'} ${isClosed ? 'line-through' : ''}`}>
              {position.ticker}
              {isClosed && <span className="ml-2 text-xs text-red-600">(CLOSED)</span>}
            </div>
            <div className="text-sm text-gray-500">
              {format(new Date(position.purchaseDate), 'MMM dd, yyyy')}
              {position.originalShares !== position.shares && (
                <span className="ml-2 text-xs text-blue-600">
                  Originally: {position.originalShares.toLocaleString()}
                </span>
              )}
            </div>
            {hasTransactions && showTransactionHistory && (
              <button
                onClick={() => setShowTransactions(!showTransactions)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-1"
              >
                {showTransactions ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                {position.sellTransactions.length} transaction{position.sellTransactions.length !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{position.shares.toLocaleString()}</div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <div>
            <div className="text-sm text-gray-900">{formatCurrency(position.purchasePricePerShare)}</div>
            <div className="text-xs text-gray-500">
              Cost: {formatCurrency(position.totalPurchasePrice)}
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            {hasCurrentData ? formatCurrency(position.currentPrice!) : '-'}
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            {hasCurrentData ? formatCurrency(position.currentValue!) : formatCurrency(position.totalPurchasePrice)}
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <div>
            <div className={`text-sm font-medium ${
              hasCurrentData
                ? isPositive ? 'text-green-600' : 'text-red-600'
                : 'text-gray-400'
            }`}>
              {hasCurrentData ? formatCurrency(position.unrealizedGainLoss!) : '-'}
            </div>
            {position.realizedGainLoss !== 0 && (
              <div className="text-xs text-gray-600">
                Realized: {formatCurrency(position.realizedGainLoss!)}
              </div>
            )}
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <div className={`text-sm font-medium ${
            hasCurrentData
              ? isPositive ? 'text-green-600' : 'text-red-600'
              : 'text-gray-400'
          }`}>
            {hasCurrentData ? formatPercentage(position.unrealizedGainLossPercentage!) : '-'}
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            {position.shares > 0 && (
              <button
                onClick={() => setShowSellForm(true)}
                className="text-red-600 hover:text-red-800"
                title="Sell shares"
              >
                <TrendingDown size={16} />
              </button>
            )}
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-800"
              title="Edit position"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => onDelete(position.id)}
              className="text-red-600 hover:text-red-800"
              title="Delete position"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </td>
      </tr>
      
      {/* Transaction History */}
      {showTransactions && hasTransactions && showTransactionHistory && (
        <tr>
          <td colSpan={8} className="px-6 py-2 bg-gray-50">
            <div className="text-xs text-gray-600">
              <strong>Transaction History:</strong>
              {position.sellTransactions.map((tx) => (
                <div key={tx.id} className="mt-1">
                  {format(new Date(tx.saleDate), 'MMM dd, yyyy')}: 
                  Sold {tx.sharesSold.toLocaleString()} @ {formatCurrency(tx.salePricePerShare)} = 
                  <span className={tx.realizedGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(tx.realizedGainLoss)} ({formatPercentage(tx.realizedGainLossPercentage)})
                  </span>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
      
      {/* Sell Form Modal */}
      {showSellForm && (
        <SellSharesForm
          position={position}
          onSell={handleSell}
          onCancel={() => setShowSellForm(false)}
        />
      )}
    </>
  );
};