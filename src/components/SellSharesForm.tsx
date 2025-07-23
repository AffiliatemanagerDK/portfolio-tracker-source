import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { DollarSign, X, TrendingDown } from 'lucide-react';
import { StockPosition } from '../types/portfolio';
import { format } from 'date-fns';

interface SellSharesFormProps {
  position: StockPosition;
  onSell: (sellData: {
    sharesSold: number;
    saleDate: string;
    salePricePerShare: number;
  }) => void;
  onCancel: () => void;
}

interface FormData {
  sharesSold: number;
  saleDate: string;
  salePricePerShare: number;
}

export const SellSharesForm: React.FC<SellSharesFormProps> = ({ position, onSell, onCancel }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      saleDate: format(new Date(), 'yyyy-MM-dd'),
      salePricePerShare: position.currentPrice || position.purchasePricePerShare
    }
  });

  const sharesSold = watch('sharesSold');
  const salePricePerShare = watch('salePricePerShare');
  const [sellAll, setSellAll] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalSaleAmount = sharesSold && salePricePerShare ? sharesSold * salePricePerShare : 0;
  const costBasis = sharesSold ? sharesSold * position.purchasePricePerShare : 0;
  const realizedGainLoss = totalSaleAmount - costBasis;
  const realizedGainLossPercentage = costBasis > 0 ? (realizedGainLoss / costBasis) * 100 : 0;
  const isGain = realizedGainLoss >= 0;

  const onSubmit = (data: FormData) => {
    onSell({
      sharesSold: sellAll ? position.shares : Number(data.sharesSold),
      saleDate: data.saleDate,
      salePricePerShare: Number(data.salePricePerShare)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="text-red-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">Sell {position.ticker}</h3>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <div className="text-sm text-gray-600">
            Available shares: <span className="font-medium">{position.shares.toLocaleString()}</span>
          </div>
          <div className="text-sm text-gray-600">
            Purchase price: <span className="font-medium">{formatCurrency(position.purchasePricePerShare)}</span>
          </div>
          {position.currentPrice && (
            <div className="text-sm text-gray-600">
              Current price: <span className="font-medium">{formatCurrency(position.currentPrice)}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="sellAll"
                checked={sellAll}
                onChange={(e) => setSellAll(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="sellAll" className="text-sm font-medium text-gray-700">
                Sell all shares ({position.shares.toLocaleString()})
              </label>
            </div>
            
            {!sellAll && (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shares to Sell *
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  max={position.shares}
                  {...register('sharesSold', { 
                    required: !sellAll ? 'Number of shares is required' : false,
                    min: { value: 0.001, message: 'Must be greater than 0' },
                    max: { value: position.shares, message: 'Cannot sell more than owned' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder={`Max: ${position.shares}`}
                />
                {errors.sharesSold && (
                  <p className="text-sm text-red-600 mt-1">{errors.sharesSold.message}</p>
                )}
              </>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sale Price per Share *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              {...register('salePricePerShare', { 
                required: 'Sale price is required',
                min: { value: 0.01, message: 'Must be greater than 0' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="15.50"
            />
            {errors.salePricePerShare && (
              <p className="text-sm text-red-600 mt-1">{errors.salePricePerShare.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sale Date *
            </label>
            <input
              type="date"
              {...register('saleDate', { required: 'Sale date is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            {errors.saleDate && (
              <p className="text-sm text-red-600 mt-1">{errors.saleDate.message}</p>
            )}
          </div>
          
          {(sharesSold > 0 && salePricePerShare > 0) && (
            <div className="bg-gray-50 rounded-md p-4">
              <h4 className="font-medium text-gray-900 mb-2">Transaction Preview</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sale Amount:</span>
                  <span className="font-medium">{formatCurrency(totalSaleAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cost Basis:</span>
                  <span className="font-medium">{formatCurrency(costBasis)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Realized Gain/Loss:</span>
                  <span className={`font-medium ${isGain ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(realizedGainLoss)} ({isGain ? '+' : ''}{realizedGainLossPercentage.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              Confirm Sale
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};