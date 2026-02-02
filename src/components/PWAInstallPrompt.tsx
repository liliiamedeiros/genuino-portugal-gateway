import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Capturar evento de instalação
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Mostrar prompt após 30 segundos
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (!dismissed) {
          setShowPrompt(true);
        }
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Detectar quando foi instalado
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('✅ PWA instalado com sucesso');
    } else {
      console.log('❌ Instalação cancelada pelo usuário');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div 
      className="fixed left-4 right-4 z-40 max-w-md mx-auto animate-fade-in safe-area-x"
      style={{ 
        bottom: `calc(5rem + var(--safe-area-inset-bottom, 0px))` 
      }}
    >
      <Alert className="bg-card shadow-2xl border-2 border-primary rounded-xl">
        <Download className="h-5 w-5 text-primary shrink-0" />
        <AlertTitle className="flex items-center justify-between gap-2">
          <span className="text-base font-semibold">Instalar Aplicação</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-10 w-10 p-0 shrink-0 -mr-2"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </Button>
        </AlertTitle>
        <AlertDescription className="mt-3">
          <p className="text-sm mb-4 leading-relaxed">
            Instale o Genuíno Investments no seu dispositivo para acesso rápido e experiência otimizada.
          </p>
          <Button onClick={handleInstallClick} className="w-full h-12 text-base">
            <Download className="mr-2 h-5 w-5" />
            Instalar Agora
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};
