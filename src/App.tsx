import React, { useState, useEffect } from 'react';
import { Role, Language, UserProfile, FarmerCropItem } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { MarketPricesPage } from './pages/MarketPricesPage';
import { PriceDiscoveryPage } from './pages/PriceDiscoveryPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { FarmerDashboardPage } from './pages/FarmerDashboardPage';
import { SellCropPage } from './pages/SellCropPage';
import { BuyerDashboardPage } from './pages/BuyerDashboardPage';
import { NotificationModal } from './components/NotificationModal';
import { AgriAIWidget } from './components/AgriAIWidget';
import { initialFarmerCrops, recentActivities } from './data/mockData';
import { CheckCircle2, X } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [role, setRole] = useState<Role>('guest');
  const [lang, setLang] = useState<Language>('en');
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(3);
  const [successToast, setSuccessToast] = useState<{ message: string; subtext: string } | null>(null);

  // User Profile state with localStorage persistence
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('agriconnect_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.name && parsed.name.toLowerCase().includes('sarayu')) {
          localStorage.removeItem('agriconnect_user');
          return null;
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Farmer listed crops with localStorage persistence
  const [farmerCrops, setFarmerCrops] = useState<FarmerCropItem[]>(() => {
    try {
      const saved = localStorage.getItem('agriconnect_crops');
      return saved ? JSON.parse(saved) : initialFarmerCrops;
    } catch {
      return initialFarmerCrops;
    }
  });

  // Purge any stale mock Sarayu from local storage on load
  useEffect(() => {
    try {
      const reg = localStorage.getItem('agriconnect_registered_user');
      if (reg && reg.toLowerCase().includes('sarayu')) {
        localStorage.removeItem('agriconnect_registered_user');
      }
      const allUsersStr = localStorage.getItem('agriconnect_registered_users_list');
      if (allUsersStr && allUsersStr.toLowerCase().includes('sarayu')) {
        const list = JSON.parse(allUsersStr);
        const filtered = Array.isArray(list) ? list.filter((u: any) => !u.name?.toLowerCase().includes('sarayu')) : [];
        localStorage.setItem('agriconnect_registered_users_list', JSON.stringify(filtered));
      }
    } catch {}
  }, []);

  // Sync role if user already logged in
  useEffect(() => {
    if (currentUser?.isLoggedIn && currentUser.role) {
      setRole(currentUser.role);
    }
  }, []);

  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (loggedInRole: Role, profile?: UserProfile) => {
    const finalProfile: UserProfile = profile || {
      name: loggedInRole === 'buyer' ? 'Buyer Account' : 'Farmer Account',
      mobile: '',
      email: '',
      role: loggedInRole,
      apmc: loggedInRole === 'buyer' ? 'Vijayawada APMC' : 'Tenali APMC',
      state: 'Andhra Pradesh',
      isLoggedIn: true,
    };

    setCurrentUser(finalProfile);
    setRole(loggedInRole);
    try {
      localStorage.setItem('agriconnect_user', JSON.stringify(finalProfile));
    } catch {
      // ignore
    }

    setSuccessToast({
      message: 'Mobile OTP Verified & Login Successful!',
      subtext: `Welcome back, ${finalProfile.name.split(' ')[0]} (${loggedInRole === 'farmer' ? 'Farmer Account' : 'Buyer Account'}).`,
    });
    setTimeout(() => setSuccessToast(null), 4000);

    if (loggedInRole === 'farmer') {
      setCurrentTab('farmer-dashboard');
    } else if (loggedInRole === 'buyer') {
      setCurrentTab('buyer-dashboard');
    } else {
      setCurrentTab('home');
    }
  };

  const handleRegisterSuccess = (profile: UserProfile) => {
    setCurrentUser(profile);
    setRole(profile.role);
    try {
      localStorage.setItem('agriconnect_user', JSON.stringify(profile));
    } catch {
      // ignore
    }

    setSuccessToast({
      message: 'Mobile Verified & Registration Complete!',
      subtext: `Your APMC registration for ${profile.name} has been verified and activated.`,
    });
    setTimeout(() => setSuccessToast(null), 4000);

    if (profile.role === 'farmer') {
      setCurrentTab('farmer-dashboard');
    } else if (profile.role === 'buyer') {
      setCurrentTab('buyer-dashboard');
    } else {
      setCurrentTab('home');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setRole('guest');
    try {
      localStorage.removeItem('agriconnect_user');
    } catch {
      // ignore
    }
    setSuccessToast({
      message: 'Signed out successfully',
      subtext: 'You have been returned to public mode.',
    });
    setTimeout(() => setSuccessToast(null), 3000);
    setCurrentTab('home');
  };

  const handleAddFarmerCrop = (newCrop: FarmerCropItem) => {
    const updated = [newCrop, ...farmerCrops];
    setFarmerCrops(updated);
    try {
      localStorage.setItem('agriconnect_crops', JSON.stringify(updated));
    } catch {
      // ignore
    }
    setSuccessToast({
      message: `${newCrop.name} added to your crops!`,
      subtext: `${newCrop.quantity} listed at ${newCrop.price} in your dashboard.`,
    });
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleOpenNotifications = () => {
    setNotificationsOpen(true);
    setUnreadCount(0);
  };

  return (
    <div
      lang={lang}
      className={`min-h-screen flex flex-col bg-white text-slate-800 ${
        lang === 'te' ? 'telugu-font' : ''
      }`}
    >
      {/* Global Success Notification Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-emerald-950 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-start gap-3 animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h5 className="text-xs font-bold text-white">{successToast.message}</h5>
            <p className="text-[11px] text-emerald-200/90 mt-0.5 leading-snug">
              {successToast.subtext}
            </p>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        role={role}
        setRole={setRole}
        lang={lang}
        setLang={setLang}
        unreadCount={unreadCount}
        onOpenNotifications={handleOpenNotifications}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Notifications Modal */}
      <NotificationModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        activities={recentActivities}
      />

      {/* Role Indicator Banner for quick testing */}
      <div className="bg-emerald-900 text-emerald-200 text-xs py-1.5 px-4 flex items-center justify-between border-b border-emerald-800/80">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Current Mode:</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-100 font-bold uppercase tracking-wider text-[10px]">
              {role === 'guest'
                ? 'Public / Guest'
                : role === 'farmer'
                ? `Farmer (${currentUser?.name ? currentUser.name : 'Farmer'})`
                : `Buyer (${currentUser?.name ? currentUser.name : 'Buyer'})`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-emerald-300/80">Quick view:</span>
            <button
              onClick={() => {
                setRole('guest');
                setCurrentTab('home');
              }}
              className={`hover:text-white transition ${role === 'guest' ? 'text-white underline font-bold' : ''}`}
            >
              Public Home
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setRole('farmer');
                setCurrentTab('farmer-dashboard');
              }}
              className={`hover:text-white transition ${role === 'farmer' && currentTab === 'farmer-dashboard' ? 'text-white underline font-bold' : ''}`}
            >
              Farmer Dashboard
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setRole('farmer');
                setCurrentTab('sell-crop');
              }}
              className={`hover:text-white transition ${currentTab === 'sell-crop' ? 'text-white underline font-bold' : ''}`}
            >
              Sell Crop
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setRole('buyer');
                setCurrentTab('buyer-dashboard');
              }}
              className={`hover:text-white transition ${role === 'buyer' ? 'text-white underline font-bold' : ''}`}
            >
              Buyer Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Pages */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            lang={lang}
            onNavigate={handleNavigate}
            role={role}
            setRole={setRole}
          />
        )}

        {currentTab === 'market-prices' && (
          <MarketPricesPage
            lang={lang}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'price-discovery' && (
          <PriceDiscoveryPage
            lang={lang}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'login' && (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onNavigateToRegister={() => setCurrentTab('register')}
          />
        )}

        {currentTab === 'register' && (
          <RegisterPage
            onRegisterSuccess={handleRegisterSuccess}
            onNavigateToLogin={() => setCurrentTab('login')}
          />
        )}

        {currentTab === 'farmer-dashboard' && (
          <FarmerDashboardPage
            lang={lang}
            onNavigate={handleNavigate}
            currentUser={currentUser}
            crops={farmerCrops}
            onAddCrop={handleAddFarmerCrop}
          />
        )}

        {currentTab === 'sell-crop' && (
          <SellCropPage
            lang={lang}
            onCropListed={handleAddFarmerCrop}
          />
        )}

        {currentTab === 'buyer-dashboard' && (
          <BuyerDashboardPage
            lang={lang}
          />
        )}
      </main>

      {/* Floating multilingual farming assistant available throughout the app */}
      <AgriAIWidget lang={lang} currentUser={currentUser} crops={farmerCrops} />

      {/* AgriLink Footer */}
      <Footer lang={lang} onNavigate={handleNavigate} />
    </div>
  );
}
