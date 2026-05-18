import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  white?: boolean;
}

export function Logo({ className = "h-10", showText = true, white = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* VISTRAL V Icon */}
      <div className="relative w-10 h-10 flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
          <defs>
            <linearGradient id="vGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <linearGradient id="vGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EAB308" />
            </linearGradient>
          </defs>
          {/* Circle ring */}
          <circle cx="50" cy="55" r="36" fill="none" stroke="url(#vGrad2)" strokeWidth="5" opacity="0.7" />
          {/* V left stroke */}
          <polygon points="18,18 38,18 50,68 38,68" fill="url(#vGrad1)" />
          {/* V right stroke */}
          <polygon points="62,18 82,18 62,68 50,68" fill="url(#vGrad1)" opacity="0.85" />
          {/* V center notch */}
          <polygon points="44,40 56,40 50,55" fill="white" opacity="0.9" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-black text-xl tracking-tighter leading-none ${white ? 'text-white' : 'text-slate-900'}`}>
            VISTRAL POS
          </span>
          <span className={`text-[8px] font-black uppercase tracking-[0.2em] mt-1 ${white ? 'text-white/60' : 'text-blue-500'}`}>
            PAY AS YOU GO
          </span>
        </div>
      )}
    </div>
  );
}
