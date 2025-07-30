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
    console.log('PWAInstallPrompt: Component mounted');
    console.log('PWAInstallPrompt: Location:', window.location.href);
    console.log('PWAInstallPrompt: Protocol:', window.location.protocol);
    console.log('PWAInstallPrompt: User Agent:', navigator.userAgent);
    
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    
    console.log('PWAInstallPrompt: isStandalone:', isStandalone);
    console.log('PWAInstallPrompt: isInWebAppiOS:', isInWebAppiOS);
    
    if (isStandalone || isInWebAppiOS) {
      console.log('PWAInstallPrompt: App already installed, hiding prompt');
      setIsInstalled(true);
      return;
    }

    // Check if running on HTTPS (required for PWA in production)
    const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';
    console.log('PWAInstallPrompt: isSecure:', isSecure);
    if (!isSecure && location.hostname !== 'localhost') {
      console.warn('PWA install prompt requires HTTPS in production');
      return;
    }

    // Check localStorage status
    const hasBeenDismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = localStorage.getItem('pwa-install-dismissed-time');
    console.log('PWAInstallPrompt: hasBeenDismissed:', hasBeenDismissed);
    console.log('PWAInstallPrompt: dismissedTime:', dismissedTime);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWAInstallPrompt: beforeinstallprompt event fired!', e);
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      // Show the prompt immediately in production, with a small delay in dev
      setTimeout(() => {
        const hasBeenDismissed = localStorage.getItem('pwa-install-dismissed');
        const dismissedTime = localStorage.getItem('pwa-install-dismissed-time');
        
        // Reset dismissal after 7 days
        if (hasBeenDismissed && dismissedTime) {
          const dismissedDate = new Date(dismissedTime);
          const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
          console.log('PWAInstallPrompt: daysSinceDismissed:', daysSinceDismissed);
          if (daysSinceDismissed > 7) {
            localStorage.removeItem('pwa-install-dismissed');
            localStorage.removeItem('pwa-install-dismissed-time');
            console.log('PWAInstallPrompt: Dismissal reset after 7 days');
          }
        }
        
        if (!localStorage.getItem('pwa-install-dismissed')) {
          console.log('PWAInstallPrompt: Showing install prompt');
          setShowPrompt(true);
        } else {
          console.log('PWAInstallPrompt: Prompt was previously dismissed');
        }
      }, 3000); // Reduced to 3 seconds for debugging
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      console.log('PWAInstallPrompt: App installed successfully');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    // Add event listeners
    console.log('PWAInstallPrompt: Adding event listeners');
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // For debugging - check if the event would fire
    setTimeout(() => {
      console.log('PWAInstallPrompt: Checking after 5 seconds...');
      console.log('PWAInstallPrompt: deferredPrompt exists:', !!deferredPrompt);
      if (!deferredPrompt) {
        console.log('PWAInstallPrompt: beforeinstallprompt event has not fired after 5 seconds');
        console.log('PWAInstallPrompt: This could be due to:');
        console.log('- Browser install criteria not met');
        console.log('- App already installed');
        console.log('- User has declined install before');
        console.log('- Manifest or service worker issues');
      }
    }, 5000);

    return () => {
      console.log('PWAInstallPrompt: Removing event listeners');
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
    localStorage.setItem('pwa-install-dismissed-time', new Date().toISOString());
  };

  // Debug function to clear localStorage (for testing)
  const clearInstallDismissal = () => {
    localStorage.removeItem('pwa-install-dismissed');
    localStorage.removeItem('pwa-install-dismissed-time');
    console.log('PWAInstallPrompt: Cleared dismissal status');
    // Reload to trigger the prompt check again
    window.location.reload();
  };

  if (isInstalled || !showPrompt || !deferredPrompt) {
    // Show debug info in console even when prompt is hidden
    console.log('PWAInstallPrompt: Not showing prompt because:');
    console.log('- isInstalled:', isInstalled);
    console.log('- showPrompt:', showPrompt);
    console.log('- deferredPrompt exists:', !!deferredPrompt);
    
    // Add a debug button in development
    if (import.meta.env.DEV || window.location.hostname === 'localhost') {
      return (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={clearInstallDismissal}
            className="bg-red-500 text-white px-2 py-1 rounded text-xs"
          >
            Clear PWA Dismiss
          </button>
        </div>
      );
    }
    
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