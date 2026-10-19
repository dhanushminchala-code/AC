import React from 'react';

// AgriConnect / AgriLink Sprout Logo Icon
export const AgriConnectLogo: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M24 44C24 32 26 22 38 18"
      stroke="#16a34a"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    {/* Main leaf */}
    <path
      d="M24 30C20 22 23 11 36 7C36 20 28 26 24 30Z"
      fill="url(#leaf-grad-1)"
    />
    {/* Left leaf */}
    <path
      d="M23 34C15 32 10 24 12 14C21 16 23 26 23 34Z"
      fill="url(#leaf-grad-2)"
    />
    {/* Small accent leaf */}
    <path
      d="M25 22C28 17 33 13 40 12C39 19 33 22 25 22Z"
      fill="#86efac"
    />
    <defs>
      <linearGradient id="leaf-grad-1" x1="22" y1="7" x2="36" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4ade80" />
        <stop offset="1" stopColor="#15803d" />
      </linearGradient>
      <linearGradient id="leaf-grad-2" x1="10" y1="14" x2="23" y2="34" gradientUnits="userSpaceOnUse">
        <stop stopColor="#86efac" />
        <stop offset="1" stopColor="#16a34a" />
      </linearGradient>
    </defs>
  </svg>
);

// Tomato Icon - Rich 3D style matching screenshot
export const TomatoIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Stem & sepals */}
    <path
      d="M32 8C33 13 36 17 32 20C28 17 31 13 32 8Z"
      fill="#15803d"
    />
    <path
      d="M32 18C37 13 45 15 48 18C42 20 37 19 32 18Z"
      fill="#22c55e"
    />
    <path
      d="M32 18C27 13 19 15 16 18C22 20 27 19 32 18Z"
      fill="#22c55e"
    />
    <path
      d="M32 19C36 24 40 26 44 26C38 27 34 24 32 19Z"
      fill="#16a34a"
    />
    <path
      d="M32 19C28 24 24 26 20 26C26 27 30 24 32 19Z"
      fill="#16a34a"
    />
    {/* Tomato Body */}
    <ellipse cx="32" cy="38" rx="24" ry="20" fill="url(#tomato-grad)" />
    {/* Highlights */}
    <ellipse cx="23" cy="31" rx="5" ry="3" fill="#ffffff" fillOpacity="0.4" transform="rotate(-15 23 31)" />
    <defs>
      <radialGradient id="tomato-grad" cx="28" cy="32" r="24" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f87171" />
        <stop offset="0.6" stopColor="#dc2626" />
        <stop offset="1" stopColor="#991b1b" />
      </radialGradient>
    </defs>
  </svg>
);

// Rice / Paddy stalk Icon
export const RiceIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M26 56V26" stroke="#16a34a" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M38 56V32" stroke="#15803d" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M26 40C20 36 18 28 24 22C28 26 27 34 26 40Z" fill="#22c55e" />
    {/* Grains */}
    <ellipse cx="38" cy="22" rx="4.5" ry="2.5" fill="#facc15" transform="rotate(30 38 22)" />
    <ellipse cx="34" cy="27" rx="4.5" ry="2.5" fill="#fbbf24" transform="rotate(-30 34 27)" />
    <ellipse cx="42" cy="16" rx="4.5" ry="2.5" fill="#facc15" transform="rotate(30 42 16)" />
    <ellipse cx="38" cy="11" rx="4.5" ry="2.5" fill="#fbbf24" transform="rotate(-30 38 11)" />
    <ellipse cx="44" cy="7" rx="3.5" ry="2" fill="#fef08a" transform="rotate(20 44 7)" />
  </svg>
);

// Cotton Icon
export const CottonIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M20 42C16 42 12 38 12 33C12 28 16 25 21 25C22 19 28 14 34 15C39 16 43 20 44 24C48 24 52 27 52 32C52 37 48 42 43 42H20Z"
      fill="url(#cotton-grad)"
      filter="drop-shadow(0 2px 4px rgba(147, 197, 253, 0.25))"
    />
    <defs>
      <linearGradient id="cotton-grad" x1="16" y1="16" x2="48" y2="42" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ffffff" />
        <stop offset="0.7" stopColor="#e2e8f0" />
        <stop offset="1" stopColor="#cbd5e1" />
      </linearGradient>
    </defs>
  </svg>
);

