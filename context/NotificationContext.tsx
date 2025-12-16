import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
    id: number;
    message: string;
    type: NotificationType;
}

interface NotificationContextType {
    addNotification: (message: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((message: string, type: NotificationType) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000); // Notifications disappear after 5 seconds
    }, []);

    // This is a bit of a workaround. The actual rendering happens in NotificationContainer,
    // which is a sibling of the main App layout. This context just provides the state and the updater function.
    // We'll also pass the notifications themselves through an internal context for the container to consume.
    return (
        <NotificationContext.Provider value={{ addNotification }}>
            <InternalNotificationContext.Provider value={notifications}>
                {children}
            </InternalNotificationContext.Provider>
        </NotificationContext.Provider>
    );
};

// This internal context is just for the container to get the notification list.
export const InternalNotificationContext = createContext<Notification[]>([]);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
