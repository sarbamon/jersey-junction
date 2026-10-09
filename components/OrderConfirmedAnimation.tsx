'use client';

import React from 'react';

export const OrderConfirmedAnimation: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center py-4 ${className}`}>
      <style jsx>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }
        @keyframes popCheck {
          0% { transform: scale(0) rotate(-45deg); opacity: 0; }
          70% { transform: scale(1.2) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes pulseRing {
          0% { transform: scale(0.85); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 0.3; }
          100% { transform: scale(0.85); opacity: 0.8; }
        }
        @keyframes sparkleGlow {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes screenPulse {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(244, 200, 74, 0.4)); }
          50% { filter: drop-shadow(0 0 25px rgba(244, 200, 74, 0.8)); }
        }
        .animate-float {
          animation: floatSlow 4s ease-in-out infinite;
        }
        .animate-pop-check {
          animation: popCheck 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-pulse-ring {
          animation: pulseRing 3s ease-in-out infinite;
        }
        .animate-sparkle-1 {
          animation: sparkleGlow 2s ease-in-out infinite 0.2s;
        }
        .animate-sparkle-2 {
          animation: sparkleGlow 2.5s ease-in-out infinite 0.7s;
        }
        .animate-sparkle-3 {
          animation: sparkleGlow 1.8s ease-in-out infinite 1.1s;
        }
        .animate-screen {
          animation: screenPulse 3s ease-in-out infinite;
        }
      `}</style>

      {/* Outer Glow Ring */}
      <div className="absolute w-64 h-64 rounded-full bg-emerald-500/10 animate-pulse-ring border border-emerald-500/20 blur-sm pointer-events-none" />
      <div className="absolute w-48 h-48 rounded-full bg-[#f4c84a]/10 animate-pulse-ring border border-[#f4c84a]/20 blur-md pointer-events-none" />

      {/* Floating Sparkles */}
      <div className="absolute top-2 left-6 text-[#f4c84a] animate-sparkle-1">
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </div>

      <div className="absolute bottom-6 right-8 text-emerald-400 animate-sparkle-2">
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </div>

      <div className="absolute top-10 right-10 text-amber-300 animate-sparkle-3">
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </div>

      {/* Main Illustration Container */}
      <div className="relative w-64 h-64 flex items-center justify-center animate-float">
        
        <svg viewBox="0 0 320 320" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id="chairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3a29" />
              <stop offset="100%" stopColor="#0d1e15" />
            </linearGradient>
            <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#6d28d9" />
            </linearGradient>
            <linearGradient id="pantGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f4c84a" />
              <stop offset="100%" stopColor="#d4af37" />
            </linearGradient>
            <linearGradient id="phoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Armchair Background */}
          <path d="M 60 170 C 50 120 70 80 120 75 C 170 70 230 80 245 120 C 255 150 250 200 240 230 C 230 250 90 260 70 230 Z" fill="url(#chairGrad)" stroke="#10b981" strokeWidth="2" opacity="0.9" />
          <path d="M 40 180 C 40 140 70 140 80 170 C 90 200 70 240 50 230 Z" fill="#142b1f" stroke="#059669" strokeWidth="1.5" />
          <path d="M 260 180 C 260 140 230 140 220 170 C 210 200 230 240 250 230 Z" fill="#142b1f" stroke="#059669" strokeWidth="1.5" />

          {/* Chair Legs */}
          <line x1="80" y1="240" x2="65" y2="280" stroke="#444" strokeWidth="6" strokeLinecap="round" />
          <line x1="220" y1="240" x2="235" y2="280" stroke="#444" strokeWidth="6" strokeLinecap="round" />

          {/* Small Side Table with Coffee Cup */}
          <rect x="25" y="220" width="35" height="6" rx="3" fill="#27272a" />
          <line x1="42" y1="226" x2="42" y2="275" stroke="#3f3f46" strokeWidth="4" />
          <path d="M 33 198 L 51 198 L 48 220 L 36 220 Z" fill="#ef4444" rx="2" />
          <path d="M 51 204 C 56 204 56 214 51 214" fill="none" stroke="#ef4444" strokeWidth="2.5" />
          {/* Steam from cup */}
          <path d="M 38 193 C 36 188 42 184 40 178" fill="none" stroke="#f4c84a" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <path d="M 45 194 C 43 189 48 185 46 179" fill="none" stroke="#f4c84a" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />

          {/* Person Sitting Comfortably */}
          {/* Torso Hoodie */}
          <path d="M 110 145 C 110 110 170 110 190 145 C 200 170 195 210 160 215 C 130 215 110 180 110 145 Z" fill="url(#shirtGrad)" />
          {/* Hoodie Strings */}
          <path d="M 145 130 L 142 160" stroke="#e9d5ff" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 155 130 L 158 160" stroke="#e9d5ff" strokeWidth="2.5" strokeLinecap="round" />

          {/* Head & Hair */}
          <circle cx="150" cy="100" r="22" fill="#fcd34d" />
          {/* Hair & Beard */}
          <path d="M 130 95 C 130 75 168 75 172 95 C 172 85 145 80 130 95 Z" fill="#451a03" />
          <path d="M 132 105 C 132 122 168 122 168 105 C 160 126 140 126 132 105 Z" fill="#451a03" />
          {/* Glasses */}
          <circle cx="143" cy="98" r="5.5" fill="none" stroke="#18181b" strokeWidth="2" />
          <circle cx="157" cy="98" r="5.5" fill="none" stroke="#18181b" strokeWidth="2" />
          <line x1="148.5" y1="98" x2="151.5" y2="98" stroke="#18181b" strokeWidth="2" />
          {/* Happy Smile */}
          <path d="M 144 109 Q 150 114 156 109" fill="none" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />

          {/* Yellow Trousers / Legs Crossed */}
          <path d="M 135 210 C 130 230 150 255 190 250 C 230 245 240 215 200 205 Z" fill="url(#pantGrad)" />
          <path d="M 140 210 Q 180 230 215 200" fill="none" stroke="#b45309" strokeWidth="2" />
          
          {/* Blue Shoes */}
          <ellipse cx="225" cy="245" rx="18" ry="10" fill="#2563eb" />
          <path d="M 210 245 C 215 238 235 238 240 245 Z" fill="#ffffff" />

          {/* Arms holding Smartphone */}
          <path d="M 115 155 Q 140 175 160 165" fill="none" stroke="#fcd34d" strokeWidth="12" strokeLinecap="round" />
          <path d="M 185 155 Q 165 175 155 165" fill="none" stroke="#fcd34d" strokeWidth="12" strokeLinecap="round" />

          {/* Smartphone with Screen Glow */}
          <rect x="152" y="140" width="28" height="48" rx="5" fill="#09090b" stroke="#3b82f6" strokeWidth="2" className="animate-screen" />
          <rect x="155" y="144" width="22" height="40" rx="3" fill="#1e3a8a" />
          {/* Order Confirmed UI line on phone */}
          <circle cx="166" cy="155" r="5" fill="#10b981" />
          <path d="M 164 155 L 165.5 156.5 L 168.5 153.5" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="159" y="166" width="14" height="2" rx="1" fill="#93c5fd" />
          <rect x="159" y="171" width="10" height="2" rx="1" fill="#60a5fa" />
          <rect x="159" y="176" width="12" height="3" rx="1" fill="#f4c84a" />

          {/* Pop-up Big Green Checkmark Badge above phone */}
          <g className="animate-pop-check">
            <circle cx="210" cy="115" r="24" fill="url(#badgeGrad)" stroke="#ffffff" strokeWidth="3" filter="drop-shadow(0 4px 12px rgba(16, 185, 129, 0.6))" />
            <path d="M 199 115 L 206 122 L 222 106" fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>

      </div>
    </div>
  );
};
