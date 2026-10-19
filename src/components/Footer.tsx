import React, { useState } from 'react';
import { AgriConnectLogo } from './Icons';
import { Language } from '../types';
import { translations } from '../data/translations';
import { Phone, Mail, Clock, X, ShieldCheck } from 'lucide-react';

interface FooterProps {
  lang: Language;
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, onNavigate }) => {
  const [contactOpen, setContactOpen] = useState(false);
  const t = translations[lang].footer;

  return (
    <footer className="bg-[#0e5828] text-white py-12 px-4 sm:px-6 lg:px-8 border-t border-emerald-900/50 relative">
      {/* Contact Helpline Modal */}
      {contactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white text-gray-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">AgriConnect Helpline</h4>
                  <p className="text-xs text-gray-500">24x7 Farmer &amp; Buyer Support</p>
                </div>
              </div>
              <button
                onClick={() => setContactOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-950 block">Toll-Free National Helpline:</span>
                  <a href="tel:18001232474" className="text-sm font-extrabold text-emerald-700 hover:underline">
                    1800-123-AGRI (24x7)
                  </a>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-600 shrink-0" />
                <div>
                  <span className="font-bold text-gray-800 block">Helpdesk Email:</span>
                  <span className="text-gray-600 font-medium">helpdesk@agriconnect.org.in</span>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-600 shrink-0" />
                <div>
                  <span className="font-bold text-gray-800 block">APMC Live Mandi Hours:</span>
                  <span className="text-gray-600">Mon – Sat: 6:00 AM – 8:00 PM IST</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setContactOpen(false)}
              className="w-full py-2.5 bg-[#0e6834] hover:bg-[#0b542a] text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-white/10 rounded-xl">
            <AgriConnectLogo className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-xl font-bold tracking-tight text-white">AgriLink</h4>
            <p className="text-xs text-emerald-200/90 font-medium">{t.tagline}</p>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm font-medium text-emerald-100">
          <button
            onClick={() => onNavigate('market-prices')}
            className="hover:text-white transition cursor-pointer"
          >
            Market Prices
          </button>
          <button
            onClick={() => onNavigate('price-discovery')}
            className="hover:text-white transition cursor-pointer"
          >
            Price Discovery
          </button>
          <button
            onClick={() => onNavigate('buyer-dashboard')}
            className="hover:text-white transition cursor-pointer"
          >
            Buyers
          </button>
          <button
            onClick={() => setContactOpen(true)}
            className="hover:text-white transition cursor-pointer"
          >
            Contact
          </button>
        </div>

        {/* Copyright */}
        <div className="text-xs text-emerald-300/80 font-normal">
          {t.rights}
        </div>
      </div>
    </footer>
  );
};
