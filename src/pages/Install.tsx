import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Check, Smartphone, Monitor, Tablet } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Verificar se pode instalar
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const features = [
    'Acesso offline aos conteúdos',
    'Instalação rápida sem loja de apps',
    'Notificações em tempo real',
    'Experiência otimizada para mobile',
    'Atualizações automáticas',
    'Menos uso de dados'
  ];

  return (
    <>
      <SEOHead 
        title="Instalar Aplicação"
        description="Instale o Genuíno Investments no seu dispositivo para acesso rápido e offline"
      />
      
      <div className="min-h-screen pt-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-4">
                <Download className="h-12 w-12 text-primary" />
                <h1 className="text-5xl font-serif font-bold">
                  Instalar Aplicação
                </h1>
              </div>
              <p className="text-xl text-muted-foreground">
                Acesso rápido, offline e otimizado para todos os dispositivos
              </p>
            </div>

            {/* Status Card */}
            {isInstalled ? (
              <div className="bg-green-50 dark:bg-green-950 border-2 border-green-500 rounded-xl p-8 mb-12 text-center">
                <Check className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
                  ✅ Aplicação Instalada
                </h2>
                <p className="text-green-700 dark:text-green-300">
                  A aplicação já está instalada no seu dispositivo!
                </p>
              </div>
            ) : (
              <div className="bg-primary/5 border-2 border-primary rounded-xl p-8 mb-12 text-center">
                <Download className="h-16 w-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">
                  Instale Nossa Aplicação
                </h2>
                <p className="text-muted-foreground mb-6">
                  Disponível para instalação em todos os dispositivos
                </p>
                {deferredPrompt && (
                  <Button size="lg" className="text-lg px-8" onClick={handleInstall}>
                    <Download className="mr-2 h-5 w-5" />
                    Instalar Agora
                  </Button>
                )}
                {!deferredPrompt && (
                  <p className="text-sm text-muted-foreground">
                    Use o menu do navegador para instalar esta aplicação
                  </p>
                )}
              </div>
            )}

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-card rounded-lg border">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Platforms */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-card rounded-xl border">
                <Smartphone className="h-12 w-12 text-primary mx-auto mb-3" />
                <h3 className="font-bold mb-2">Mobile</h3>
                <p className="text-sm text-muted-foreground">
                  iOS & Android
                </p>
              </div>
              <div className="text-center p-6 bg-card rounded-xl border">
                <Tablet className="h-12 w-12 text-primary mx-auto mb-3" />
                <h3 className="font-bold mb-2">Tablet</h3>
                <p className="text-sm text-muted-foreground">
                  iPad & Android Tablets
                </p>
              </div>
              <div className="text-center p-6 bg-card rounded-xl border">
                <Monitor className="h-12 w-12 text-primary mx-auto mb-3" />
                <h3 className="font-bold mb-2">Desktop</h3>
                <p className="text-sm text-muted-foreground">
                  Windows, Mac, Linux
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
