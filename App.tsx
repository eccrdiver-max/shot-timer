// FIX: Implemented the main App component to handle routing based on authentication status.
import React from 'react';
import { useAuth } from './context/AuthContext';
import LoginView from './components/LoginView';
import Layout from './components/Layout';
import NotificationContainer from './components/NotificationContainer';
import ConfirmModal from './components/ConfirmModal';
import { useI18n } from './hooks/useI18n';

const App: React.FC = () => {
    const { currentUser, loading: authLoading } = useAuth();
    const { loading: i18nLoading, t } = useI18n();

    if (authLoading || i18nLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
                {t('loading')}...
            </div>
        );
    }

    return (
        <>
            {currentUser ? <Layout /> : <LoginView />}
            <NotificationContainer />
            <ConfirmModal />
        </>
    );
};

export default App;