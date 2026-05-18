import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, MessageSquare, Send, Sparkles, Move } from 'lucide-react';
import { KNOWLEDGE, findAnswer } from '../../pages/ai/AISaktiPage';

export function AIFloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'ai' | 'user', text: string}[]>([
    { role: 'ai', text: 'Halo! Saya AI Sakti. Ada yang bisa saya bantu terkait modul Vistral POS hari ini?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number, startY: number, initialX: number, initialY: number }>({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  const onPointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPosition({
      x: dragRef.current.initialX + dx,
      y: dragRef.current.initialY + dy
    });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(p => [...p, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = findAnswer(userMsg);
      setMessages(p => [...p, { role: 'ai', text: response }]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div 
      className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none"
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
    >
      <div className="pointer-events-auto flex flex-col items-end">
        {/* Chat Window */}
        {isOpen && (
          <div className="w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-indigo-100 overflow-hidden flex flex-col mb-4 max-h-[60vh] h-[500px]">
            {/* Header */}
            <div 
              className="bg-white border-b border-indigo-100 text-slate-800 p-4 flex items-center justify-between cursor-move touch-none"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <div className="flex items-center gap-3 pointer-events-none">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight flex items-center gap-1 text-slate-800">AI Sakti <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" /></h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Asisten Enterprise</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Move className="w-4 h-4 text-slate-400 pointer-events-none" />
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} 
                  className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                    m.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md shadow-indigo-100' 
                      : 'bg-white border border-indigo-100 text-slate-700 shadow-sm rounded-tl-sm'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-indigo-100 rounded-2xl rounded-tl-sm p-4 shadow-sm flex gap-1">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-indigo-50 flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Tanya AI Sakti..." 
                className="flex-1 bg-slate-50 border border-indigo-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all font-medium placeholder-slate-300"
              />
              <button 
                type="submit"
                disabled={!input.trim()}
                className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Floating Bubble Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 border-2 border-indigo-200/50 ${
            isOpen ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'
          }`}
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
          {!isOpen && <div className="absolute top-0 right-0 w-4 h-4 bg-amber-500 border-2 border-white rounded-full animate-pulse" />}
        </button>
      </div>
    </div>
  );
}
