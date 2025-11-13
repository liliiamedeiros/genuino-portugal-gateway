import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, BellOff } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default function NotificationSettings() {
  const { isSupported, permission, isEnabled, requestPermission, disable } = useNotifications();
  
  const handleToggle = async (checked: boolean) => {
    if (checked) {
      await requestPermission();
    } else {
      disable();
    }
  };
  
  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Configurações de Notificações</h1>
        
        {!isSupported ? (
          <Card className="p-6">
            <div className="flex items-center gap-3 text-muted-foreground">
              <BellOff className="h-5 w-5" />
              <p>Notificações push não são suportadas neste navegador.</p>
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-primary" />
                <div>
                  <Label htmlFor="notifications">Notificações Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba alertas sobre novas propriedades e atualizações
                  </p>
                </div>
              </div>
              <Switch
                id="notifications"
                checked={isEnabled}
                onCheckedChange={handleToggle}
                disabled={permission === 'denied'}
              />
            </div>
            
            {permission === 'denied' && (
              <p className="text-sm text-destructive mt-4">
                Você bloqueou as notificações. Para ativá-las, altere as configurações do seu navegador.
              </p>
            )}
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
