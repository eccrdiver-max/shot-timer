import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShooterContext } from '../context/ShooterContext';
import { useTrainingContext } from '../context/TrainingContext';
import { useI18n } from '../hooks/useI18n';
import { Shooter } from '../types';
import ShooterHistoryModal from './ShooterHistoryModal';

const StatCard: React.FC<{ title: string; value: string | number; description: string }> = ({ title, value, description }) => (
    <div className="bg-gray-800 p-6 rounded-lg text-center">
        <h3 className="text-lg font-semibold text-gray-400">{title}</h3>
        <p className="text-4xl font-bold text-yellow-400 my-2">{value}</p>
        <p className="text-sm text-gray-500">{description}</p>
    </div>
);

const MDDashboardView: React.FC = () => {
    const { currentUser } = useAuth();
    const { shooters, clubs } = useShooterContext();
    const { sessions } = useTrainingContext();
    const { t } = useI18n();

    const [expandedClubs, setExpandedClubs] = useState<Set<string>>(new Set());
    const [viewingShooter, setViewingShooter] = useState<Shooter | null>(null);

    const totalRecordedSessions = sessions.length;
    const totalRecordedShots = sessions.reduce((acc, s) => acc + s.shots.length, 0);

    const shootersByClub = useMemo(() => {
        const map = new Map<string, Shooter[]>();
        shooters.forEach(s => {
            const list = map.get(s.clubId) || [];
            list.push(s);
            map.set(s.clubId, list);
        });
        return map;
    }, [shooters]);
    
    const toggleClub = (clubId: string) => {
        setExpandedClubs(prev => {
            const newSet = new Set(prev);
            if (newSet.has(clubId)) {
                newSet.delete(clubId);
            } else {
                newSet.add(clubId);
            }
            return newSet;
        });
    };

    const getShooterSessionCount = (shooterId: string) => {
        return sessions.filter(s => s.shooterId === shooterId).length;
    };

    return (
        <>
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-yellow-400">{t('md_dashboard_title')}</h1>
                    <p className="text-lg text-gray-300">{t('md_dashboard_subtitle')}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title={t('total_managed_shooters')} value={shooters.length} description={t('nav_shooters')} />
                    <StatCard title={t('total_managed_clubs')} value={clubs.length} description={t('clubs')} />
                    <StatCard title={t('total_recorded_sessions')} value={totalRecordedSessions.toLocaleString()} description={t('dashboard_sessions_desc')} />
                    <StatCard title={t('total_shots_fired')} value={totalRecordedShots.toLocaleString()} description={t('dashboard_shots_desc')} />
                </div>
                
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-2xl font-semibold text-yellow-400 mb-4">{t('club_overview')}</h2>
                    <div className="space-y-4">
                        {clubs.map(club => {
                            const clubShooters = shootersByClub.get(club.id) || [];
                            const isExpanded = expandedClubs.has(club.id);
                            return (
                                <div key={club.id} className="bg-gray-700 rounded-lg">
                                    <button onClick={() => toggleClub(club.id)} className="w-full flex justify-between items-center p-4 text-left">
                                        <div>
                                            <h3 className="text-xl font-bold text-yellow-400">{club.name}</h3>
                                            <p className="text-sm text-gray-400">{t('shooters_in_club', { count: clubShooters.length })}</p>
                                        </div>
                                        <svg className={`w-6 h-6 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </button>
                                    {isExpanded && (
                                        <div className="p-4 border-t border-gray-600">
                                            {clubShooters.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {clubShooters.map(shooter => (
                                                        <li key={shooter.id} className="flex justify-between items-center bg-gray-600 p-3 rounded">
                                                            <div>
                                                                <p className="font-semibold">{shooter.name}</p>
                                                                <p className="text-xs text-gray-400">{t('sessions_for_shooter', { count: getShooterSessionCount(shooter.id) })}</p>
                                                            </div>
                                                            <button onClick={() => setViewingShooter(shooter)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm">
                                                                {t('view_full_history')}
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-gray-500 text-center">{t('no_shooters_in_club')}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            {viewingShooter && <ShooterHistoryModal shooter={viewingShooter} onClose={() => setViewingShooter(null)} />}
        </>
    );
};

export default MDDashboardView;