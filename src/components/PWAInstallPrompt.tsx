import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    const isInWebAppChrome = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isStandalone || isInWebAppiOS || isInWebAppChrome) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Don't show immediately, wait a bit for user to engage
      setTimeout(() => {
        const hasBeenDismissed = localStorage.getItem('pwa-install-dismissed');
        if (!hasBeenDismissed) {
          setShowPrompt(true);
        }
      }, 10000); // Show after 10 seconds
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <Download className="h-5 w-5 mr-2" />
            <h3 className="font-semibold">Install Bible Study App</h3>
          </div>
          <button 
            onClick={handleDismiss}
            className="text-black/70 hover:text-black transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <p className="text-sm mb-4 text-black/80">
          Install our app for the best reading experience with offline access and notifications.
        </p>
        
        <div className="flex gap-2">
          <button
            onClick={handleInstallClick}
            className="bg-black text-yellow-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex-1"
          >
            Install App
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-black/20 hover:bg-black/30 transition-colors"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;