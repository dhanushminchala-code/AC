import React, { useState } from 'react';
import { Role, Language, UserProfile } from '../types';
import { AgriConnectLogo } from './Icons';
import { Bell, ChevronDown, User, LogOut, RefreshCw } from 'lucide-react';
import { translations } from '../data/translations';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  role: Role;
  setRole: (role: Role) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  unreadCount?: number;
  onOpenNotifications?: () => void;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  role,
  setRole,
  lang,
  setLang,
  unreadCount = 3,
  onOpenNotifications,
  currentUser,
  onLogout,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const t = translations[lang].nav;

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'te' : 'en');
  };

  const isPublicPage = role === 'guest';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => onNavigate('home')}
          >
            <AgriConnectLogo className="w-10 h-10 shrink-0" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight text-emerald-900 leading-tight">
                {t.brand}
              </span>
              <span className="text-[10px] sm:text-xs font-medium text-emerald-700/80 tracking-wide uppercase">
                {t.tagline}
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {isPublicPage ? (
              <>
                <button
                  onClick={() => onNavigate('home')}
                  className={`relative py-2 text-sm font-semibold transition-colors ${
                    currentTab === 'home'
                      ? 'text-emerald-800'
                      : 'text-gray-600 hover:text-emerald-700'
                  }`}
                >
                  {t.home}
                  {currentTab === 'home' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-700 rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => onNavigate('market-prices')}
                  className={`relative py-2 text-sm font-semibold transition-colors ${
                    currentTab === 'market-prices'
                      ? 'text-emerald-800'
                      : 'text-gray-600 hover:text-emerald-700'
                  }`}
                >
                  {t.marketPrices}
                  {currentTab === 'market-prices' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-700 rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => onNavigate('price-discovery')}
                  className={`relative py-2 text-sm font-semibold transition-colors ${
                    currentTab === 'price-discovery'
                      ? 'text-emerald-800'
                      : 'text-gray-600 hover:text-emerald-700'
                  }`}
                >
                  {t.priceDiscovery}
                  {currentTab === 'price-discovery' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-700 rounded-full" />
                  )}
                </button>
              </>
            ) : role === 'farmer' ? (
              <>
                <button
                  onClick={() => onNavigate('farmer-dashboard')}
                  className={`relative py-2 text-sm font-semibold transition-colors ${
                    currentTab === 'farmer-dashboard'
                      ? 'text-emerald-800'
                      : 'text-gray-600 hover:text-emerald-700'
                  }`}
                >
                  {t.dashboard}
                  {currentTab === 'farmer-dashboard' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-700 rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => onNavigate('sell-crop')}
                  className={`relative py-2 text-sm font-semibold transition-colors ${
                    currentTab === 'sell-crop'
                      ? 'text-emerald-800'
                      : 'text-gray-600 hover:text-emerald-700'
                  }`}
                >
                  {t.sellCrop}
                  {currentTab === 'sell-crop' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-700 rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => onNavigate('market-prices')}
                  className={`relative py-2 text-sm font-semibold transition-colors ${
                    currentTab === 'market-prices'
                      ? 'text-emerald-800'
                      : 'text-gray-600 hover:text-emerald-700'
                  }`}
                >
                  {t.marketPrices}
                </button>
                <button
                  onClick={() => onNavigate('price-discovery')}
                  className={`relative py-2 text-sm font-semibold transition-colors ${
                    currentTab === 'price-discovery'
                      ? 'text-emerald-800'
                      : 'text-gray-600 hover:text-emerald-700'
                  }`}
                >
                  {t.priceDiscovery}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('buyer-dashboard')}
                  className={`relative py-2 text-sm font-semibold transition-colors ${
                    currentTab === 'buyer-dashboard'
                      ? 'text-emerald-800'
                      : 'text-gray-600 hover:text-emerald-700'
                  }`}
                >
                  {t.buyers}
                  {currentTab === 'buyer-dashboard' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-700 rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => onNavigate('market-prices')}
                  className={`relative py-2 text-sm font-semibold transition-colors ${
                    currentTab === 'market-prices'
                      ? 'text-emerald-800'
                      : 'text-gray-600 hover:text-emerald-700'
                  }`}
                >
                  {t.marketPrices}
                </button>
                <button
                  onClick={() => onNavigate('price-discovery')}
                  className={`relative py-2 text-sm font-semibold transition-colors ${
                    currentTab === 'price-discovery'
                      ? 'text-emerald-800'
                      : 'text-gray-600 hover:text-emerald-700'
                  }`}
                >
                  {t.priceDiscovery}
                </button>
              </>
            )}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              title="Change Language"
              className="px-3.5 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              {lang === 'en' ? 'తెలుగు' : 'English'}
            </button>

            {isPublicPage ? (
              <>
                <button
                  onClick={() => onNavigate('login')}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  {t.login}
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-medium transition shadow-xs"
                >
                  {t.register}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                {/* Notification Bell with Badge */}
                <button
                  onClick={onOpenNotifications}
                  className="relative p-2 rounded-full text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Profile Avatar & Role Menu */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full hover:bg-gray-100 transition border border-gray-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs ring-1 ring-emerald-300">
                      {role === 'farmer' ? '🌾' : '🏢'}
                    </div>
                    <div className="hidden sm:flex flex-col text-left pr-1">
                      <span className="text-xs font-bold text-gray-800 leading-tight">
                        {currentUser?.name ? currentUser.name.split(' ')[0] : role === 'farmer' ? 'Farmer' : 'Buyer'}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {role === 'farmer' ? 'Farmer Account' : 'Buyer Account'}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 text-xs">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <p className="font-semibold text-gray-800">
                          {currentUser?.name || (role === 'farmer' ? 'Farmer Account' : 'Buyer Account')}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {currentUser?.mobile ? `+91 ${currentUser.mobile}` : 'Mobile Verified'} • {currentUser?.apmc || 'Vijayawada APMC'}
                        </p>
                        <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                          <span>✓ Mobile Verified</span>
                        </div>
                      </div>

                      <div className="py-1">
                        <p className="px-3 py-1 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                          Switch Role
                        </p>
                        <button
                          onClick={() => {
                            setRole('farmer');
                            onNavigate('farmer-dashboard');
                            setProfileDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-emerald-50 ${
                            role === 'farmer' ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-gray-700'
                          }`}
                        >
                          <span>🌾</span> Farmer Mode
                        </button>
                        <button
                          onClick={() => {
                            setRole('buyer');
                            onNavigate('buyer-dashboard');
                            setProfileDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-emerald-50 ${
                            role === 'buyer' ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-gray-700'
                          }`}
                        >
                          <span>🏢</span> Buyer Mode
                        </button>
                      </div>

                      <div className="border-t border-gray-100 py-1">
                        <button
                          onClick={() => {
                            if (onLogout) onLogout();
                            setRole('guest');
                            onNavigate('home');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left flex items-center gap-2 text-rose-600 hover:bg-rose-50"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
