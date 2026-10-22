'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const OrderConfirmedAnimation: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative flex flex-col items-center justify-center py-6 sm:py-8 ${className}`}>
      <style jsx>{`
        @keyframes scaleIn {
          0% {
            transform: scale(0.6);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes strokeCircle {
          0% {
            stroke-dashoffset: 440;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes strokeCheck {
          0% {
            stroke-dashoffset: 80;
            opacity: 0;
          }
          60% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }
        @keyframes haloPulse {
          0%, 100% {
            transform: scale(0.95);
            opacity: 0.45;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.85;
          }
        }
        @keyframes outerRingRotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes sparkleFloat {
          0%, 100% {
            transform: translateY(0px) scale(0.85);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-8px) scale(1.15);
            opacity: 1;
          }
        }

        .animate-scale-in {
          animation: scaleIn 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-circle-draw {
          stroke-dasharray: 440;
          stroke-dashoffset: 440;
          animation: strokeCircle 1s cubic-bezier(0.65, 0, 0.45, 1) 0.15s forwards;
        }
        .animate-check-draw {
          stroke-dasharray: 80;
          stroke-dashoffset: 80;
          animation: strokeCheck 0.65s cubic-bezier(0.65, 0, 0.45, 1) 0.75s forwards;
        }
        .animate-halo-pulse {
          animation: haloPulse 3s ease-in-out infinite;
        }
        .animate-ring-slow {
          animation: outerRingRotate 22s linear infinite;
        }
        .animate-sparkle-1 {
          animation: sparkleFloat 2.4s ease-in-out infinite 0.2s;
        }
        .animate-sparkle-2 {
          animation: sparkleFloat 2.8s ease-in-out infinite 0.9s;
        }
        .animate-sparkle-3 {
          animation: sparkleFloat 2.1s ease-in-out infinite 1.4s;
        }
      `}</style>

      {/* Layered Golden & Emerald Ambient Halos */}
      <div className="absolute w-56 h-56 rounded-full bg-gradient-to-tr from-[#f4c84a]/25 via-emerald-500/20 to-amber-500/10 blur-2xl animate-halo-pulse pointer-events-none" />
      <div className="absolute w-40 h-40 rounded-full bg-emerald-500/20 blur-xl animate-halo-pulse pointer-events-none" />

      {/* Subtle Orbital Dashed Ring */}
      <div className="absolute w-52 h-52 rounded-full border border-dashed border-[#f4c84a]/30 animate-ring-slow pointer-events-none" />

      {/* Floating Accent Sparkles */}
      <div className="absolute top-2 left-8 text-[#f4c84a] animate-sparkle-1 pointer-events-none">
        <svg className="w-5 h-5 fill-current drop-shadow-[0_0_8px_rgba(244,200,74,0.8)]" viewBox="0 0 24 24">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </div>

      <div className="absolute bottom-4 right-10 text-emerald-400 animate-sparkle-2 pointer-events-none">
        <svg className="w-4 h-4 fill-current drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" viewBox="0 0 24 24">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </div>

      <div className="absolute top-6 right-8 text-amber-300 animate-sparkle-3 pointer-events-none">
        <svg className="w-3.5 h-3.5 fill-current drop-shadow-[0_0_6px_rgba(252,211,77,0.8)]" viewBox="0 0 24 24">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </div>

      {/* Main Apple / Stripe Minimalist Success Checkmark */}
      <div className="relative animate-scale-in">
        
        {/* Backdrop Circular Card */}
        <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-b from-zinc-900 via-black to-zinc-950 border border-zinc-800 shadow-[0_0_40px_rgba(244,200,74,0.18)] flex items-center justify-center relative p-2">
          
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 150 150"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f4c84a" />
                <stop offset="60%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
              <linearGradient id="checkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f4c84a" />
              </linearGradient>
              <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Muted Track */}
            <circle
              cx="75"
              cy="75"
              r="62"
              stroke="#27272a"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Animated Draw-in Dynamic Circle */}
            <circle
              cx="75"
              cy="75"
              r="62"
              stroke="url(#circleGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              className="animate-circle-draw"
              filter="url(#glowFilter)"
            />

            {/* Animated Smooth Checkmark */}
            <path
              d="M48 76 L66 94 L103 54"
              stroke="url(#checkGrad)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-check-draw transform rotate-90 origin-center"
              filter="url(#glowFilter)"
            />
          </svg>

          {/* Center Subtle Luxury Shield Badge */}
          <div className="absolute -bottom-2 px-3 py-0.5 rounded-full bg-black/90 border border-[#f4c84a]/50 text-[#f4c84a] text-[10px] font-mono font-bold tracking-wider uppercase shadow-lg flex items-center gap-1 backdrop-blur-sm">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>VERIFIED</span>
          </div>
        </div>
      </div>
    </div>
  );
};
