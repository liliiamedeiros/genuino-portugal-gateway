import { useState, useEffect } from 'react';
import { PushNotificationManager } from '@/utils/pushNotifications';

export const useNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isEnabled, setIsEnabled] = useState(false);
  
  useEffect(() => {
    setIsSupported(PushNotificationManager.isSupported());
    setPermission(PushNotificationManager.getPermission());
    setIsEnabled(PushNotificationManager.isEnabled());
  }, []);
  
  const requestPermission = async () => {
    const granted = await PushNotificationManager.requestPermission();
    if (granted) {
      setPermission('granted');
      setIsEnabled(true);
    }
  };
  
  const sendNotification = async (title: string, options?: NotificationOptions) => {
    await PushNotificationManager.sendNotification(title, options);
  };
  
  const disable = () => {
    PushNotificationManager.disable();
    setIsEnabled(false);
  };
  
  return {
    isSupported,
    permission,
    isEnabled,
    requestPermission,
    sendNotification,
    disable,
  };
};
