import { useState, useEffect, useCallback } from 'react';
import { StockPosition, Portfolio, SellTransaction, TickerGroup } from '../types/portfolio';
import { PortfolioStorage } from '../services/portfolioStorage';
import { finnhubApi } from '../services/finnhubApi';
import { format } from 'date-fns';

export const usePortfolio = () => {
  const [positions, setPositions] = useState<StockPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load positions from localStorage on mount
  useEffect(() => {
    const loadedPositions = PortfolioStorage.loadPositions();
    setPositions(loadedPositions);
  }, []);

  // Group positions by ticker
  const tickerGroups: TickerGroup[] = positions.reduce((groups: TickerGroup[], position) => {
    const existingGroup = groups.find(g => g.ticker === position.ticker);
    
    if (existingGroup) {
      existingGroup.positions.push(position);
      existingGroup.totalShares += position.shares;
      existingGroup.totalCost += position.totalPurchasePrice;
      existingGroup.totalCurrentValue += position.currentValue || position.totalPurchasePrice;
      existingGroup.totalUnrealizedGainLoss += position.unrealizedGainLoss || 0;
      existingGroup.totalRealizedGainLoss += position.realizedGainLoss || 0;
    } else {
      groups.push({
        ticker: position.ticker,
        companyName: position.companyName,
        positions: [position],
        totalShares: position.shares,
        totalCost: position.totalPurchasePrice,
        totalCurrentValue: position.currentValue || position.totalPurchasePrice,
        totalUnrealizedGainLoss: position.unrealizedGainLoss || 0,
        totalRealizedGainLoss: position.realizedGainLoss || 0,
        averagePurchasePrice: position.purchasePricePerShare,
        currentPrice: position.currentPrice
      });
    }
    
    return groups;
  }, []);

  // Update average purchase price for groups
  tickerGroups.forEach(group => {
    if (group.totalShares > 0) {
      group.averagePurchasePrice = group.totalCost / group.totalShares;
    }
  });

  // Calculate portfolio summary
  const portfolio: Portfolio = {
    positions,
    totalValue: positions.reduce((sum, pos) => sum + (pos.currentValue || pos.totalPurchasePrice), 0),
    totalCost: positions.reduce((sum, pos) => sum + pos.totalPurchasePrice, 0),
    totalUnrealizedGainLoss: positions.reduce((sum, pos) => sum + (pos.unrealizedGainLoss || 0), 0),
    totalRealizedGainLoss: positions.reduce((sum, pos) => sum + (pos.realizedGainLoss || 0), 0),
    totalGainLoss: 0,
    totalGainLossPercentage: 0
  };

  portfolio.totalGainLoss = portfolio.totalUnrealizedGainLoss + portfolio.totalRealizedGainLoss;
  
  if (portfolio.totalCost > 0) {
    portfolio.totalGainLossPercentage = (portfolio.totalGainLoss / portfolio.totalCost) * 100;
  }

  const addPosition = useCallback((positionData: Omit<StockPosition, 'id' | 'purchasePricePerShare' | 'originalShares' | 'sellTransactions' | 'realizedGainLoss'>) => {
    const newPosition: StockPosition = {
      ...positionData,
      id: crypto.randomUUID(),
      purchasePricePerShare: positionData.totalPurchasePrice / positionData.shares,
      originalShares: positionData.shares,
      sellTransactions: [],
      realizedGainLoss: 0
    };

    PortfolioStorage.addPosition(newPosition);
    setPositions(prev => [...prev, newPosition]);
  }, []);

  const updatePosition = useCallback((updatedPosition: StockPosition) => {
    PortfolioStorage.updatePosition(updatedPosition);
    setPositions(prev => prev.map(pos => 
      pos.id === updatedPosition.id ? updatedPosition : pos
    ));
  }, []);

  const deletePosition = useCallback((positionId: string) => {
    PortfolioStorage.deletePosition(positionId);
    setPositions(prev => prev.filter(pos => pos.id !== positionId));
  }, []);

  const sellShares = useCallback((positionId: string, sellData: {
    sharesSold: number;
    saleDate: string;
    salePricePerShare: number;
  }) => {
    const position = positions.find(p => p.id === positionId);
    if (!position) {
      throw new Error('Position not found');
    }

    if (sellData.sharesSold > position.shares) {
      throw new Error('Cannot sell more shares than owned');
    }

    const sellTransaction: SellTransaction = {
      id: crypto.randomUUID(),
      positionId,
      ticker: position.ticker,
      sharesSold: sellData.sharesSold,
      saleDate: sellData.saleDate,
      salePricePerShare: sellData.salePricePerShare,
      totalSaleAmount: sellData.sharesSold * sellData.salePricePerShare,
      purchasePricePerShare: position.purchasePricePerShare,
      realizedGainLoss: (sellData.salePricePerShare - position.purchasePricePerShare) * sellData.sharesSold,
      realizedGainLossPercentage: ((sellData.salePricePerShare - position.purchasePricePerShare) / position.purchasePricePerShare) * 100
    };

    const updatedPosition = PortfolioStorage.sellShares(positionId, sellTransaction);
    if (updatedPosition) {
      setPositions(prev => prev.map(pos => 
        pos.id === positionId ? updatedPosition : pos
      ));
    }
  }, [positions]);

  const refreshPrices = useCallback(async () => {
    if (positions.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedPositions = await Promise.allSettled(
        positions.map(async (position) => {
          try {
            const quote = await finnhubApi.getQuote(position.ticker);
            const currentPrice = quote.c;
            const currentValue = currentPrice * position.shares;
            const unrealizedGainLoss = currentValue - (position.purchasePricePerShare * position.shares);
            const unrealizedGainLossPercentage = (unrealizedGainLoss / (position.purchasePricePerShare * position.shares)) * 100;
            
            const updatedPosition: StockPosition = {
              ...position,
              currentPrice,
              currentValue,
              unrealizedGainLoss,
              unrealizedGainLossPercentage,
              lastUpdated: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
            };
            
            return updatedPosition;
          } catch (error) {
            console.error(`Failed to update price for ${position.ticker}:`, error);
            return position; // Return original position if update fails
          }
        })
      );
      
      const successful = updatedPositions
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<StockPosition>).value);
      
      setPositions(successful);
      PortfolioStorage.savePositions(successful);
      setLastUpdated(new Date());
      
      // Check for any failures
      const failures = updatedPositions.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        setError(`Failed to update ${failures.length} position(s). Please try again.`);
      }
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to refresh prices');
    } finally {
      setLoading(false);
    }
  }, [positions]);

  const getAllTransactions = useCallback(() => {
    return PortfolioStorage.getAllTransactions();
  }, [positions]); // Re-calculate when positions change

  const getRemainingApiCalls = useCallback(() => {
    return finnhubApi.getRemainingRequests();
  }, []);

  return {
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
    clearError: () => setError(null)
  };
};