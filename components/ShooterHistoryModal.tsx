import React, { useMemo, useState } from 'react';
import { Shooter, Session } from '../types';
import { useTrainingContext } from '../context/TrainingContext';
import { useI18n } from '../hooks/useI18n';
import { useArmory } from '../context/ArmoryContext';
import DrillProgressChart from './DrillProgressChart';

interface ShooterHistoryModalProps {
    shooter: Shooter;
    onClose: () => void;
}

const ShooterHistoryModal: React.FC<ShooterHistoryModalProps> = ({ shooter, onClose }) => {
    const { sessions } = useTrainingContext();
    const { weapons } = useArmory();
    const { t } = useI18n();

    const [selectedDrill, setSelectedDrill] = useState<string>('all');
    const [showChart, setShowChart] = useState(false);

    const shooterSessions = useMemo(() => {
        return sessions
            .filter(s => s.shooterId === shooter.id)
            .sort((a, b) => b.date - a.date);
    }, [sessions, shooter.id]);

    const uniqueDrills = useMemo(() => {
        return Array.from(new Set(shooterSessions.map(s => s.drillName))).sort();
    }, [shooterSessions]);

    const filteredSessions = useMemo(() => {
        if (selectedDrill === 'all') return shooterSessions;
        return shooterSessions.filter(s => s.drillName === selectedDrill);
    }, [shooterSessions, selectedDrill]);

    const getWeaponName = (weaponId: string): string => {
        const weapon = weapons.find(w => w.id === weaponId);
        return weapon ? `${weapon.manufacturer} ${weapon.model}` : t('unknown_weapon');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl shadow-xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-yellow-400">{t('training_history_for', { shooterName: shooter.name })}</h2>
                        <p className="text-gray-400">{shooter.division} - {shooter.classification}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
                </div>

                {/* Filters */}
                {shooterSessions.length > 0 && (
                    <div className="mb-4 bg-gray-700 p-3 rounded-lg flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                        <div className="flex-grow w-full">
                            <label htmlFor="modalDrillFilter" className="block text-xs font-medium text-gray-300 mb-1">{t('filter_by_drill')}</label>
                            <select
                                id="modalDrillFilter"
                                value={selectedDrill}
                                onChange={(e) => setSelectedDrill(e.target.value)}
                                className="bg-gray-600 border border-gray-500 text-white text-sm rounded-lg block w-full p-2"
                            >
                                <option value="all">{t('all_drills')}</option>
                                {uniqueDrills.map(drill => (
                                    <option key={drill} value={drill}>{drill}</option>
                                ))}
                            </select>
                        </div>
                        {selectedDrill !== 'all' && filteredSessions.length >= 2 && (
                            <button 
                                onClick={() => setShowChart(true)}
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
                                {t('view_chart')}
                            </button>
                        )}
                    </div>
                )}
                
                <div className="overflow-y-auto flex-grow pr-2">
                    {filteredSessions.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            <p>{t('no_sessions_for_shooter')}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredSessions.map(session => (
                                <div key={session.id} className="bg-gray-700 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-xl font-semibold">{session.drillName}</h3>
                                            <p className="text-sm text-gray-400">{new Date(session.date).toLocaleString()}</p>
                                            {session.weaponId && <p className="text-xs text-gray-500">{t('weapon')}: {getWeaponName(session.weaponId)}</p>}
                                        </div>
                                        <div className="text-right">
                                            <p><span className="text-gray-400 text-sm">{t('total_time')}:</span> <span className="font-bold font-mono">{session.totalTime.toFixed(2)}s</span></p>
                                            <p><span className="text-gray-400 text-sm">{t('first_shot')}:</span> <span className="font-mono">{session.firstShotTime.toFixed(2)}s</span></p>
                                        </div>
                                    </div>
                                    <details className="bg-gray-600 rounded p-2">
                                        <summary className="cursor-pointer text-sm text-gray-300">{t('show_shot_details')}</summary>
                                        <table className="w-full text-sm text-left mt-2">
                                            <thead className="text-xs text-gray-400 uppercase bg-gray-500">
                                                <tr>
                                                    <th className="p-2">{t('shot')} #</th>
                                                    <th className="p-2">{t('time')} (s)</th>
                                                    <th className="p-2">{t('split')} (s)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-500">
                                                {session.shots.map((shot, index) => (
                                                    <tr key={index}>
                                                        <td className="p-2">{index + 1}</td>
                                                        <td className="p-2 font-mono">{shot.time.toFixed(2)}</td>
                                                        <td className="p-2 font-mono">{session.splits[index].toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </details>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            {showChart && selectedDrill !== 'all' && (
                <DrillProgressChart 
                    sessions={filteredSessions} 
                    drillName={selectedDrill} 
                    onClose={() => setShowChart(false)} 
                />
            )}
        </div>
    );
};

export default ShooterHistoryModal;