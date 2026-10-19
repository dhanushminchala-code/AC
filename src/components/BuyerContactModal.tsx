import React, { useState } from 'react';
import { X, Phone, MessageSquare, ShieldCheck, Star, Send, Check } from 'lucide-react';
import { RecommendedBuyer } from '../types';

interface BuyerContactModalProps {
  buyer: RecommendedBuyer | null;
  onClose: () => void;
}

export const BuyerContactModal: React.FC<BuyerContactModalProps> = ({ buyer, onClose }) => {
  const [offerSent, setOfferSent] = useState(false);
  const [farmerOfferPrice, setFarmerOfferPrice] = useState('2350');
  const [farmerOfferQty, setFarmerOfferQty] = useState('100');
  const [note, setNote] = useState('');

  if (!buyer) return null;

  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    setOfferSent(true);
    setTimeout(() => {
      setOfferSent(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 bg-emerald-800 text-white flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-[11px] font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> APMC Verified Buyer
            </div>
            <h3 className="text-xl font-bold">{buyer.companyName}</h3>
            <p className="text-xs text-emerald-200 mt-0.5">{buyer.businessType} • {buyer.location}</p>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-700/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 mb-5 text-xs">
            <div>
              <span className="text-gray-500">Procuring Crop:</span>
              <div className="font-bold text-gray-800 text-sm">{buyer.requiredCrop}</div>
            </div>
            <div>
              <span className="text-gray-500">Buying Target:</span>
              <div className="font-bold text-gray-800 text-sm">{buyer.quantity}</div>
            </div>
            <div>
              <span className="text-gray-500">Current Mandi Quote:</span>
              <div className="font-bold text-emerald-700 text-sm">{buyer.offeredPrice}</div>
            </div>
            <div>
              <span className="text-gray-500">Buyer Rating:</span>
              <div className="font-bold text-amber-600 flex items-center gap-1 text-sm">
                <Star className="w-3.5 h-3.5 fill-amber-500" /> {buyer.rating} / 5.0
              </div>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <a
              href={`tel:${buyer.phone}`}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs flex items-center justify-center gap-2 transition"
            >
              <Phone className="w-4 h-4 text-emerald-700" /> Call {buyer.phone}
            </a>
            <a
              href={`https://wa.me/${buyer.whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                buyer.companyName
              )},%20I%20am%20a%20farmer%20interested%20in%20supplying%20produce%20via%20AgriConnect`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold text-xs flex items-center justify-center gap-2 transition"
            >
              <MessageSquare className="w-4 h-4 text-emerald-700" /> WhatsApp
            </a>
          </div>

          {offerSent ? (
            <div className="p-4 bg-emerald-50 rounded-xl text-center border border-emerald-200 text-emerald-800 animate-in fade-in">
              <Check className="w-8 h-8 mx-auto text-emerald-600 mb-1" />
              <p className="font-bold text-sm">Quotation Sent Successfully!</p>
              <p className="text-xs text-emerald-600 mt-1">
                The buyer has received your produce offer and will call you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendOffer} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Direct Deal Offer
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Your Price (₹ / Quintal)
                  </label>
                  <input
                    type="number"
                    value={farmerOfferPrice}
                    onChange={(e) => setFarmerOfferPrice(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Quantity You Have (Quintals)
                  </label>
                  <input
                    type="number"
                    value={farmerOfferQty}
                    onChange={(e) => setFarmerOfferQty(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Message / Pickup Terms
                </label>
                <input
                  type="text"
                  placeholder="e.g. Produce harvested today. Pickup ready at Tenali."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-98"
              >
                <Send className="w-3.5 h-3.5" /> Send Direct Quotation
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
