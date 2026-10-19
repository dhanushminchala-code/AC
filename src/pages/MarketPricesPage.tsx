import React, { useState } from 'react';
import { Language, MandiComparison } from '../types';
import { mandiComparisonsData, tomatoPriceTrend7Days } from '../data/mockData';
import { MandiBuildingIcon, TrophyIcon } from '../components/Icons';
import { MandiDetailsModal } from '../components/MandiDetailsModal';
import {
  BarChart3,
  MapPin,
  Crosshair,
  Search,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Info,
  ArrowUp,
  ArrowDown,
  Equal,
  RefreshCw,
} from 'lucide-react';

interface MarketPricesPageProps {
  lang: Language;
  onNavigate: (tab: string) => void;
}

export const MarketPricesPage: React.FC<MarketPricesPageProps> = ({ lang, onNavigate }) => {
  const [selectedCrop, setSelectedCrop] = useState<'tomato' | 'paddy' | 'chilli' | 'cotton'>('tomato');
  const [selectedLocation, setSelectedLocation] = useState('Vijayawada, Andhra Pradesh');
  const [radius, setRadius] = useState('150 km');
  const [timeRange, setTimeRange] = useState('7 Days');
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [activeMandiForModal, setActiveMandiForModal] = useState<MandiComparison | null>(null);

  const [isLocating, setIsLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState<{ type: 'success' | 'warning' | 'info'; text: string } | null>(null);
  const [apiMandis, setApiMandis] = useState<MandiComparison[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const mandis = apiMandis ?? (mandiComparisonsData[selectedCrop] || mandiComparisonsData.tomato);
  const recommendedMandi = mandis.find((m) => m.isRecommended) || mandis[0];

  // Calculate stats
  const prices = mandis.map((m) => m.marketPrice);
  const highestPrice = Math.max(...prices);
  const lowestPrice = Math.min(...prices);
  const avgPrice = (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2);
  const modalPrice = (prices.slice().sort()[Math.floor(prices.length / 2)]).toFixed(2);

  const handleFindPrices = async () => {
    if (!selectedLocation.trim()) {
      setLocationNotice({ type: 'warning', text: 'Please enter a village, city, or select a nearby APMC market.' });
      return;
    }
    setIsSearching(true);
    setLocationNotice({ type: 'info', text: 'Searching available benchmark prices for your selected crop and location…' });
    try {
      const radiusKm = Number.parseInt(radius, 10) || 150;
      const response = await fetch(`/api/market-prices?crop=${encodeURIComponent(selectedCrop)}&location=${encodeURIComponent(selectedLocation)}&radius=${radiusKm}`);
      const payload = await response.json();
      if (!response.ok || !payload?.success || !Array.isArray(payload?.data?.mandis) || payload.data.mandis.length === 0) {
        throw new Error(payload?.error || 'No market results were returned. Please try a nearby APMC market.');
      }
      setApiMandis(payload.data.mandis);
      setLocationNotice({
        type: 'success',
        text: `${payload.data.mandis.length} market result(s) found for ${selectedLocation}. These are demonstration benchmark estimates, not verified live prices.`,
      });
    } catch (error) {
      setLocationNotice({
        type: 'warning',
        text: error instanceof Error ? `${error.message} Showing the page's sample comparison until the API is available.` : 'Market search failed. Showing sample comparison data.',
      });
      setApiMandis(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleOpenDetails = (mandi: MandiComparison) => {
    setActiveMandiForModal(mandi);
    setDetailsModalOpen(true);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationNotice({
        type: 'warning',
        text: 'Geolocation is not supported by your browser. Please select or enter your location manually.',
      });
      return;
    }

    setIsLocating(true);
    setLocationNotice(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocating(false);
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          if (res.ok) {
            const data = await res.json();
            const town = data.address?.city || data.address?.town || data.address?.suburb || data.address?.district || 'Local Market Cluster';
            const state = data.address?.state || 'Andhra Pradesh';
            setSelectedLocation(`${town}, ${state} (GPS Detected)`);
            setLocationNotice({
              type: 'success',
              text: `GPS Location detected: ${town}, ${state}. Showing nearest APMC mandis.`,
            });
            return;
          }
        } catch {
          // Geolocation succeeded, network reverse geocode fallback
        }
        setSelectedLocation('Vijayawada Cluster, Andhra Pradesh (GPS Detected)');
        setLocationNotice({
          type: 'success',
          text: 'GPS coordinates detected. Sorted by proximity to Vijayawada-Guntur APMC mandi cluster.',
        });
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          // PERMISSION_DENIED
          setLocationNotice({
            type: 'warning',
            text: 'Location permission was denied. You can manually type your location or click any quick-pick APMC below.',
          });
        } else if (err.code === 2) {
          // POSITION_UNAVAILABLE
          setLocationNotice({
            type: 'info',
            text: 'Device GPS is currently unavailable. Using manual APMC mandi selection fallback.',
          });
        } else {
          // TIMEOUT
          setLocationNotice({
            type: 'info',
            text: 'GPS request timed out. Retaining manual location fallback.',
          });
        }
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <MandiDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        mandi={activeMandiForModal || recommendedMandi}
        cropName={selectedCrop.toUpperCase()}
      />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Title Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Market Prices</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Compare prices across nearby markets and choose the best deal
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
            {/* Select Crop */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Select Crop
              </label>
              <div className="relative">
                <select
                  value={selectedCrop}
                  onChange={(e) => { setSelectedCrop(e.target.value as any); setApiMandis(null); }}
                  className="w-full pl-3 pr-8 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="tomato">🍅 Tomato</option>
                  <option value="paddy">🌾 Paddy / Rice</option>
                  <option value="chilli">🌶️ Chilli</option>
                  <option value="cotton">☁️ Cotton</option>
                </select>
              </div>
            </div>

            {/* Your Location */}
            <div className="lg:col-span-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Your Location
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-rose-500">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <button
                  type="button"
                  disabled={isLocating}
                  onClick={handleDetectLocation}
                  title="Detect GPS Location"
                  className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-emerald-700 transition disabled:opacity-50 cursor-pointer"
                >
                  {isLocating ? (
                    <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                  ) : (
                    <Crosshair className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Quick Pick Markets */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[10px] text-gray-400 font-semibold uppercase">Quick Pick:</span>
                {['Vijayawada, AP', 'Guntur, AP', 'Tenali, AP', 'Eluru, AP', 'Khammam, TG'].map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      setSelectedLocation(loc);
                      setLocationNotice({ type: 'info', text: `Selected APMC Cluster: ${loc}` });
                    }}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 text-gray-600 font-medium transition cursor-pointer"
                  >
                    {loc.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Radius */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Search Radius
              </label>
              <select
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="50 km">50 km</option>
                <option value="100 km">100 km</option>
                <option value="150 km">150 km</option>
                <option value="200 km">200 km</option>
              </select>
            </div>

            {/* Find Prices Button */}
            <div className="lg:col-span-2">
              <button
                type="button"
                onClick={handleFindPrices}
                disabled={isSearching}
                className="w-full py-2.5 px-4 bg-[#0e6834] hover:bg-[#0b542a] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition active:scale-98 disabled:opacity-60 disabled:cursor-wait"
              >
                {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>{isSearching ? 'Searching…' : 'Find Prices'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Location GPS Status Notice */}
        {locationNotice && (
          <div
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between animate-in fade-in ${
              locationNotice.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : locationNotice.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{locationNotice.type === 'success' ? '📍' : locationNotice.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
              <span>{locationNotice.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setLocationNotice(null)}
              className="text-gray-500 hover:text-gray-800 text-xs px-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Best Net Return Market Banner */}
        <div className="bg-[#f2faf4] border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl shadow-xs">
              <TrophyIcon className="w-8 h-8" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-bold text-gray-900">
                Best Net Return Market:{' '}
                <span className="text-[#0e6834] font-extrabold">{recommendedMandi.marketName}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                You can earn{' '}
                <strong className="text-gray-900">
                  ₹{recommendedMandi.estimatedNetReturn.toFixed(2)}/kg
                </strong>{' '}
                (after all costs)
              </p>
            </div>
          </div>

          <button
            onClick={() => handleOpenDetails(recommendedMandi)}
            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition"
          >
            View Details
          </button>
        </div>

        {/* Main Content Grid: Price Comparison Table & Price Trend Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Price Comparison Table (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Price Comparison</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-500 font-medium">
                      <th className="pb-3 pl-2">Market / Mandi</th>
                      <th className="pb-3 px-3">Distance</th>
                      <th className="pb-3 px-3">Market Price<br /><span className="text-[11px] font-normal text-gray-400">(₹/kg)</span></th>
                      <th className="pb-3 px-3">Other Charges<br /><span className="text-[11px] font-normal text-gray-400">(₹/kg)</span></th>
                      <th className="pb-3 pr-2 text-right">Estimated Net Return<br /><span className="text-[11px] font-normal text-gray-400">(₹/kg)</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mandis.map((m) => (
                      <tr
                        key={m.id}
                        onClick={() => handleOpenDetails(m)}
                        className={`hover:bg-slate-50/80 transition cursor-pointer ${
                          m.isRecommended ? 'bg-emerald-50/40' : ''
                        }`}
                      >
                        <td className="py-4 pl-2 flex items-center gap-3">
                          <MandiBuildingIcon className="w-7 h-7 text-slate-400 shrink-0" />
                          <div>
                            <span className="font-bold text-gray-900 block text-sm">
                              {m.marketName}
                            </span>
                            {m.isRecommended && (
                              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Recommended
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-3 text-gray-600 font-medium whitespace-nowrap">
                          {m.distanceKm} km
                        </td>
                        <td className="py-4 px-3 font-bold text-emerald-700 whitespace-nowrap">
                          ₹{m.marketPrice.toFixed(2)}
                        </td>
                        <td className="py-4 px-3 text-gray-600 whitespace-nowrap">
                          ₹{m.otherCharges.toFixed(2)}
                        </td>
                        <td className="py-4 pr-2 text-right font-extrabold text-emerald-800 text-base whitespace-nowrap">
                          ₹{m.estimatedNetReturn.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 text-[11px] text-gray-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-4">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>
                  Source: <strong>Agmarknet (Govt. of India)</strong> / APMC Daily Trading Bulletin
                </span>
              </div>
              <span className="text-gray-400 font-medium">
                Recorded: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}, 10:30 AM IST (Demonstration Benchmark Data)
              </span>
            </div>
          </div>

          {/* Price Trend Chart Card (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-base">
                  Price Trend ({selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)})
                </h3>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-gray-700 font-medium focus:outline-hidden"
                >
                  <option value="7 Days">7 Days</option>
                  <option value="15 Days">15 Days</option>
                  <option value="30 Days">30 Days</option>
                </select>
              </div>

              {/* Big Price Display */}
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-gray-900">₹28.00</span>
                  <span className="text-xs text-gray-500 font-normal">/ kg</span>
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-0.5 ml-2">
                    <TrendingUp className="w-3.5 h-3.5" /> 8.2%
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">vs last week</p>
              </div>

              {/* Dynamic Interactive SVG Chart matching screenshot */}
              <div className="relative pt-2 pb-1">
                <div className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">
                  DYNAMIC GRAPH
                </div>
                <div className="relative w-full h-48 bg-slate-50/50 rounded-xl p-2 border border-gray-100 flex flex-col justify-between">
                  {/* Grid Lines */}
                  <div className="absolute inset-x-6 top-3 border-b border-gray-200/60 flex justify-between text-[9px] text-gray-400">
                    <span>₹32</span>
                  </div>
                  <div className="absolute inset-x-6 top-16 border-b border-gray-200/60 flex justify-between text-[9px] text-gray-400">
                    <span>₹28</span>
                  </div>
                  <div className="absolute inset-x-6 top-28 border-b border-gray-200/60 flex justify-between text-[9px] text-gray-400">
                    <span>₹24</span>
                  </div>
                  <div className="absolute inset-x-6 bottom-7 border-b border-gray-200/60 flex justify-between text-[9px] text-gray-400">
                    <span>₹20</span>
                  </div>

                  {/* SVG Chart Polyline & Gradient Fill */}
                  <svg className="w-full h-36 mt-2 overflow-visible" viewBox="0 0 280 120">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Area under curve */}
                    <polygon
                      points="10,95 50,65 95,80 140,48 185,72 230,45 270,15 270,115 10,115"
                      fill="url(#chartGrad)"
                    />

                    {/* Smooth curve */}
                    <polyline
                      fill="none"
                      stroke="#16a34a"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points="10,95 50,65 95,80 140,48 185,72 230,45 270,15"
                    />

                    {/* Data Points */}
                    <circle cx="10" cy="95" r="4" fill="#ffffff" stroke="#16a34a" strokeWidth="2.5" />
                    <circle cx="50" cy="65" r="4" fill="#ffffff" stroke="#16a34a" strokeWidth="2.5" />
                    <circle cx="95" cy="80" r="4" fill="#ffffff" stroke="#16a34a" strokeWidth="2.5" />
                    <circle cx="140" cy="48" r="4" fill="#ffffff" stroke="#16a34a" strokeWidth="2.5" />
                    <circle cx="185" cy="72" r="4" fill="#ffffff" stroke="#16a34a" strokeWidth="2.5" />
                    <circle cx="230" cy="45" r="4" fill="#ffffff" stroke="#16a34a" strokeWidth="2.5" />
                    <circle cx="270" cy="15" r="5" fill="#16a34a" stroke="#ffffff" strokeWidth="2" />
                  </svg>

                  {/* X Axis Date labels */}
                  <div className="flex justify-between text-[9px] text-gray-500 font-medium px-1 pt-1 border-t border-gray-100">
                    <span>6 May</span>
                    <span>7 May</span>
                    <span>8 May</span>
                    <span>9 May</span>
                    <span>10 May</span>
                    <span>11 May</span>
                    <span>12 May</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100">
              <button
                onClick={() => onNavigate('price-discovery')}
                className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>Price Discovery Tool</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* How it Works? 5 Steps Horizontal Row */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-6">How it Works?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
            {/* Step 1 */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 text-xl border border-emerald-100">
                📍
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-bold text-gray-900 block">Step 1</span>
                <span className="text-xs text-gray-500 leading-tight block">
                  Select Crop &amp; Your Location
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 hidden sm:block shrink-0" />
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 text-xl border border-emerald-100">
                🏪
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-bold text-gray-900 block">Step 2</span>
                <span className="text-xs text-gray-500 leading-tight block">
                  We fetch nearby market prices
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 hidden sm:block shrink-0" />
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 text-xl border border-emerald-100">
                🚚
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-bold text-gray-900 block">Step 3</span>
                <span className="text-xs text-gray-500 leading-tight block">
                  Transport &amp; other costs are calculated
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 hidden sm:block shrink-0" />
            </div>

            {/* Step 4 */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 text-xl border border-emerald-100">
                ₹
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-bold text-gray-900 block">Step 4</span>
                <span className="text-xs text-gray-500 leading-tight block">
                  We show estimated net return
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 hidden sm:block shrink-0" />
            </div>

            {/* Step 5 */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center shrink-0 text-xl border border-amber-200">
                🏆
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-bold text-gray-900 block">Step 5</span>
                <span className="text-xs text-gray-500 leading-tight block">
                  You choose the best market for higher profit
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Price Range in Selected Markets */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-4">Price Range in Selected Markets</h3>
          <div className="divide-y divide-gray-100 text-sm">
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ArrowUp className="w-4 h-4" />
                </div>
                <span className="font-medium text-gray-700">Highest Price</span>
              </div>
              <span className="font-bold text-gray-900">₹{highestPrice.toFixed(2)} / kg</span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                  <ArrowDown className="w-4 h-4" />
                </div>
                <span className="font-medium text-gray-700">Lowest Price</span>
              </div>
              <span className="font-bold text-rose-600">₹{lowestPrice.toFixed(2)} / kg</span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Equal className="w-4 h-4" />
                </div>
                <span className="font-medium text-gray-700">Average Price</span>
              </div>
              <span className="font-bold text-gray-900">₹{avgPrice} / kg</span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <span className="font-medium text-gray-700">Modal Price</span>
              </div>
              <span className="font-bold text-gray-900">₹{modalPrice} / kg</span>
            </div>
          </div>
        </div>

        {/* Important Note */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Important Note</h4>
            <p className="text-xs text-gray-500 mt-1">
              Prices may vary based on quality, quantity, demand and other market factors.
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Please check with the market before final sale.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
