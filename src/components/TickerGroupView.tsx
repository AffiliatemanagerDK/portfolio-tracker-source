import React, { useState } from 'react';
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { TickerGroup } from '../types/portfolio';
import { PositionItem } from './PositionItem';
import { StockPosition } from '../types/portfolio';
import { format } from 'date-fns';

interface TickerGroupViewProps {
  group: TickerGroup;
  onUpdatePosition: (position: StockPosition) => void;
  onDeletePosition: (positionId: string) => void;
  onSellShares: (positionId: string, sellData: {
    sharesSold: number;
    saleDate: string;
    salePricePerShare: number;
  }) => void;
}

export const TickerGroupView: React.FC<TickerGroupViewProps> = ({
  group,
  onUpdatePosition,
  onDeletePosition,
  onSellShares
}) => {
  const [isExpanded, setIsExpanded] = useState(group.positions.length === 1);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const totalGainLoss = group.totalUnrealizedGainLoss + group.totalRealizedGainLoss;
  const totalGainLossPercentage = group.totalCost > 0 ? (totalGainLoss / group.totalCost) * 100 : 0;
  const isPositive = totalGainLoss >= 0;
  const hasCurrentData = group.currentPrice !== undefined;

  if (group.positions.length === 1) {
    // Single position - show directly without grouping
    return (
      <PositionItem
        position={group.positions[0]}
        onUpdate={onUpdatePosition}
        onDelete={onDeletePosition}
        onSell={onSellShares}
        showTransactionHistory={true}
      />
    );
  }

  return (
    <>
      {/* Group Summary Row */}
      <tr 
        className="bg-blue-50 border-t-2 border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <div>
              <div className="text-sm font-bold text-blue-900">{group.ticker}</div>
              <div className="text-xs text-blue-700">
                {group.positions.length} positions • {group.totalShares.toLocaleString()} total shares
              </div>
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-blue-900">{group.totalShares.toLocaleString()}</div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <div>
            <div className="text-sm font-medium text-blue-900">{formatCurrency(group.averagePurchasePrice)}</div>
            <div className="text-xs text-blue-700">
              Total: {formatCurrency(group.totalCost)}
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-blue-900">
            {hasCurrentData ? formatCurrency(group.currentPrice!) : '-'}
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-blue-900">
            {formatCurrency(group.totalCurrentValue)}
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <div>
            <div className={`text-sm font-bold ${
              hasCurrentData
                ? isPositive ? 'text-green-600' : 'text-red-600'
                : 'text-gray-400'
            }`}>
              {hasCurrentData ? formatCurrency(group.totalUnrealizedGainLoss) : '-'}
            </div>
            {group.totalRealizedGainLoss !== 0 && (
              <div className="text-xs text-gray-600">
                Realized: {formatCurrency(group.totalRealizedGainLoss)}
              </div>
            )}
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <div className={`text-sm font-bold ${
            hasCurrentData
              ? isPositive ? 'text-green-600' : 'text-red-600'
              : 'text-gray-400'
          }`}>
            {hasCurrentData ? formatPercentage(totalGainLossPercentage) : '-'}
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-xs text-blue-700">
            {isExpanded ? 'Collapse' : 'Expand'}
          </div>
        </td>
      </tr>
      
      {/* Individual Positions */}
      {isExpanded && group.positions.map((position) => (
        <PositionItem
          key={position.id}
          position={position}
          onUpdate={onUpdatePosition}
          onDelete={onDeletePosition}
          onSell={onSellShares}
          isGrouped={true}
          showTransactionHistory={false}
        />
      ))}
    </>
  );
};