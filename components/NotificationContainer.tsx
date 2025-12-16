import React, { useContext } from 'react';
import { InternalNotificationContext } from '../context/NotificationContext';

const NotificationToast: React.FC<{ message: string, type: string, onDismiss: () => void }> = ({ message, type, onDismiss }) => {
    const baseClasses = 'w-full max-w-sm p-4 rounded-lg shadow-lg text-white mb-2 transform transition-all duration-300 ease-in-out';
    
    const typeClasses = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        info: 'bg-blue-600',
        warning: 'bg-yellow-600',
    };
    
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onDismiss, 300); // allow for fade-out animation
        }, 4700);
        return () => clearTimeout(timer);
    }, [onDismiss]);


    return (
        <div 
             className={`${baseClasses} ${typeClasses[type as keyof typeof typeClasses] || 'bg-gray-700'} ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
             role="alert"
        >
            <p>{message}</p>
        </div>
    );
};

const NotificationContainer: React.FC = () => {
    const notifications = useContext(InternalNotificationContext);
    const [notificationList, setNotificationList] = React.useState(notifications);

    React.useEffect(() => {
        setNotificationList(notifications);
    }, [notifications]);
    
    const handleDismiss = (id: number) => {
        setNotificationList(prev => prev.filter(n => n.id !== id));
    };

    return (
        <div className="fixed top-4 right-4 z-[100] w-full max-w-sm space-y-2">
            {notificationList.map(notification => (
                <NotificationToast
                    key={notification.id}
                    message={notification.message}
                    type={notification.type}
                    onDismiss={() => handleDismiss(notification.id)}
                />
            ))}
        </div>
    );
};

export default NotificationContainer;
