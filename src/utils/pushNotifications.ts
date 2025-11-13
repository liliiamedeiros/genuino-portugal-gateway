export class PushNotificationManager {
  private static STORAGE_KEY = 'genuino_notifications_enabled';
  
  // Verificar se notificações são suportadas
  static isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }
  
  // Verificar permissão atual
  static getPermission(): NotificationPermission {
    return Notification.permission;
  }
  
  // Solicitar permissão
  static async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('Notificações push não são suportadas neste navegador');
      return false;
    }
    
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      localStorage.setItem(this.STORAGE_KEY, 'true');
      console.log('✅ Permissão para notificações concedida');
      return true;
    }
    
    console.warn('❌ Permissão para notificações negada');
    return false;
  }
  
  // Enviar notificação local
  static async sendNotification(
    title: string, 
    options?: NotificationOptions
  ): Promise<void> {
    if (this.getPermission() !== 'granted') {
      console.warn('Permissão para notificações não concedida');
      return;
    }
    
    // Se service worker está disponível, usar ele
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      
      await registration.showNotification(title, {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        requireInteraction: false,
        ...options,
      });
    } else {
      // Fallback para notificação normal
      new Notification(title, options);
    }
  }
  
  // Verificar se usuário habilitou notificações
  static isEnabled(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) === 'true' && 
           this.getPermission() === 'granted';
  }
  
  // Desabilitar notificações
  static disable(): void {
    localStorage.setItem(this.STORAGE_KEY, 'false');
  }
}
