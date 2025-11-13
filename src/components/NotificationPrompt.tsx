import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useNotifications } from '@/hooks/useNotifications';

export const NotificationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const { isSupported, permission, requestPermission } = useNotifications();

  useEffect(() => {
    // Mostrar prompt após 10 segundos se notificações são suportadas e não foram decididas
    if (isSupported && permission === 'default') {
      const dismissed = localStorage.getItem('notification-prompt-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 10000);
      }
    }
  }, [isSupported, permission]);

  const handleEnable = async () => {
    await requestPermission();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('notification-prompt-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto animate-fade-in">
      <Alert className="bg-card shadow-2xl border-2 border-primary">
        <Bell className="h-5 w-5 text-primary" />
        <AlertTitle className="flex items-center justify-between">
          <span>Notificações</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertTitle>
        <AlertDescription className="mt-2">
          <p className="text-sm mb-3">
            Receba alertas sobre novas propriedades e atualizações importantes.
          </p>
          <div className="flex gap-2">
            <Button onClick={handleEnable} className="flex-1">
              <Bell className="mr-2 h-4 w-4" />
              Ativar Notificações
            </Button>
            <Button onClick={handleDismiss} variant="outline">
              Agora Não
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};
