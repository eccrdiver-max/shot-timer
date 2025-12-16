import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTrainingContext } from '../context/TrainingContext';
import { useMatchContext } from '../context/MatchContext';
import { useI18n } from '../hooks/useI18n';
import { AppView, Session, UserRole } from '../types';
import { useAppContext } from '../context/AppContext';
import { useArmory } from '../context/ArmoryContext';
import DashboardFilters from './DashboardFilters';
import PenaltiesChart from './PenaltiesChart';
import DrillWeaponComparison from './DrillWeaponComparison';
import MDDashboardView from './MDDashboardView';

const StatCard: React.FC<{ title: string; value: string | number; description: string }> = ({ title, value, description }) => (
    <div className="bg-gray-800 p-6 rounded-lg text-center">
        <h3 className="text-lg font-semibold text-gray-400">{title}</h3>
        <p className="text-4xl font-bold text-yellow-400 my-2">{value}</p>
        <p className="text-sm text-gray-500">{description}</p>
    </div>
);


const DashboardView: React.FC = () => {
    const { currentUser } = useAuth();
    const { sessions, drills } = useTrainingContext();
    const { matches } = useMatchContext();
    const { weapons } = useArmory();
    const { setView } = useAppContext();
    const { t } = useI18n();
    const [filters, setFilters] = useState<{ drill: string; weapon: string }>({ drill: 'all', weapon: 'all' });
    
    // MD/SO View
    if (currentUser?.role === UserRole.MD || currentUser?.role === UserRole.SO) {
        return <MDDashboardView />;
    }
    
    // Standard User View
    const filteredSessions = useMemo(() => {
        return sessions.filter(session => {
            const drillMatch = filters.drill === 'all' || session.drillName === filters.drill;
            const weaponMatch = filters.weapon === 'all' || session.weaponId === filters.weapon;
            return drillMatch && weaponMatch;
        });
    }, [sessions, filters]);

    const totalShotsFired = filteredSessions.reduce((acc, s) => acc + s.shots.length, 0);
    const uniqueDrills = new Set(filteredSessions.map(s => s.drillName)).size;
    
    const handleFilterChange = (newFilters: { drill: string; weapon: string }) => {
        setFilters(newFilters);
    };

    // Onboarding view for new users
    if (sessions.length === 0) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-yellow-400">{t('dashboard_onboarding_title')}</h1>
                    <p className="text-lg text-gray-300">{t('dashboard_welcome_subtitle', { email: currentUser?.email || 'User' })}</p>
                </div>
                <div className="text-center bg-gray-800 rounded-lg p-10">
                    <p className="text-lg text-gray-400 mb-8">{t('dashboard_onboarding_body')}</p>
                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                        <button onClick={() => setView(AppView.TIMER)} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-4 px-6 rounded-lg text-lg transition-transform transform hover:scale-105">
                           {t('dashboard_onboarding_action_timer')}
                        </button>
                        <button onClick={() => setView(AppView.TRAINING)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition-transform transform hover:scale-105">
                           {t('dashboard_onboarding_action_drill')}
                        </button>
                         <button onClick={() => setView(AppView.ARMORY)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-transform transform hover:scale-105">
                           {t('dashboard_onboarding_action_armory')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Standard dashboard view
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-yellow-400">{t('dashboard_welcome_title')}</h1>
                <p className="text-lg text-gray-300">{t('dashboard_welcome_subtitle', { email: currentUser?.email || 'User' })}</p>
            </div>

            <DashboardFilters drills={drills} weapons={weapons} onFilterChange={handleFilterChange} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={t('total_training_sessions')} value={filteredSessions.length} description={t('dashboard_sessions_desc')} />
                <StatCard title={t('total_shots_fired')} value={totalShotsFired.toLocaleString()} description={t('dashboard_shots_desc')} />
                <StatCard title={t('unique_drills_practiced')} value={uniqueDrills} description={t('dashboard_drills_desc')} />
                <StatCard title={t('matches_participated')} value={matches.length} description={t('dashboard_matches_desc')} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <PenaltiesChart sessions={filteredSessions} />
                 {filters.drill !== 'all' && <DrillWeaponComparison sessions={sessions} drillName={filters.drill} />}
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-2xl font-semibold text-yellow-400 mb-4">{t('quick_actions')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                     <button onClick={() => setView(AppView.TIMER)} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-4 rounded-lg flex flex-col items-center justify-center">
                        <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>{t('start_timer')}</span>
                    </button>
                    <button onClick={() => setView(AppView.HEAD_TO_HEAD)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-3xl mb-1">🎯🎯</span>
                        <span>{t('nav_head_to_head')}</span>
                    </button>
                     <button onClick={() => setView(AppView.TRAINING)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-3xl mb-1">🎯</span>
                        <span>{t('view_training')}</span>
                    </button>
                    <button onClick={() => setView(AppView.MATCHES)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg flex flex-col items-center justify-center">
                        <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>{t('view_matches')}</span>
                    </button>
                     <button onClick={() => setView(AppView.CLASSIFIER)} className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-3xl mb-1">🏅</span>
                        <span>{t('view_classifiers')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;