// Potato Icon
export const PotatoIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <ellipse
      cx="32"
      cy="34"
      rx="21"
      ry="17"
      fill="url(#potato-grad)"
      transform="rotate(-10 32 34)"
    />
    {/* Potato eyes */}
    <circle cx="25" cy="28" r="1.5" fill="#92400e" fillOpacity="0.6" />
    <circle cx="36" cy="30" r="1.2" fill="#92400e" fillOpacity="0.6" />
    <circle cx="28" cy="40" r="1.8" fill="#92400e" fillOpacity="0.6" />
    <circle cx="41" cy="38" r="1.2" fill="#92400e" fillOpacity="0.6" />
    <defs>
      <radialGradient id="potato-grad" cx="28" cy="30" r="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fcd34d" />
        <stop offset="0.6" stopColor="#d97706" />
        <stop offset="1" stopColor="#b45309" />
      </radialGradient>
    </defs>
  </svg>
);

// Chilli Icon
export const ChilliIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Stem */}
    <path d="M42 12C38 12 36 15 36 18" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
    <ellipse cx="36" cy="18" rx="4" ry="2" fill="#15803d" />
    {/* Pepper body */}
    <path
      d="M36 19C38 26 38 36 33 44C29 50 22 53 18 54C21 51 23 46 25 39C27 31 29 22 36 19Z"
      fill="url(#chilli-grad)"
    />
    <defs>
      <linearGradient id="chilli-grad" x1="36" y1="19" x2="18" y2="54" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ef4444" />
        <stop offset="0.7" stopColor="#dc2626" />
        <stop offset="1" stopColor="#991b1b" />
      </linearGradient>
    </defs>
  </svg>
);

// Mandi Column Icon
export const MandiBuildingIcon: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M16 4L4 10V12H28V10L16 4Z" fill="#94a3b8" />
    <rect x="7" y="13" width="3" height="12" rx="1" fill="#cbd5e1" />
    <rect x="12" y="13" width="3" height="12" rx="1" fill="#cbd5e1" />
    <rect x="17" y="13" width="3" height="12" rx="1" fill="#cbd5e1" />
    <rect x="22" y="13" width="3" height="12" rx="1" fill="#cbd5e1" />
    <rect x="4" y="25" width="24" height="3" rx="1" fill="#94a3b8" />
  </svg>
);

// Trophy Icon
export const TrophyIcon: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 7H24V17C24 20.3137 21.3137 23 18 23C14.6863 23 12 20.3137 12 17V7Z" fill="#facc15" />
    <path d="M12 10H7C6.44772 10 6 10.4477 6 11V13C6 15.2091 7.79086 17 10 17H12V10Z" fill="#f59e0b" />
    <path d="M24 10H29C29.5523 10 30 10.4477 30 11V13C30 15.2091 28.2091 17 26 17H24V10Z" fill="#f59e0b" />
    <path d="M16 23H20V27H16V23Z" fill="#f59e0b" />
    <rect x="13" y="27" width="10" height="4" rx="2" fill="#78350f" />
  </svg>
);

// Tractor Icon
export const TractorIcon: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Body */}
    <path d="M6 14H14V20H6V14Z" fill="#4ade80" />
    <path d="M14 10H22L26 16V20H14V10Z" fill="#22c55e" />
    {/* Chimney */}
    <path d="M23 6H24V10H23V6Z" fill="#15803d" />
    {/* Big rear wheel */}
    <circle cx="9" cy="22" r="5" fill="#334155" />
    <circle cx="9" cy="22" r="2.5" fill="#e2e8f0" />
    {/* Small front wheel */}
    <circle cx="24" cy="23" r="3.5" fill="#334155" />
    <circle cx="24" cy="23" r="1.5" fill="#e2e8f0" />
  </svg>
);

// 4 Face Avatars Group
export const AvatarGroup: React.FC = () => (
  <div className="flex -space-x-2 overflow-hidden">
    <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-amber-100 flex items-center justify-center text-sm">
      👨‍🌾
    </div>
    <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-emerald-100 flex items-center justify-center text-sm">
      🧔🏽
    </div>
    <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-rose-100 flex items-center justify-center text-sm">
      👩🏽
    </div>
    <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-blue-100 flex items-center justify-center text-sm">
      👨🏾
    </div>
  </div>
);
