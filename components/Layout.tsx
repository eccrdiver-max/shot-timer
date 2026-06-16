
import React, { useCallback, useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { AppView, UserRole } from '../types';
import { useI18n } from '../hooks/useI18n';

import DashboardView from './DashboardView';
import ShotTimerView from './ShotTimerView';
import TrainingView from './TrainingView';
import ClassifierView from './ClassifierView';
import MatchView from './MatchView';
import ShootersView from './ShootersView';
import ArmoryView from './ArmoryView';
import SettingsView from './SettingsView';
import HeadToHeadView from './HeadToHeadView';
import ExternalDiaryView from './ExternalDiaryView';

const NavLink: React.FC<{
    currentView: AppView;
    targetView: AppView;
    onClick: (view: AppView) => void;
    children: React.ReactNode;
}> = ({ currentView, targetView, onClick, children }) => {
    const isActive = currentView === targetView;
    const classes = isActive
        ? 'bg-yellow-500 text-gray-900'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white';
    return (
        <button
            onClick={() => onClick(targetView)}
            className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${classes}`}
        >
            {children}
        </button>
    );
};

const BottomNavLink: React.FC<{
    currentView: AppView;
    targetView: AppView;
    onClick: (view: AppView) => void;
    icon: React.ReactNode;
    label: string;
}> = ({ currentView, targetView, onClick, icon, label }) => {
    const isActive = currentView === targetView;
    return (
        <button
            onClick={() => onClick(targetView)}
            className={`flex flex-col items-center justify-center min-w-[4.5rem] py-2 text-xs flex-shrink-0 ${isActive ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`}
        >
            {icon}
            <span className="mt-1 whitespace-nowrap">{label}</span>
        </button>
    );
};

const BottomNavSyncButton: React.FC<{
    syncStatus: 'idle' | 'syncing' | 'success' | 'error';
    onClick: () => void;
}> = ({ syncStatus, onClick }) => {
    const disabled = syncStatus === 'syncing';

    const getIconAndLabel = () => {
        switch (syncStatus) {
            case 'syncing':
                return {
                    icon: <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>,
                    label: 'Sinc...',
                    color: 'text-yellow-400'
                };
            case 'success':
                return {
                    icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>,
                    label: 'OK',
                    color: 'text-green-400'
                };
            case 'error':
                return {
                    icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
                    label: 'Errore',
                    color: 'text-red-400'
                };
            default: // 'idle'
                return {
                    icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5"></path></svg>,
                    label: 'Sinc.',
                    color: 'text-gray-400 hover:text-white'
                };
        }
    };

    const { icon, label, color } = getIconAndLabel();

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex flex-col items-center justify-center min-w-[4.5rem] py-2 text-xs flex-shrink-0 ${color} disabled:opacity-50`}
        >
            {icon}
            <span className="mt-1 whitespace-nowrap">{label}</span>
        </button>
    );
};


const Layout: React.FC = () => {
    const { view, setView, syncStatus, triggerFullSync } = useAppContext();
    const { logOut, currentUser } = useAuth();
    const { t } = useI18n();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNetworkOnline, setIsNetworkOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsNetworkOnline(true);
        const handleOffline = () => setIsNetworkOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    
    useEffect(() => {
        // Trigger a sync on initial login
        if(currentUser) {
            triggerFullSync();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);


    const handleSetView = useCallback((newView: AppView) => {
        setView(newView);
    }, [setView]);
    
    const handleMobileClick = (newView: AppView) => {
        setView(newView);
        setIsMobileMenuOpen(false);
    };

    const renderView = () => {
        switch (view) {
            case AppView.DASHBOARD: return <DashboardView />;
            case AppView.TIMER: return <ShotTimerView />;
            case AppView.TRAINING: return <TrainingView />;
            case AppView.CLASSIFIER: return <ClassifierView />;
            case AppView.MATCHES: return <MatchView />;
            case AppView.SHOOTERS: return <ShootersView />;
            case AppView.ARMORY: return <ArmoryView />;
            case AppView.EXTERNAL_DIARY: return <ExternalDiaryView />;
            case AppView.SETTINGS: return <SettingsView />;
            case AppView.HEAD_TO_HEAD: return <HeadToHeadView />;
            default: return <DashboardView />;
        }
    };
    
    const isMdOrSo = currentUser?.role === UserRole.MD || currentUser?.role === UserRole.SO;
    
    const SyncButton = () => {
        const baseClasses = "w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2";
        const disabled = syncStatus === 'syncing';

        if (!isNetworkOnline) {
             return <div className={`${baseClasses} bg-red-900 text-red-200`}><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg> {t('offline_mode')}</div>;
        }

        switch(syncStatus) {
            case 'syncing':
                return <div className={`${baseClasses} bg-yellow-800 text-yellow-300 animate-pulse`}><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> {t('syncing_data')}...</div>;
            case 'success':
                 return <div className={`${baseClasses} bg-green-800 text-green-300`}><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> {t('sync_successful')}</div>;
            case 'error':
                 return <button onClick={triggerFullSync} className={`${baseClasses} bg-red-800 text-red-300 hover:bg-red-700`}><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> {t('sync_failed_retry')}</button>;
            default:
                return <button onClick={triggerFullSync} disabled={disabled} className={`${baseClasses} text-gray-300 bg-gray-700 hover:bg-blue-700 hover:text-white`}><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5"></path></svg> {t('sync_with_cloud')}</button>;
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            <aside className="hidden md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64 bg-gray-800">
                    <div className="flex items-center justify-center h-16 flex-shrink-0 bg-gray-900">
                        <span className="text-2xl">🎯</span>
                        <span className="text-white text-2xl font-bold ml-2">Shot Timer Pro</span>
                    </div>
                    <div className="flex-1 flex flex-col overflow-y-auto">
                        <nav className="mt-5 flex-1 px-2 space-y-1">
                            <NavLink currentView={view} targetView={AppView.DASHBOARD} onClick={handleSetView}>{t('nav_dashboard')}</NavLink>
                            <NavLink currentView={view} targetView={AppView.TIMER} onClick={handleSetView}>{t('nav_timer')}</NavLink>
                            <NavLink currentView={view} targetView={AppView.HEAD_TO_HEAD} onClick={handleSetView}>{t('nav_head_to_head')}</NavLink>
                            <NavLink currentView={view} targetView={AppView.TRAINING} onClick={handleSetView}>{t('nav_training')}</NavLink>
                            <NavLink currentView={view} targetView={AppView.CLASSIFIER} onClick={handleSetView}>{t('nav_classifier')}</NavLink>
                            <NavLink currentView={view} targetView={AppView.MATCHES} onClick={handleSetView}>{t('nav_matches')}</NavLink>
                             {isMdOrSo && (
                                <>
                                    <NavLink currentView={view} targetView={AppView.SHOOTERS} onClick={handleSetView}>{t('nav_shooters')}</NavLink>
                                </>
                            )}
                             {currentUser?.role !== UserRole.MD && <NavLink currentView={view} targetView={AppView.ARMORY} onClick={handleSetView}>{t('nav_armory')}</NavLink>}
                             <NavLink currentView={view} targetView={AppView.EXTERNAL_DIARY} onClick={handleSetView}>{t('nav_external_diary')}</NavLink>
                             <NavLink currentView={view} targetView={AppView.SETTINGS} onClick={handleSetView}>{t('nav_settings')}</NavLink>
                        </nav>
                        <div className="mt-auto p-2">
                             <SyncButton />
                        </div>
                    </div>
                </div>
            </aside>

            <div className="flex flex-col flex-1 w-0 overflow-hidden">
                <header className="relative z-10 flex-shrink-0 flex h-16 bg-gray-800 border-b border-gray-700 shadow-md">
                     <div className="flex-1 px-4 flex justify-between">
                        <div className="flex-1 flex items-center">
                           {!isNetworkOnline && (
                                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded ml-2 md:hidden">OFFLINE</span>
                           )}
                        </div>
                        <div className="ml-4 flex items-center md:ml-6">
                             {/* User Profile Dropdown */}
                            <div className="ml-3 relative">
                                <button onClick={() => setView(AppView.SETTINGS)} className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                                    <span className="sr-only">Open user menu</span>
                                    <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                                         <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                    </div>
                                </button>
                            </div>
                            <button onClick={logOut} className="ml-4 p-1 bg-gray-800 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                                <span className="sr-only">Log out</span>
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                            </button>
                        </div>
                    </div>
                    <div className="-mr-2 flex items-center md:hidden">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} type="button" className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white" aria-controls="mobile-menu" aria-expanded="false">
                            <span className="sr-only">Open main menu</span>
                            <svg className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                            <svg className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </header>
                
                 {/* Mobile menu, show/hide based on menu state. */}
                <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden absolute top-16 inset-x-0 z-20`}>
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800 border-b border-gray-700">
                        <NavLink currentView={view} targetView={AppView.DASHBOARD} onClick={handleMobileClick}>{t('nav_dashboard')}</NavLink>
                        <NavLink currentView={view} targetView={AppView.TIMER} onClick={handleMobileClick}>{t('nav_timer')}</NavLink>
                        <NavLink currentView={view} targetView={AppView.HEAD_TO_HEAD} onClick={handleMobileClick}>{t('nav_head_to_head')}</NavLink>
                        <NavLink currentView={view} targetView={AppView.TRAINING} onClick={handleMobileClick}>{t('nav_training')}</NavLink>
                        <NavLink currentView={view} targetView={AppView.CLASSIFIER} onClick={handleMobileClick}>{t('nav_classifier')}</NavLink>
                        <NavLink currentView={view} targetView={AppView.MATCHES} onClick={handleMobileClick}>{t('nav_matches')}</NavLink>
                         {isMdOrSo && (
                            <>
                                <NavLink currentView={view} targetView={AppView.SHOOTERS} onClick={handleMobileClick}>{t('nav_shooters')}</NavLink>
                            </>
                        )}
                        {currentUser?.role !== UserRole.MD && <NavLink currentView={view} targetView={AppView.ARMORY} onClick={handleMobileClick}>{t('nav_armory')}</NavLink>}
                        <NavLink currentView={view} targetView={AppView.EXTERNAL_DIARY} onClick={handleMobileClick}>{t('nav_external_diary')}</NavLink>
                        <NavLink currentView={view} targetView={AppView.SETTINGS} onClick={handleMobileClick}>{t('nav_settings')}</NavLink>
                         <div className="pt-4 pb-3 border-t border-gray-700">
                             <SyncButton />
                        </div>
                    </div>
                </div>

                <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 md:p-6 pb-20 md:pb-6">
                    {renderView()}
                </main>

                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 flex overflow-x-auto z-50" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <BottomNavLink currentView={view} targetView={AppView.DASHBOARD} onClick={handleSetView} icon={
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
                    } label={t('nav_dashboard')} />
                    <BottomNavLink currentView={view} targetView={AppView.TIMER} onClick={handleSetView} icon={
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    } label={t('nav_timer')} />
                    <BottomNavLink currentView={view} targetView={AppView.HEAD_TO_HEAD} onClick={handleSetView} icon={
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    } label={t('nav_head_to_head')} />
                    <BottomNavLink currentView={view} targetView={AppView.TRAINING} onClick={handleSetView} icon={
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v17.792M6 21V3m12 18V3" /></svg>
                    } label={t('nav_training')} />
                    <BottomNavLink currentView={view} targetView={AppView.MATCHES} onClick={handleSetView} icon={
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    } label={t('nav_matches')} />
                    <BottomNavSyncButton syncStatus={syncStatus} onClick={triggerFullSync} />
                    {currentUser?.role !== UserRole.MD && <BottomNavLink currentView={view} targetView={AppView.ARMORY} onClick={handleSetView} icon={
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"></path></svg>
                    } label={t('nav_armory')} />}
                    <BottomNavLink currentView={view} targetView={AppView.EXTERNAL_DIARY} onClick={handleSetView} icon={
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                    } label={t('nav_external_diary')} />
                    {isMdOrSo && (
                        <BottomNavLink currentView={view} targetView={AppView.SHOOTERS} onClick={handleSetView} icon={
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        } label={t('nav_shooters')} />
                    )}
                </nav>
            </div>
        </div>
    );
};

export default Layout;
