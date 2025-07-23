import React from 'react';
import { StockPosition, TickerGroup } from '../types/portfolio';
import { TickerGroupView } from './TickerGroupView';

interface PositionsListProps {
  tickerGroups: TickerGroup[];
  onUpdatePosition: (position: StockPosition) => void;
  onDeletePosition: (positionId: string) => void;
  onSellShares: (positionId: string, sellData: {
    sharesSold: number;
    saleDate: string;
    salePricePerShare: number;
  }) => void;
}

export const PositionsList: React.FC<PositionsListProps> = ({
  tickerGroups,
  onUpdatePosition,
  onDeletePosition,
  onSellShares
}) => {
  if (tickerGroups.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm text-center">
        <div className="text-gray-400 mb-4">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No positions yet</h3>
        <p className="text-gray-500">
          Add your first stock position to start tracking your portfolio performance.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Your Positions</h3>
          <div className="text-sm text-gray-500">
            {tickerGroups.length} ticker{tickerGroups.length !== 1 ? 's' : ''} • 
            {tickerGroups.reduce((sum, group) => sum + group.positions.length, 0)} position{tickerGroups.reduce((sum, group) => sum + group.positions.length, 0) !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shares
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Market Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unrealized Gain/Loss
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Return %
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tickerGroups.map((group) => (
              <TickerGroupView
                key={group.ticker}
                group={group}
                onUpdatePosition={onUpdatePosition}
                onDeletePosition={onDeletePosition}
                onSellShares={onSellShares}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};