import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import Alert from './Alert';

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-4 max-w-md">
      {notifications.map(notification => (
        <div key={notification.id} className="animate-in fade-in slide-in-from-right-5 duration-300">
          <Alert
            type={notification.type}
            title={notification.title}
            message={notification.message}
            onClose={() => {
              removeNotification(notification.id);
              if (notification.onClose) {
                notification.onClose();
              }
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
