export type NotificationType = 'appointment_new' | 'appointment_cancelled' | 'bill_paid' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [];

export const getNotifications = (): Notification[] => {
  if (typeof window === 'undefined') return INITIAL_NOTIFICATIONS;
  const stored = localStorage.getItem('juman_notifications');
  return stored ? JSON.parse(stored) : INITIAL_NOTIFICATIONS;
};

export const addNotification = (data: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
  const notifications = getNotifications();
  const newNotif: Notification = {
    ...data,
    id: `notif_${Date.now()}`,
    createdAt: new Date().toISOString(),
    read: false,
  };
  localStorage.setItem('juman_notifications', JSON.stringify([newNotif, ...notifications]));
  return newNotif;
};

export const markAsRead = (id: string) => {
  const notifications = getNotifications();
  const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
  localStorage.setItem('juman_notifications', JSON.stringify(updated));
};

export const markAllAsRead = () => {
  const notifications = getNotifications();
  const updated = notifications.map(n => ({ ...n, read: true }));
  localStorage.setItem('juman_notifications', JSON.stringify(updated));
};

export const deleteNotification = (id: string) => {
  const notifications = getNotifications();
  const updated = notifications.filter(n => n.id !== id);
  localStorage.setItem('juman_notifications', JSON.stringify(updated));
};

export const clearAllNotifications = () => {
  localStorage.setItem('juman_notifications', JSON.stringify([]));
};

export const getUnreadCount = (): number => {
  return getNotifications().filter(n => !n.read).length;
};

export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  appointment_new: '📅',
  appointment_cancelled: '❌',
  bill_paid: '✅',
  system: '⚙️',
};
