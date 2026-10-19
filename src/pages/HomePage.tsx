import React, { useState } from 'react';
import { Language, Role } from '../types';
import { translations } from '../data/translations';
import { marketHighlights } from '../data/mockData';
import { TomatoIcon, RiceIcon, CottonIcon, PotatoIcon, AvatarGroup } from '../components/Icons';
import { CropAssuranceModal } from '../components/CropAssuranceModal';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  IndianRupee,
  Handshake,
  Bell,
  MapPin,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface HomePageProps {
  lang: Language;
  onNavigate: (tab: string) => void;
  role: Role;
  setRole: (role: Role) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ lang, onNavigate, role, setRole }) => {
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [homeToast, setHomeToast] = useState<{ title: string; message: string } | null>(null);
  const t = translations[lang];

  const triggerToast = (title: string, message: string) => {
    setHomeToast({ title, message });
    setTimeout(() => setHomeToast(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col relative">
      {/* Toast Notification */}
      {homeToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-emerald-950 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-start gap-3 animate-in slide-in-from-bottom duration-300">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h5 className="text-xs font-bold text-white">{homeToast.title}</h5>
            <p className="text-[11px] text-emerald-200/90 mt-0.5 leading-snug">{homeToast.message}</p>
          </div>
          <button onClick={() => setHomeToast(null)} className="text-emerald-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Crop Assurance Modal */}
      <CropAssuranceModal
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        onGradeConfirmed={(grade, bonus) => {
          triggerToast(
            'Produce Verified Successfully!',
            `Graded as ${grade}! A price bonus of +₹${bonus.toFixed(2)}/kg is now attached to your produce listings.`
          );
        }}
      />

      {/* Hero Section with wheat field sunlit backdrop */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eaf6ec] via-[#f5faf5] to-[#f8faf8] border-b border-emerald-100/60 pt-10 pb-16 lg:pt-16 lg:pb-24">
        {/* Organic Wheat Field Background Art */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35">
          {/* Sun Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-amber-200/50 via-yellow-100/30 to-transparent blur-3xl" />

          {/* Golden & Green Sun Rays */}
          <svg className="w-full h-full object-cover" viewBox="0 0 1440 600" fill="none" preserveAspectRatio="none">
            <path
              d="M0 600C120 420 300 350 480 430C660 510 840 400 1020 460C1200 520 1350 430 1440 380V600H0Z"
              fill="#dcfce7"
              fillOpacity="0.5"
            />
            {/* Silhouetted stalks */}
            <path d="M120 600L140 390M140 390L135 340M140 390L155 350" stroke="#86efac" strokeWidth="2" strokeLinecap="round" />
            <path d="M280 600L310 360M310 360L300 310M310 360L325 320" stroke="#86efac" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M500 600L490 320M490 320L475 270M490 320L505 280" stroke="#fde047" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M720 600L750 300M750 300L740 250M750 300L765 260" stroke="#fde047" strokeWidth="3" strokeLinecap="round" />
            <path d="M960 600L940 340M940 340L925 290M940 340L955 300" stroke="#86efac" strokeWidth="2" strokeLinecap="round" />
            <path d="M1180 600L1210 330M1210 330L1200 280M1210 330L1225 290" stroke="#fde047" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M1360 600L1350 370M1350 370L1335 320M1350 370L1365 330" stroke="#86efac" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading, Subtitle & CTAs */}
            <div className="lg:col-span-7 space-y-7">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-emerald-950 tracking-tight leading-[1.15]">
                {t.hero.title}
              </h1>

              <p className="text-base sm:text-lg text-emerald-900/80 max-w-2xl font-normal leading-relaxed">
                {t.hero.subtitle}
              </p>

              {/* Action Buttons */}
              <div className="space-y-4 pt-1">
                {/* Crop Assurance Pill */}
                <div>
                  <button
                    onClick={() => setCropModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-800 text-sm font-semibold shadow-xs hover:border-emerald-500 hover:text-emerald-800 transition group"
                  >
                    <span className="text-base">📷</span>
                    <span>{t.hero.cropAssurance}</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 opacity-80 group-hover:rotate-12 transition-transform" />
                  </button>
                </div>

                {/* Primary Dual CTA buttons */}
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => onNavigate('market-prices')}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#0f6735] hover:bg-[#0c532b] text-white text-sm font-bold shadow-md hover:shadow-lg transition active:scale-98"
                  >
                    <span>📊</span>
                    <span>{t.hero.checkMarketPrices}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (role === 'guest') {
                        setRole('farmer');
                        onNavigate('sell-crop');
                      } else {
                        onNavigate('sell-crop');
                      }
                    }}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-800 hover:border-emerald-600 hover:text-emerald-800 text-sm font-bold shadow-xs hover:shadow-md transition active:scale-98"
                  >
                    <span>🌱</span>
                    <span>{t.hero.sellYourCrop}</span>
                  </button>
                </div>
              </div>

              {/* Avatars & Social proof */}
              <div className="flex items-center gap-3 pt-3">
                <AvatarGroup />
                <span className="text-xs sm:text-sm font-medium text-emerald-900/90">
                  {t.hero.taglineBadge}
                </span>
              </div>
            </div>

            {/* Right Column: Floating "Best Price Near You" card */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-emerald-100/80 transition hover:shadow-2xl hover:-translate-y-1 duration-300">
                <div className="pb-3 border-b border-gray-100">
                  <h3 className="text-base font-bold text-gray-900">{t.hero.bestPriceNearYou}</h3>
                  <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {t.hero.location}
                  </p>
                </div>

                <div className="py-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-rose-50 rounded-2xl">
                      <TomatoIcon className="w-12 h-12" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">{t.hero.crop}</span>
                      <div className="text-3xl font-black text-emerald-800 tracking-tight">
                        {t.hero.cropPrice}
                        <span className="text-sm font-normal text-gray-500"> {t.hero.unit}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t.hero.market}</p>
                    <p className="text-xs text-gray-500">{t.hero.distance}</p>
                  </div>
                  <button
                    onClick={() => onNavigate('market-prices')}
                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-1"
                  >
                    {t.hero.viewMarket}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Quick Feature Cards Row */}
      <section className="relative -mt-6 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          {/* Feature 1 */}
          <div
            onClick={() => onNavigate('market-prices')}
            className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <BarChart3 className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">{t.quickFeatures.livePrices}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{t.quickFeatures.livePricesDesc}</p>
            </div>
          </div>

          {/* Feature 2 */}
          <div
            onClick={() => onNavigate('price-discovery')}
            className="flex items-center gap-4 pt-4 sm:pt-0 sm:pl-6 cursor-pointer hover:opacity-80 transition group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <span className="text-xl font-bold text-emerald-700">₹</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">{t.quickFeatures.priceDiscovery}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{t.quickFeatures.priceDiscoveryDesc}</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div
            onClick={() => {
              if (role === 'guest') {
                setRole('farmer');
              }
              onNavigate('sell-crop');
            }}
            className="flex items-center gap-4 pt-4 sm:pt-0 sm:pl-6 cursor-pointer hover:opacity-80 transition group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <span className="text-2xl">🤝</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">{t.quickFeatures.connectBuyers}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{t.quickFeatures.connectBuyersDesc}</p>
            </div>
          </div>

          {/* Feature 4 */}
          <div
            onClick={() => {
              triggerToast('Price Alerts Enabled! 🔔', 'You will receive notifications when nearby APMC mandi prices cross your threshold.');
            }}
            className="flex items-center gap-4 pt-4 sm:pt-0 sm:pl-6 cursor-pointer hover:opacity-80 transition group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <span className="text-2xl">🔔</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">{t.quickFeatures.priceAlerts}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{t.quickFeatures.priceAlertsDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Today's Market Highlights */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            {t.highlights.title}
          </h2>
          <button
            onClick={() => onNavigate('market-prices')}
            className="text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 transition"
          >
            {t.highlights.viewAll}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {marketHighlights.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate('market-prices')}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="shrink-0 group-hover:scale-110 transition-transform">
                  {item.cropKey === 'tomato' && <TomatoIcon className="w-12 h-12" />}
                  {item.cropKey === 'rice' && <RiceIcon className="w-12 h-12" />}
                  {item.cropKey === 'cotton' && <CottonIcon className="w-12 h-12" />}
                  {item.cropKey === 'potato' && <PotatoIcon className="w-12 h-12" />}
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    {lang === 'te' ? item.cropNameTe : item.cropName}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-extrabold text-gray-900">
                      ₹{item.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">{item.unit}</span>
                    <span
                      className={`inline-flex items-center text-xs font-bold ${
                        item.isPositive ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {item.isPositive ? (
                        <TrendingUp className="w-3 h-3 mr-0.5 inline" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-0.5 inline" />
                      )}
                      {item.changePercent}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {lang === 'te' ? item.marketNameTe : item.marketName}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY AGRILINK? Helping Farmers Make Better Decisions */}
      <section className="bg-[#f2faf3] py-20 border-t border-emerald-100/60 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-2">
            {t.whyAgriLink.preTitle}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 mb-3">
            {t.whyAgriLink.title}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mb-12">
            {t.whyAgriLink.subtitle}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {/* Card 1 */}
            <div className="bg-white rounded-3xl p-8 border border-emerald-100/80 shadow-xs hover:shadow-lg transition">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center text-2xl mb-5">
                📍
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t.whyAgriLink.card1Title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                {t.whyAgriLink.card1Desc}
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-3xl p-8 border border-emerald-100/80 shadow-xs hover:shadow-lg transition">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 mx-auto flex items-center justify-center text-2xl mb-5">
                💰
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t.whyAgriLink.card2Title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                {t.whyAgriLink.card2Desc}
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-3xl p-8 border border-emerald-100/80 shadow-xs hover:shadow-lg transition">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 mx-auto flex items-center justify-center text-2xl mb-5">
                🤝
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t.whyAgriLink.card3Title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                {t.whyAgriLink.card3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
