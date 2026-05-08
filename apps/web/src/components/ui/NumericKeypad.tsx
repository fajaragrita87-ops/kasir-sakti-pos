import React from 'react';
import { Delete, DeleteIcon, X } from 'lucide-react';

interface NumericKeypadProps {
  value: string;
  onChange: (value: string) => void;
  onClose?: () => void;
  onEnter?: () => void;
  title?: string;
}

export function NumericKeypad({ value, onChange, onClose, onEnter, title }: NumericKeypadProps) {
  const handlePress = (num: string) => {
    if (num === '0' && value === '0') return;
    if (value === '0') {
      onChange(num);
    } else {
      onChange(value + num);
    }
  };

  const handleDelete = () => {
    if (value.length <= 1) {
      onChange('0');
    } else {
      onChange(value.slice(0, -1));
    }
  };

  const handleClear = () => {
    onChange('0');
  };

  return (
    <div className="bg-white rounded-t-3xl md:rounded-3xl shadow-2xl p-6 w-full max-w-md animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs">{title || 'Input Jumlah'}</h3>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        )}
      </div>

      <div className="bg-slate-50 p-6 rounded-2xl mb-6 text-right">
        <span className="text-4xl font-black text-primary tracking-tight">
          {value.toLocaleString()}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <KeyButton key={num} onClick={() => handlePress(num.toString())}>{num}</KeyButton>
        ))}
        <KeyButton onClick={handleClear} className="text-danger bg-danger/5 hover:bg-danger/10 border-danger/10">C</KeyButton>
        <KeyButton onClick={() => handlePress('0')}>0</KeyButton>
        <KeyButton onClick={handleDelete} className="bg-slate-100 border-transparent">
          <Delete className="w-6 h-6 mx-auto text-slate-600" />
        </KeyButton>
      </div>

      <button 
        onClick={onEnter}
        className="w-full btn-primary py-5 mt-6 text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/30"
      >
        Konfirmasi
      </button>
    </div>
  );
}

function KeyButton({ children, onClick, className }: { children: React.ReactNode, onClick: () => void, className?: string }) {
  return (
    <button 
      onClick={onClick}
      className={`h-20 rounded-2xl border border-slate-100 bg-white shadow-sm active:scale-95 active:bg-slate-50 transition-all font-black text-2xl text-slate-700 ${className}`}
    >
      {children}
    </button>
  );
}
