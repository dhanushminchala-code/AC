import React, { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { FarmerCropItem } from '../types';

interface AddCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCrop: (crop: FarmerCropItem) => void;
}

export const AddCropModal: React.FC<AddCropModalProps> = ({ isOpen, onClose, onAddCrop }) => {
  const [cropName, setCropName] = useState('Paddy');
  const [quantity, setQuantity] = useState('');
  const [expectedPrice, setExpectedPrice] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || !expectedPrice) return;

    let key = 'rice';
    if (cropName.toLowerCase().includes('tomato')) key = 'tomato';
    else if (cropName.toLowerCase().includes('chilli')) key = 'chilli';
    else if (cropName.toLowerCase().includes('cotton')) key = 'cotton';
    else if (cropName.toLowerCase().includes('potato')) key = 'potato';

    onAddCrop({
      id: `fc-${Date.now()}`,
      name: cropName,
      cropKey: key,
      quantity: `${quantity} kg`,
      price: `₹${expectedPrice}/kg`,
    });
    setQuantity('');
    setExpectedPrice('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-700" /> Add Crop to Profile
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Select Crop *
            </label>
            <select
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="Paddy">Paddy / Rice</option>
              <option value="Tomato">Tomato</option>
              <option value="Chilli">Chilli</option>
              <option value="Cotton">Cotton</option>
              <option value="Potato">Potato</option>
              <option value="Maize">Maize</option>
              <option value="Onion">Onion</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Estimated Harvest Quantity (kg) *
            </label>
            <input
              type="number"
              placeholder="e.g. 500"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Expected Selling Price (₹ / kg) *
            </label>
            <input
              type="number"
              placeholder="e.g. 35"
              value={expectedPrice}
              onChange={(e) => setExpectedPrice(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Add Crop
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
