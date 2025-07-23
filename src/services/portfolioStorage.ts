import { StockPosition, SellTransaction } from '../types/portfolio';

const STORAGE_KEY = 'stock_portfolio_positions';
const TRANSACTIONS_KEY = 'stock_portfolio_transactions';

export class PortfolioStorage {
  static savePositions(positions: StockPosition[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
    } catch (error) {
      console.error('Failed to save positions to localStorage:', error);
      throw new Error('Failed to save portfolio data');
    }
  }

  static loadPositions(): StockPosition[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      
      const positions = JSON.parse(data);
      
      // Validate the loaded data structure
      if (!Array.isArray(positions)) {
        console.warn('Invalid portfolio data format, starting fresh');
        return [];
      }
      
      // Migrate old positions to new format and validate
      return positions.map((position: any) => {
        // Validate required fields
        if (
          typeof position.id !== 'string' ||
          typeof position.ticker !== 'string' ||
          typeof position.shares !== 'number' ||
          typeof position.totalPurchasePrice !== 'number' ||
          typeof position.purchaseDate !== 'string' ||
          position.shares < 0 ||
          position.totalPurchasePrice <= 0
        ) {
          return null;
        }

        // Migrate old format to new format with backward compatibility
        const migratedPosition: StockPosition = {
          id: position.id,
          ticker: position.ticker,
          companyName: position.companyName,
          shares: position.shares,
          originalShares: position.originalShares || position.shares, // backward compatibility
          totalPurchasePrice: position.totalPurchasePrice,
          purchaseDate: position.purchaseDate,
          purchasePricePerShare: position.purchasePricePerShare || (position.totalPurchasePrice / position.shares),
          currentPrice: position.currentPrice,
          currentValue: position.currentValue,
          unrealizedGainLoss: position.unrealizedGainLoss || position.gainLoss, // backward compatibility
          unrealizedGainLossPercentage: position.unrealizedGainLossPercentage || position.gainLossPercentage,
          realizedGainLoss: position.realizedGainLoss || 0,
          lastUpdated: position.lastUpdated,
          sellTransactions: position.sellTransactions || []
        };

        return migratedPosition;
      }).filter(Boolean); // Remove null entries
    } catch (error) {
      console.error('Failed to load positions from localStorage:', error);
      return [];
    }
  }

  static addPosition(position: StockPosition): void {
    const positions = this.loadPositions();
    positions.push(position);
    this.savePositions(positions);
  }

  static updatePosition(updatedPosition: StockPosition): void {
    const positions = this.loadPositions();
    const index = positions.findIndex(p => p.id === updatedPosition.id);
    
    if (index >= 0) {
      positions[index] = updatedPosition;
      this.savePositions(positions);
    }
  }

  static deletePosition(positionId: string): void {
    const positions = this.loadPositions();
    const filteredPositions = positions.filter(p => p.id !== positionId);
    this.savePositions(filteredPositions);
  }

  static sellShares(positionId: string, sellTransaction: SellTransaction): StockPosition | null {
    const positions = this.loadPositions();
    const positionIndex = positions.findIndex(p => p.id === positionId);
    
    if (positionIndex >= 0) {
      const position = positions[positionIndex];
      
      // Validate sell transaction
      if (sellTransaction.sharesSold > position.shares) {
        throw new Error('Cannot sell more shares than owned');
      }
      
      // Update position
      const updatedPosition: StockPosition = {
        ...position,
        shares: position.shares - sellTransaction.sharesSold,
        sellTransactions: [...position.sellTransactions, sellTransaction],
        realizedGainLoss: (position.realizedGainLoss || 0) + sellTransaction.realizedGainLoss
      };
      
      // If all shares are sold, we can either remove the position or keep it for history
      // Let's keep it for transaction history but mark it as closed
      positions[positionIndex] = updatedPosition;
      this.savePositions(positions);
      
      return updatedPosition;
    }
    
    return null;
  }

  static getAllTransactions(): SellTransaction[] {
    const positions = this.loadPositions();
    const allTransactions: SellTransaction[] = [];
    
    positions.forEach(position => {
      allTransactions.push(...position.sellTransactions);
    });
    
    // Sort by date (newest first)
    return allTransactions.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
  }

  static clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TRANSACTIONS_KEY);
  }
}