import React from 'react';
import { X, Bell, TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';
import { ActivityItem } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: ActivityItem[];
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  activities,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 px-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Notifications & Alerts</h3>
              <p className="text-xs text-gray-500">Live mandi & buyer updates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {activities.map((act) => (
            <div key={act.id} className="py-3 flex items-start gap-3 hover:bg-gray-50 px-2 rounded-lg transition">
              <div className="mt-1">
                {act.type === 'buyer' ? (
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                ) : act.type === 'price' ? (
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-800">{act.text}</p>
                <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
                  <Clock className="w-3 h-3" />
                  <span>{act.timeAgo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Mark all as read
          </button>
        </div>
      </div>
    </div>
  );
};
