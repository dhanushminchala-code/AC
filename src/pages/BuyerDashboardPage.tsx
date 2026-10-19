import React, { useState } from 'react';
import { Language, BuyerRequirement, MatchingFarmer } from '../types';
import { buyerRequirementsList, matchingFarmersList } from '../data/mockData';
import {
  Plus,
  Search,
  CheckCircle,
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  Phone,
  MessageSquare,
  X,
} from 'lucide-react';

interface BuyerDashboardPageProps {
  lang: Language;
}

export const BuyerDashboardPage: React.FC<BuyerDashboardPageProps> = ({ lang }) => {
  const [requirements, setRequirements] = useState<BuyerRequirement[]>(buyerRequirementsList);
  const [farmers, setFarmers] = useState<MatchingFarmer[]>(matchingFarmersList);
  const [selectedFarmer, setSelectedFarmer] = useState<MatchingFarmer | null>(null);

  // Buy Crop Form State
  const [cropName, setCropName] = useState('Paddy');
  const [cropType, setCropType] = useState('Food Grain');
  const [quantityRequired, setQuantityRequired] = useState('5000');
  const [maxPrice, setMaxPrice] = useState('34');
  const [qualityGrade, setQualityGrade] = useState('Grade A');
  const [preferredLocation, setPreferredLocation] = useState('Vijayawada');
  const [requiredBy, setRequiredBy] = useState('2026-09-15');
  const [packaging, setPackaging] = useState('Any');
  const [transportation, setTransportation] = useState('Buyer will arrange pickup');
  const [preferredPayment, setPreferredPayment] = useState('Bank Transfer');
  const [farmerPreference, setFarmerPreference] = useState('Any Verified Farmer');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [successToast, setSuccessToast] = useState(false);
  const [inquiryToast, setInquiryToast] = useState<string | null>(null);

  const handleCreateRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: BuyerRequirement = {
      id: `br-${Date.now()}`,
      cropName,
      category: `${cropType} • ${qualityGrade}`,
      quantityRequired: `${Number(quantityRequired).toLocaleString()} kg required`,
      priceRange: `₹${maxPrice}/kg`,
      status: 'Active',
    };
    setRequirements([newReq, ...requirements]);
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      {/* Farmer View Modal */}
      {selectedFarmer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-5 bg-emerald-800 text-white flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                  👨‍🌾
                </div>
                <div>
                  <h3 className="font-bold text-lg">{selectedFarmer.farmerName}</h3>
                  <p className="text-xs text-emerald-200">
                    {selectedFarmer.cropName} Grower • {selectedFarmer.location}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFarmer(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-emerald-50 rounded-xl text-xs space-y-2 border border-emerald-100">
                <div className="flex justify-between">
                  <span className="text-gray-500">Available Stock:</span>
                  <span className="font-bold text-gray-900">{selectedFarmer.quantityAvailable}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Produce Quality:</span>
                  <span className="font-bold text-gray-900">{selectedFarmer.quality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Expected Price:</span>
                  <span className="font-bold text-emerald-700">₹{selectedFarmer.priceExpectation}/kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Farmer Rating:</span>
                  <span className="font-bold text-amber-600 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500" /> {selectedFarmer.rating} / 5.0
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <a
                  href={`tel:${selectedFarmer.phone}`}
                  className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Farmer
                </a>
                <button
                  onClick={() => {
                    setInquiryToast(`Purchase inquiry dispatched to ${selectedFarmer.farmerName}!`);
                    setSelectedFarmer(null);
                    setTimeout(() => setInquiryToast(null), 4000);
                  }}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Request Deal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Inquiry Toast */}
      {inquiryToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-emerald-950 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-start gap-3 animate-in slide-in-from-bottom duration-300">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h5 className="text-xs font-bold text-white">Deal Inquiry Sent</h5>
            <p className="text-[11px] text-emerald-200/90 mt-0.5 leading-snug">{inquiryToast}</p>
          </div>
          <button onClick={() => setInquiryToast(null)} className="text-emerald-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-[#0e6834] uppercase block mb-1">
              BUYER DASHBOARD
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 flex items-center gap-2">
              Welcome to AgriConnect <span className="text-3xl">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Find quality crops directly from farmers at fair and transparent prices.
            </p>
          </div>

          <button
            onClick={() => {
              window.scrollTo({ top: 550, behavior: 'smooth' });
            }}
            className="self-start sm:self-auto px-5 py-2.5 bg-[#0e6834] hover:bg-[#0b542a] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Buying Requirement</span>
          </button>
        </div>

        {/* 4 Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl shrink-0">
              🌾
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">12</div>
              <span className="text-xs text-gray-500 font-medium">Available Crops</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl shrink-0">
              👨‍🌾
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">28</div>
              <span className="text-xs text-gray-500 font-medium">Matching Farmers</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-2xl shrink-0">
              💰
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">₹32/kg</div>
              <span className="text-xs text-gray-500 font-medium">Best Market Price</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-2xl shrink-0">
              📦
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">{requirements.length}</div>
              <span className="text-xs text-gray-500 font-medium">Active Requirements</span>
            </div>
          </div>
        </div>

        {/* Row 1: Your Buying Requirements & Matching Farmers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Your Buying Requirements */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100">
            <h3 className="text-base font-bold text-gray-900">Your Buying Requirements</h3>
            <p className="text-xs text-gray-500 mb-4">Crops you are currently looking to purchase.</p>

            <div className="divide-y divide-gray-100">
              {requirements.map((req) => (
                <div key={req.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-xl shrink-0">
                      🌾
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{req.cropName}</h4>
                      <p className="text-xs text-gray-500">{req.category}</p>
                      <p className="text-[11px] text-amber-600 font-medium">{req.quantityRequired}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">{req.priceRange}</div>
                    <span className="text-[10px] text-gray-400 block">Maximum Price</span>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Matching Farmers */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100">
            <h3 className="text-base font-bold text-gray-900">Matching Farmers</h3>
            <p className="text-xs text-gray-500 mb-4">Farmers matching your requirements.</p>

            <div className="divide-y divide-gray-100">
              {farmers.map((farmer) => (
                <div key={farmer.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-xl shrink-0">
                      👨‍🌾
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-gray-900 text-sm">{farmer.farmerName}</h4>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <p className="text-xs text-gray-500">
                        {farmer.cropName} • {farmer.location}
                      </p>
                      <p className="text-[11px] text-emerald-700 font-medium">
                        {farmer.quantityAvailable}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedFarmer(farmer)}
                    className="px-4 py-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold shadow-2xs transition"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section: BUY CROP - Tell us what you want to buy */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0e6834] block mb-1">
              BUY CROP
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
              Tell us what you want to buy
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Add your requirements so AgriConnect can find suitable farmers for you.
            </p>
          </div>

          {successToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Requirement added! AgriConnect is matching farmers for you.</span>
            </div>
          )}

          <form onSubmit={handleCreateRequirement} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Crop Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Crop Name *
                </label>
                <input
                  type="text"
                  placeholder="Example: Paddy"
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
                  <option value="Commercial Crop">Commercial Crop</option>
                  <option value="Cash Crop">Cash Crop</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                </select>
              </div>

              {/* Quantity Required */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Quantity Required *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Enter quantity"
                    value={quantityRequired}
                    onChange={(e) => setQuantityRequired(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 pr-10 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs font-medium text-gray-500">
                    kg
                  </div>
                </div>
              </div>

              {/* Maximum Price */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Maximum Price *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs font-medium text-gray-500">
                    ₹
                  </div>
                  <input
                    type="number"
                    placeholder="Price per kg"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    required
                    className="w-full pl-8 pr-12 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs font-medium text-gray-500">
                    /kg
                  </div>
                </div>
              </div>

              {/* Required Quality / Grade */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Required Quality / Grade
                </label>
                <select
                  value={qualityGrade}
                  onChange={(e) => setQualityGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Any">Any</option>
                  <option value="Grade A">Grade A</option>
                  <option value="Premium">Premium</option>
                  <option value="Standard">Standard</option>
                </select>
              </div>

              {/* Preferred Location */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Preferred Location *
                </label>
                <input
                  type="text"
                  placeholder="Example: Vijayawada"
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Required By Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Required By
                </label>
                <input
                  type="date"
                  value={requiredBy}
                  onChange={(e) => setRequiredBy(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Packaging */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Packaging
                </label>
                <select
                  value={packaging}
                  onChange={(e) => setPackaging(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Any">Any</option>
                  <option value="Gunny Bags">Gunny Bags</option>
                  <option value="Plastic Crates">Plastic Crates</option>
                  <option value="Loose Bulk">Loose Bulk</option>
                </select>
              </div>

              {/* Transportation */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Transportation
                </label>
                <select
                  value={transportation}
                  onChange={(e) => setTransportation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Buyer will arrange pickup">Buyer will arrange pickup</option>
                  <option value="Farmer should deliver">Farmer should deliver</option>
                </select>
              </div>

              {/* Preferred Payment */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Preferred Payment
                </label>
                <select
                  value={preferredPayment}
                  onChange={(e) => setPreferredPayment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                </select>
              </div>

              {/* Farmer Preference */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Farmer Preference
                </label>
                <select
                  value={farmerPreference}
                  onChange={(e) => setFarmerPreference(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Any Verified Farmer">Any Verified Farmer</option>
                  <option value="APMC Registered Only">APMC Registered Only</option>
                  <option value="Organic Certified Farmers">Organic Certified Farmers</option>
                </select>
              </div>
            </div>

            {/* Additional Requirements */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Additional Requirements
              </label>
              <textarea
                rows={3}
                placeholder="Mention any additional requirements..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-8 py-3 bg-[#0e6834] hover:bg-[#0b542a] text-white rounded-xl text-sm font-bold shadow-xs transition active:scale-98"
              >
                Find Matching Farmers →
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
