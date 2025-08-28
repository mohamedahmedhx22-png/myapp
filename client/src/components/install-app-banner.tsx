import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export default function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    const handleAppInstalled = () => {
      console.log('تم تثبيت التطبيق بنجاح');
      setShowBanner(false);
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

    // Show the prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We no longer need the prompt
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  if (!showBanner || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-primary-500 text-white p-4 shadow-lg z-50 animate-slide-down">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <Download className="w-6 h-6 text-white" />
          <div>
            <p className="text-sm font-medium">ثبت التطبيق</p>
            <p className="text-xs opacity-90">للحصول على أفضل تجربة</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="bg-white text-primary-500 px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            data-testid="button-install-app"
          >
            ثبت
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-primary-600 rounded"
            data-testid="button-dismiss-install"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}