import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import { format } from 'date-fns';

interface AddPositionFormProps {
  onAddPosition: (position: {
    ticker: string;
    shares: number;
    totalPurchasePrice: number;
    purchaseDate: string;
  }) => void;
}

interface FormData {
  ticker: string;
  shares: number;
  totalPurchasePrice: number;
  purchaseDate: string;
}

export const AddPositionForm: React.FC<AddPositionFormProps> = ({ onAddPosition }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm<FormData>({
    defaultValues: {
      purchaseDate: format(new Date(), 'yyyy-MM-dd')
    }
  });

  const shares = watch('shares');
  const totalPrice = watch('totalPurchasePrice');
  const pricePerShare = shares && totalPrice ? (totalPrice / shares).toFixed(2) : '0.00';

  const onSubmit = (data: FormData) => {
    onAddPosition({
      ticker: data.ticker.toUpperCase().trim(),
      shares: Number(data.shares),
      totalPurchasePrice: Number(data.totalPurchasePrice),
      purchaseDate: data.purchaseDate
    });
    reset();
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus size={20} />
        Add Position
      </button>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Add New Position</h3>
        <button
          onClick={() => {
            setIsOpen(false);
            reset();
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ticker Symbol *
            </label>
            <input
              type="text"
              {...register('ticker', { 
                required: 'Ticker symbol is required',
                pattern: {
                  value: /^[A-Za-z]+$/,
                  message: 'Ticker must contain only letters'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., AAPL, MSFT"
            />
            {errors.ticker && (
              <p className="text-sm text-red-600 mt-1">{errors.ticker.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Shares *
            </label>
            <input
              type="number"
              step="0.001"
              min="0.001"
              {...register('shares', { 
                required: 'Number of shares is required',
                min: { value: 0.001, message: 'Must be greater than 0' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="100"
            />
            {errors.shares && (
              <p className="text-sm text-red-600 mt-1">{errors.shares.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Purchase Price *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              {...register('totalPurchasePrice', { 
                required: 'Total purchase price is required',
                min: { value: 0.01, message: 'Must be greater than 0' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="1500.00"
            />
            {errors.totalPurchasePrice && (
              <p className="text-sm text-red-600 mt-1">{errors.totalPurchasePrice.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Date *
            </label>
            <input
              type="date"
              {...register('purchaseDate', { required: 'Purchase date is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.purchaseDate && (
              <p className="text-sm text-red-600 mt-1">{errors.purchaseDate.message}</p>
            )}
          </div>
        </div>
        
        {shares && totalPrice && (
          <div className="bg-gray-50 rounded-md p-3">
            <p className="text-sm text-gray-600">
              Price per share: <span className="font-medium">${pricePerShare}</span>
            </p>
          </div>
        )}
        
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Position
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              reset();
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};