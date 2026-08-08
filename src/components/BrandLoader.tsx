import React from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface BrandLoaderProps {
  variant?: 'fullscreen' | 'inline' | 'card';
  message?: string;
}

export const BrandLoader: React.FC<BrandLoaderProps> = ({
  variant = 'fullscreen',
  message = 'Loading Crackers Falls (பட்டாசு அருவி)...'
}) => {
  const isReducedMotion = useReducedMotion();

  if (variant === 'inline') {
    return (
      <div className="inline-flex items-center gap-2 text-amber-400 font-bold text-xs">
        <div className={`w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full ${isReducedMotion ? '' : 'animate-spin'}`} />
        <span>{message}</span>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="p-8 rounded-3xl glass-panel text-center flex flex-col items-center justify-center space-y-4">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className={`absolute inset-0 rounded-full border-2 border-amber-500/30 border-t-amber-400 ${isReducedMotion ? '' : 'animate-spin'}`} />
          <img src="/crackers falls logo.webp" alt="Crackers Falls" className="w-10 h-10 object-contain rounded-xl drop-shadow" />
        </div>
        <p className="text-amber-300 font-display font-bold text-sm">{message}</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#050b08]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center">
      {/* Animated Waterfall + Logo Graphic */}
      <div className="relative w-44 h-44 mb-6 flex items-center justify-center">
        {/* Outer Glowing Ring */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/30 via-amber-400/40 to-emerald-600/30 blur-2xl ${isReducedMotion ? '' : 'animate-pulse'}`} />

        {/* Waterfall Container */}
        <svg viewBox="0 0 100 100" className="w-full h-full relative z-10">
          <defs>
            <linearGradient id="waterfallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#0891b2" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
            </linearGradient>
            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <clipPath id="logoCircleClip">
              <circle cx="50" cy="50" r="26" />
            </clipPath>
          </defs>

          {/* Waterfall Drops */}
          {!isReducedMotion && (
            <>
              <line x1="28" y1="5" x2="28" y2="95" stroke="url(#waterfallGrad)" strokeWidth="3" strokeDasharray="10 15" className="animate-water-flow" />
              <line x1="50" y1="2" x2="50" y2="98" stroke="url(#waterfallGrad)" strokeWidth="4" strokeDasharray="15 20" className="animate-water-flow" style={{ animationDelay: '0.4s' }} />
              <line x1="72" y1="5" x2="72" y2="95" stroke="url(#waterfallGrad)" strokeWidth="3" strokeDasharray="8 12" className="animate-water-flow" style={{ animationDelay: '0.8s' }} />
            </>
          )}

          {/* Center Logo Circle & Image */}
          <circle cx="50" cy="50" r="28" fill="#05130b" stroke="#f59e0b" strokeWidth="2.5" filter="url(#goldGlow)" />
          <image
            href="/crackers falls logo.webp"
            x="24"
            y="24"
            height="52"
            width="52"
            clipPath="url(#logoCircleClip)"
            preserveAspectRatio="xMidYMid slice"
          />
        </svg>
      </div>

      {/* Brand Title */}
      <h2 className="text-3xl font-black font-display tracking-tight text-white mb-1">
        CRACKERS FALLS
      </h2>
      <p className="font-tamil text-amber-400 text-base font-bold tracking-wider mb-4">
        பட்டாசு அருவி — Sivakasi Direct Wholesale
      </p>

      {/* Loading message */}
      <p className="text-slate-300 text-xs font-sans tracking-wide max-w-xs animate-pulse">
        {message}
      </p>
    </div>
  );
};
