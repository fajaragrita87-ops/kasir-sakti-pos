import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // iOS detection
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    // Dismissed recently? Don't show again
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      // Show again after 3 days
      if (Date.now() - dismissedTime < 3 * 24 * 60 * 60 * 1000) return;
    }

    // Android/Desktop: listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS: show manual instructions after 3 seconds
    if (ios) {
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handler);
      };
    }

    // PWA update event
    const onUpdate = () => setUpdateAvailable(true);
    window.addEventListener('pwa-update-available', onUpdate);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('pwa-update-available', onUpdate);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setShowBanner(false);
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  const handleUpdate = () => {
    window.location.reload();
  };

  if (isInstalled || !showBanner) return null;

  // Update banner
  if (updateAvailable) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom">
        <div className="bg-blue-600 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Download className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm">Update Tersedia!</p>
            <p className="text-xs text-blue-100">Versi terbaru Kasir Sakti siap digunakan</p>
          </div>
          <button onClick={handleUpdate} className="bg-white text-blue-600 text-xs font-bold px-3 py-1.5 rounded-lg">
            Update
          </button>
        </div>
      </div>
    );
  }

  // iOS Instructions
  if (isIOS) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-5 rounded-t-3xl shadow-2xl border-t border-blue-800/50">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-black text-base">Install Kasir Sakti</p>
                <p className="text-blue-300 text-xs">Tambahkan ke Home Screen iPhone/iPad</p>
              </div>
            </div>
            <button onClick={handleDismiss} className="text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-blue-600 rounded-full text-xs flex items-center justify-center font-bold text-white flex-shrink-0">1</span>
              <p>Tap tombol <strong className="text-white">Share</strong> (kotak dengan panah ↑) di Safari</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-blue-600 rounded-full text-xs flex items-center justify-center font-bold text-white flex-shrink-0">2</span>
              <p>Pilih <strong className="text-white">"Add to Home Screen"</strong></p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-blue-600 rounded-full text-xs flex items-center justify-center font-bold text-white flex-shrink-0">3</span>
              <p>Tap <strong className="text-white">Add</strong> → Selesai! ✅</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Android / Desktop Install Banner
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-4 shadow-2xl border border-blue-800/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-sm">Install Kasir Sakti</p>
            <p className="text-blue-300 text-xs">Akses lebih cepat, bisa pakai offline!</p>
          </div>
          <button onClick={handleDismiss} className="text-slate-400 hover:text-white p-1 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleInstall}
            className="flex-1 bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Install Sekarang
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 bg-white/10 hover:bg-white/20 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
          >
            Nanti
          </button>
        </div>
      </div>
    </div>
  );
}
