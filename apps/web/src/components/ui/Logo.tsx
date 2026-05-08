import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  white?: boolean;
}

export function Logo({ className = "h-10", showText = true, white = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon Hexagon S */}
      <div className="relative w-10 h-10 flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          <path 
            d="M50 5 L93.3 30 L93.3 80 L50 105 L6.7 80 L6.7 30 Z" 
            fill="url(#logoGradient)" 
            className="opacity-20"
          />
          <path 
            d="M50 10 L86.6 32.5 L86.6 77.5 L50 100 L13.4 77.5 L13.4 32.5 Z" 
            fill="url(#logoGradient)" 
          />
          {/* Stylized S */}
          <path 
            d="M35 40 Q50 30 65 40 Q75 50 50 60 Q25 70 35 80 Q50 90 65 80" 
            fill="none" 
            stroke="white" 
            strokeWidth="8" 
            strokeLinecap="round"
            className="drop-shadow-md"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-black text-xl tracking-tighter leading-none ${white ? 'text-white' : 'text-slate-900'}`}>
            SAKTI POS
          </span>
          <span className={`text-[8px] font-black uppercase tracking-[0.2em] mt-1 ${white ? 'text-white/60' : 'text-primary'}`}>
            PAY AS YOU GO
          </span>
        </div>
      )}
    </div>
  );
}
