import React, { useState } from 'react';
import { Language, FarmerCropItem } from '../types';
import { initialFarmerCrops, recentActivities } from '../data/mockData';
import { TrophyIcon, TractorIcon, RiceIcon, ChilliIcon, CottonIcon } from '../components/Icons';
import { AddCropModal } from '../components/AddCropModal';
import {
  TrendingUp,
  MapPin,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

import { UserProfile } from '../types';

interface FarmerDashboardPageProps {
  lang: Language;
  onNavigate: (tab: string) => void;
  currentUser?: UserProfile | null;
  crops?: FarmerCropItem[];
  onAddCrop?: (crop: FarmerCropItem) => void;
}

export const FarmerDashboardPage: React.FC<FarmerDashboardPageProps> = ({
  lang,
  onNavigate,
  currentUser,
  crops: propCrops,
  onAddCrop: propOnAddCrop,
}) => {
  const [internalCrops, setInternalCrops] = useState<FarmerCropItem[]>(initialFarmerCrops);
  const [isAddCropOpen, setIsAddCropOpen] = useState(false);

  const activeCrops = propCrops || internalCrops;

  const handleAddCrop = (newCrop: FarmerCropItem) => {
    if (propOnAddCrop) {
      propOnAddCrop(newCrop);
    } else {
      setInternalCrops([newCrop, ...internalCrops]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <AddCropModal
        isOpen={isAddCropOpen}
        onClose={() => setIsAddCropOpen(false)}
        onAddCrop={handleAddCrop}
      />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Banner Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-[#0e6834] uppercase block mb-1">
              FARMER DASHBOARD
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 flex items-center gap-2">
              Good Morning, {currentUser?.name ? currentUser.name.split(' ')[0] : 'Farmer'}! <span className="text-3xl">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Check today&apos;s prices, discover the best market and make better selling decisions.
            </p>
          </div>

          <div className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 shadow-xs">
            <span className="text-rose-500">📍</span>
            <span>{currentUser?.apmc ? `${currentUser.apmc.replace(' APMC', '')}, AP` : 'Vijayawada, Andhra Pradesh'}</span>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Metric 1 */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 text-2xl">
              💰
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium block">Today&apos;s Best Price</span>
              <div className="text-2xl font-black text-gray-900">₹32.00/kg</div>
              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-0.5 mt-0.5">
                <TrendingUp className="w-3 h-3" /> 8.5% from yesterday
              </span>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 text-2xl">
              🌾
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium block">My Crops</span>
              <div className="text-2xl font-black text-gray-900">{activeCrops.length} Crops</div>
              <span className="text-[11px] text-gray-400 block mt-0.5 truncate max-w-[130px]">
                {activeCrops.map((c) => c.name).join(' • ')}
              </span>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 text-2xl">
              🏪
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium block">Nearby Markets</span>
              <div className="text-2xl font-black text-gray-900">8 Markets</div>
              <span className="text-[11px] text-gray-400 block mt-0.5">Within 120 km</span>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 text-2xl">
              🤝
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium block">Buyer Interest</span>
              <div className="text-2xl font-black text-gray-900">12 Buyers</div>
              <span className="text-[11px] font-bold text-emerald-700 block mt-0.5">
                ↑ 4 new requests
              </span>
            </div>
          </div>
        </div>

        {/* 2 Column Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Today's Market Prices Card */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Today&apos;s Market Prices</h3>
                  <p className="text-xs text-gray-500">Prices near your location</p>
                </div>
                <button
                  onClick={() => onNavigate('market-prices')}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
                >
                  View All →
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {/* Paddy Item */}
                <div
                  onClick={() => onNavigate('market-prices')}
                  className="py-4 flex items-center justify-between hover:bg-slate-50/60 px-2 rounded-xl transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <RiceIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Paddy</h4>
                      <p className="text-xs text-gray-500">Tenali Mandi</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-emerald-800">₹32.00</span>
                    <span className="text-xs font-bold text-emerald-700 block">↑ 8.5%</span>
                  </div>
                </div>

                {/* Chilli Item */}
                <div
                  onClick={() => onNavigate('market-prices')}
                  className="py-4 flex items-center justify-between hover:bg-slate-50/60 px-2 rounded-xl transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                      <ChilliIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Chilli</h4>
                      <p className="text-xs text-gray-500">Guntur Mandi</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-emerald-800">₹145.00</span>
                    <span className="text-xs font-bold text-emerald-700 block">↑ 4.2%</span>
                  </div>
                </div>

                {/* Cotton Item */}
                <div
                  onClick={() => onNavigate('market-prices')}
                  className="py-4 flex items-center justify-between hover:bg-slate-50/60 px-2 rounded-xl transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <CottonIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Cotton</h4>
                      <p className="text-xs text-gray-500">Vijayawada Mandi</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-emerald-800">₹72.00</span>
                    <span className="text-xs font-bold text-emerald-700 block">↑ 2.8%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Recommendation Card */}
            <div className="bg-[#f2faf4] border border-emerald-200/80 rounded-2xl p-6 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-3 z-10 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0e6834] block">
                  SMART RECOMMENDATION
                </span>
                <h3 className="text-xl font-extrabold text-gray-900">
                  Where should you sell your crop?
                </h3>
                <p className="text-xs text-gray-600 max-w-sm">
                  Compare nearby markets and find the market offering the best estimated return for your crop.
                </p>
                <div>
                  <button
                    onClick={() => onNavigate('price-discovery')}
                    className="px-5 py-2.5 bg-[#0e6834] hover:bg-[#0b542a] text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-98"
                  >
                    Discover Best Price →
                  </button>
                </div>
              </div>

              <div className="shrink-0 p-4 bg-white/70 rounded-2xl shadow-xs">
                <TrophyIcon className="w-16 h-16" />
              </div>
            </div>
          </div>

          {/* Right Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* My Crops Card */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">My Crops</h3>
                  <p className="text-xs text-gray-500">Your listed crops</p>
                </div>
                <button
                  onClick={() => setIsAddCropOpen(true)}
                  className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#0e6834] rounded-lg text-xs font-bold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {activeCrops.map((c) => (
                  <div key={c.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                        {c.cropKey === 'rice' && <RiceIcon className="w-6 h-6" />}
                        {c.cropKey === 'chilli' && <ChilliIcon className="w-6 h-6" />}
                        {c.cropKey === 'cotton' && <CottonIcon className="w-6 h-6" />}
                        {c.cropKey === 'tomato' && <span className="text-lg">🍅</span>}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{c.name}</h4>
                        <p className="text-xs text-gray-500">{c.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-800 text-sm">{c.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ready to Sell? Green Card */}
            <div className="bg-[#0e6834] rounded-2xl p-6 text-white flex items-center gap-4 shadow-sm hover:shadow-md transition">
              <div className="p-3 bg-white/10 rounded-2xl shrink-0">
                <TractorIcon className="w-12 h-12" />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold">Ready to Sell?</h4>
                <p className="text-xs text-emerald-100/90 mt-0.5">
                  List your crop and connect with verified buyers.
                </p>
                <button
                  onClick={() => onNavigate('sell-crop')}
                  className="mt-3 text-xs font-bold text-white underline hover:text-emerald-200 flex items-center gap-1"
                >
                  <span>Sell Your Crop →</span>
                </button>
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">Recent Activity</h3>
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                  3
                </span>
              </div>

              <div className="space-y-4">
                {recentActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{act.text}</p>
                      <span className="text-[11px] text-gray-400 mt-0.5 block">{act.timeAgo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
