import React, { useState } from 'react';
import { Language, RecommendedBuyer, FarmerCropItem } from '../types';
import { recommendedBuyersList } from '../data/mockData';
import { BuyerContactModal } from '../components/BuyerContactModal';
import {
  Calendar,
  CreditCard,
  Truck,
  Clock,
  UserCheck,
  Building2,
  Wheat,
  ShoppingCart,
  CheckCircle,
  FileText,
} from 'lucide-react';

interface SellCropPageProps {
  lang: Language;
  onCropListed?: (crop: FarmerCropItem) => void;
}

export const SellCropPage: React.FC<SellCropPageProps> = ({ lang, onCropListed }) => {
  // Form State matching screenshot 1.49.44 PM
  const [cropName, setCropName] = useState('paddy');
  const [cropType, setCropType] = useState('Food Grain');
  const [quantity, setQuantity] = useState('27');
  const [expectedPrice, setExpectedPrice] = useState('45');
  const [qualityGrade, setQualityGrade] = useState('Premium');
  const [harvestDate, setHarvestDate] = useState('2026-08-27');
  const [sellingLocation, setSellingLocation] = useState('guntur');
  const [packaging, setPackaging] = useState('Gunny Bags');

  const [transportRequired, setTransportRequired] = useState<'yes' | 'no'>('no');
  const [preferredPayment, setPreferredPayment] = useState('UPI');
  const [preferredBuyer, setPreferredBuyer] = useState('Wholesaler');
  const [preferredSellingTime, setPreferredSellingTime] = useState('Within 7 Days');
  const [additionalNotes, setAdditionalNotes] = useState(
    'Buyer should arrange pickup from my farm. Payment should be completed after weighing.'
  );

  const [showRecommendedBuyers, setShowRecommendedBuyers] = useState(true);
  const [selectedBuyerForModal, setSelectedBuyerForModal] = useState<RecommendedBuyer | null>(null);
  const [savedSuccessAlert, setSavedSuccessAlert] = useState(false);

  const handleClear = () => {
    setCropName('');
    setCropType('');
    setQuantity('');
    setExpectedPrice('');
    setSellingLocation('');
    setAdditionalNotes('');
    setShowRecommendedBuyers(false);
  };

  const handleSaveRequirements = (e: React.FormEvent) => {
    e.preventDefault();
    setShowRecommendedBuyers(true);
    setSavedSuccessAlert(true);

    if (onCropListed && cropName) {
      let key = 'rice';
      if (cropName.toLowerCase().includes('tomato')) key = 'tomato';
      else if (cropName.toLowerCase().includes('chilli')) key = 'chilli';
      else if (cropName.toLowerCase().includes('cotton')) key = 'cotton';
      else if (cropName.toLowerCase().includes('potato')) key = 'potato';

      onCropListed({
        id: `fc-${Date.now()}`,
        name: cropName.charAt(0).toUpperCase() + cropName.slice(1),
        cropKey: key,
        quantity: `${quantity || '500'} kg`,
        price: `₹${expectedPrice || '45'}/kg`,
      });
    }

    setTimeout(() => {
      setSavedSuccessAlert(false);
      window.scrollTo({ top: 750, behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <BuyerContactModal
        buyer={selectedBuyerForModal}
        onClose={() => setSelectedBuyerForModal(null)}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-[#0e6834] uppercase block">
              SELL CROP
            </span>
            <span className="text-xs font-bold text-gray-500 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              1/1
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            My Crop Requirements
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Enter your crop details and selling requirements to connect with the right buyers.
          </p>
        </div>

        {/* Requirements Form */}
        <form onSubmit={handleSaveRequirements} className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-8">
          {/* Card 1: Crop Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-xl shrink-0">
                🌾
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Crop Details</h3>
                <p className="text-xs text-gray-500">Tell buyers about the crop you want to sell.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Crop Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Crop Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paddy"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Crop Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Crop Type *
                </label>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Food Grain">Food Grain</option>
                  <option value="Cash Crop">Cash Crop</option>
                  <option value="Commercial Crop">Commercial Crop</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Oilseeds">Oilseeds</option>
                  <option value="Pulses">Pulses</option>
                </select>
              </div>

              {/* Crop Quantity */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Crop Quantity *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Enter quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 pr-10 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs font-medium text-gray-500">
                    kg
                  </div>
                </div>
              </div>

              {/* Expected Price */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Expected Price *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs font-medium text-gray-500">
                    ₹
                  </div>
                  <input
                    type="number"
                    placeholder="Price per kg"
                    value={expectedPrice}
                    onChange={(e) => setExpectedPrice(e.target.value)}
                    required
                    className="w-full pl-8 pr-12 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs font-medium text-gray-500">
                    /kg
                  </div>
                </div>
              </div>

              {/* Crop Quality / Grade */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Crop Quality / Grade
                </label>
                <select
                  value={qualityGrade}
                  onChange={(e) => setQualityGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Premium">Premium</option>
                  <option value="Grade A">Grade A</option>
                  <option value="Grade B">Grade B</option>
                  <option value="Standard">Standard</option>
                </select>
              </div>

              {/* Expected Harvest Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Expected Harvest Date
                </label>
                <input
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Selling Location */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Selling Location *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vijayawada"
                  value={sellingLocation}
                  onChange={(e) => setSellingLocation(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Packaging Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Packaging Type
                </label>
                <select
                  value={packaging}
                  onChange={(e) => setPackaging(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Gunny Bags">Gunny Bags</option>
                  <option value="Plastic Crates">Plastic Crates</option>
                  <option value="Corrugated Boxes">Corrugated Boxes</option>
                  <option value="Loose Bulk">Loose Bulk</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Selling Requirements */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-xl shrink-0">
                📋
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Selling Requirements</h3>
                <p className="text-xs text-gray-500">Add conditions that are important to you.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Transport Required */}
              <div className="p-3.5 bg-gray-50/60 rounded-xl border border-gray-100">
                <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-gray-500" />
                  Transport Required?
                </label>
                <div className="flex items-center gap-6">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                    <input
                      type="radio"
                      name="transport"
                      value="yes"
                      checked={transportRequired === 'yes'}
                      onChange={() => setTransportRequired('yes')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                    <input
                      type="radio"
                      name="transport"
                      value="no"
                      checked={transportRequired === 'no'}
                      onChange={() => setTransportRequired('no')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              {/* Preferred Payment */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-gray-500" />
                  Preferred Payment
                </label>
                <select
                  value={preferredPayment}
                  onChange={(e) => setPreferredPayment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                  <option value="Advance Payment">Advance Payment</option>
                </select>
              </div>

              {/* Preferred Buyer */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-gray-500" />
                  Preferred Buyer
                </label>
                <select
                  value={preferredBuyer}
                  onChange={(e) => setPreferredBuyer(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Wholesaler">Wholesaler</option>
                  <option value="Any Verified Buyer">Any Verified Buyer</option>
                  <option value="Food Processing Company">Food Processing Company</option>
                  <option value="Retail & Distribution">Retail & Distribution</option>
                  <option value="Exporter">Exporter</option>
                </select>
              </div>

              {/* Preferred Selling Time */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  Preferred Selling Time
                </label>
                <select
                  value={preferredSellingTime}
                  onChange={(e) => setPreferredSellingTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Within 7 Days">Within 7 Days</option>
                  <option value="As Soon As Possible">As Soon As Possible</option>
                  <option value="Within 15 Days">Within 15 Days</option>
                  <option value="Within 1 Month">Within 1 Month</option>
                </select>
              </div>
            </div>

            {/* Additional Requirements / Notes */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Additional Requirements / Notes
              </label>
              <textarea
                rows={3}
                placeholder="Example: Buyer should arrange pickup from my farm. Payment should be completed after weighing."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClear}
              className="px-6 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold transition"
            >
              Clear
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 bg-[#0e6834] hover:bg-[#0b542a] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition active:scale-98"
            >
              Save Requirements →
            </button>
          </div>
        </form>

        {/* Recommended Buyers Section matching Screenshot 1.55.31 PM */}
        {showRecommendedBuyers && (
          <div className="space-y-6 pt-4 animate-in fade-in duration-300">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0e6834]">
                Recommended Buyers
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Based on your requirement, here are 3 buyers looking for your produce.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedBuyersList.map((buyer, idx) => (
                <div
                  key={buyer.id}
                  className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Buyer Header Icon & Name */}
                    <div className="text-center pb-3 border-b border-gray-100">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 mx-auto flex items-center justify-center text-2xl mb-3 border border-emerald-100">
                        {idx === 0 && '🏢'}
                        {idx === 1 && '🌾'}
                        {idx === 2 && '🛒'}
                      </div>
                      <h3 className="font-bold text-gray-900 text-base">{buyer.companyName}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{buyer.businessType}</p>
                    </div>

                    {/* Buyer Specs */}
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Required:</span>
                        <span className="font-semibold text-gray-900">{buyer.requiredCrop}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Quantity:</span>
                        <span className="font-semibold text-gray-900">{buyer.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Location:</span>
                        <span className="font-semibold text-gray-900">{buyer.location}</span>
                      </div>
                    </div>

                    {/* Price Offer */}
                    <div className="pt-2 text-center">
                      <div className="text-xl font-extrabold text-[#0e6834]">
                        {buyer.offeredPrice}
                      </div>
                    </div>
                  </div>

                  {/* Contact Buyer Button */}
                  <div className="pt-5">
                    <button
                      type="button"
                      onClick={() => setSelectedBuyerForModal(buyer)}
                      className="w-full py-2.5 bg-[#0e6834] hover:bg-[#0b542a] text-white rounded-xl text-xs font-bold transition shadow-xs active:scale-98"
                    >
                      Contact Buyer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
