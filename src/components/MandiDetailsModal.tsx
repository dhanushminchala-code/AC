import React from 'react';
import { X, Trophy, Check, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { MandiComparison } from '../types';

interface MandiDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mandi: MandiComparison | null;
  cropName: string;
}

export const MandiDetailsModal: React.FC<MandiDetailsModalProps> = ({
  isOpen,
  onClose,
  mandi,
  cropName,
}) => {
  if (!isOpen || !mandi) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 bg-gradient-to-r from-emerald-800 to-green-700 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <Trophy className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-yellow-200 uppercase tracking-wider">
                Recommended Mandi
              </div>
              <h3 className="text-xl font-bold">{mandi.marketName}</h3>
              <p className="text-xs text-emerald-100 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" /> {mandi.distanceKm} km from Vijayawada, AP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100 mb-5">
            <div>
              <p className="text-xs text-gray-500 font-medium">Estimated Net Return</p>
              <p className="text-2xl font-extrabold text-emerald-800">
                ₹{mandi.estimatedNetReturn.toFixed(2)}{' '}
                <span className="text-xs font-normal text-emerald-600">/ kg</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 font-medium">Current Mandi Price</p>
              <p className="text-xl font-bold text-gray-900">
                ₹{mandi.marketPrice.toFixed(2)}{' '}
                <span className="text-xs font-normal text-gray-500">/ kg</span>
              </p>
            </div>
          </div>

          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            Deductions & Charges Breakdown
          </h4>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-600">Gross Mandi Price</span>
              <span className="font-semibold text-gray-900">+₹{mandi.marketPrice.toFixed(2)}/kg</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100 text-rose-600">
              <span>Mandi Market Fee (APMC Cess 1%)</span>
              <span className="font-semibold">-₹{mandi.cessBreakdown?.mandiCess.toFixed(2) || '0.20'}/kg</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100 text-rose-600">
              <span>Loading & Weighbridge Handling</span>
              <span className="font-semibold">-₹{mandi.cessBreakdown?.handling.toFixed(2) || '0.20'}/kg</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100 text-rose-600">
              <span>Transport Cost ({mandi.distanceKm} km transit)</span>
              <span className="font-semibold">-₹{mandi.cessBreakdown?.transport.toFixed(2) || '0.10'}/kg</span>
            </div>
            <div className="flex justify-between pt-2 text-sm font-bold text-emerald-800">
              <span>Net In-Hand Realization</span>
              <span>₹{mandi.estimatedNetReturn.toFixed(2)} / kg</span>
            </div>
          </div>

          <div className="mt-5 p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <p>
              <strong>Demand Status: {mandi.demand}</strong>. Arrival volume today is high with active buyer bidding. Best arrival time: Before 8:30 AM.
            </p>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Set Navigation to Mandi
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
