import React, { useState } from 'react';
import { Session } from '../types';
import { useI18n } from '../hooks/useI18n';
import { exportToCsv } from '../utils/export';
import { useArmory } from '../context/ArmoryContext';

interface DrillHistoryViewProps {
    sessions: Session[];
    drillName: string;
    onClose: () => void;
}

const PrintableReport: React.FC<{ sessions: Session[]; drillName: string; t: Function; getWeaponName: (id: string) => string; }> = ({ sessions, drillName, t, getWeaponName }) => (
    <div className="printable-area hidden print:block">
        <h1 className="text-2xl font-bold mb-2">{t('drill_history_for', { drillName })}</h1>
        <p className="mb-4 text-sm">{t('report_generated_on', { date: new Date().toLocaleString() })}</p>
        <table className="w-full text-left text-xs">
            <thead>
                <tr>
                    <th>{t('session_date')}</th>
                    <th>{t('shooter_label')}</th>
                    <th>{t('weapon')}</th>
                    <th>{t('shots')}</th>
                    <th>{t('total_time')}</th>
                    <th>{t('first_shot')}</th>
                    <th>{t('avg_split')}</th>
                    <th>{t('points_down')}</th>
                    <th>{t('procedurals')}</th>
                    <th>{t('hit_on_non_threat')}</th>
                    <th>{t('shot_details')}</th>
                </tr>
            </thead>
            <tbody>
                {sessions.map(session => {
                    const avgSplit = session.splits.length > 1
                        ? (session.splits.slice(1).reduce((a, b) => a + b, 0) / (session.splits.length - 1)).toFixed(2)
                        : 'N/A';
                    return (
                        <tr key={session.id}>
                            <td>{new Date(session.date).toLocaleString()}</td>
                            <td>{session.shooterName || t('n_a')}</td>
                            <td>{session.weaponId ? getWeaponName(session.weaponId) : t('n_a')}</td>
                            <td>{session.shots.length}</td>
                            <td>{session.totalTime.toFixed(2)}s</td>
                            <td>{session.firstShotTime.toFixed(2)}s</td>
                            <td>{avgSplit}s</td>
                            <td>{session.pointsDown || 0}</td>
                            <td>{session.procedurals || 0}</td>
                            <td>{session.hnt || 0}</td>
                            <td>
                                <ul className="list-disc list-inside">
                                    {session.shots.map((shot, index) => (
                                       <li key={index}>{t('shot')} {index + 1}: {shot.time.toFixed(2)}s ({t('split')}: {session.splits[index].toFixed(2)}s)</li>
                                    ))}
                                </ul>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
);


const DrillHistoryView: React.FC<DrillHistoryViewProps> = ({ sessions, drillName, onClose }) => {
    const { t } = useI18n();
    const { weapons } = useArmory();
    const [visibleCount, setVisibleCount] = useState(10);

    const getWeaponName = (weaponId: string): string => {
        const weapon = weapons.find(w => w.id === weaponId);
        return weapon ? `${weapon.manufacturer} ${weapon.model}` : t('unknown_weapon');
    };

    const handlePrint = () => {
        window.print();
    };
    
    const sortedSessions = [...sessions].sort((a, b) => b.date - a.date);
    const visibleSessions = sortedSessions.slice(0, visibleCount);
    
    const handleExportCsv = () => {
        const headers = [
            "SessionDate", "ShooterName", "DrillName", "Weapon", "SessionTotalTime", 
            "PointsDown", "Procedurals", "HNT", 
            "ShotNumber", "ShotTime", "SplitTime"
        ];
        
        const rows = sortedSessions.flatMap(session => 
            session.shots.map((shot, index) => ({
                SessionDate: new Date(session.date).toISOString(),
                ShooterName: session.shooterName || '',
                DrillName: session.drillName,
                Weapon: session.weaponId ? getWeaponName(session.weaponId) : '',
                SessionTotalTime: session.totalTime.toFixed(2),
                PointsDown: session.pointsDown || 0,
                Procedurals: session.procedurals || 0,
                HNT: session.hnt || 0,
                ShotNumber: index + 1,
                ShotTime: shot.time.toFixed(2),
                SplitTime: session.splits[index].toFixed(2),
            }))
        );

        exportToCsv(`${drillName.replace(/\s+/g, '_')}_history.csv`, rows, headers);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 no-print" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl shadow-xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-yellow-400">{t('drill_history_for', { drillName })}</h2>
                        <p className="text-gray-400">{t('total_sessions')}: {sortedSessions.length}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={handleExportCsv} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">{t('export_csv_button')}</button>
                        <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">{t('print_report')}</button>
                        <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
                    </div>
                </div>

                <div className="overflow-y-auto flex-grow pr-2">
                    {visibleSessions.length > 0 ? (
                        <div className="space-y-4">
                            {visibleSessions.map(session => {
                                const avgSplit = session.splits.length > 1
                                    ? (session.splits.slice(1).reduce((a, b) => a + b, 0) / (session.splits.length - 1)).toFixed(2)
                                    : 'N/A';
                                const hasPenalties = (session.pointsDown || 0) + (session.procedurals || 0) + (session.hnt || 0) > 0;
                                
                                return (
                                    <div key={session.id} className="bg-gray-700 rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <div>
                                                <p className="font-semibold">{new Date(session.date).toLocaleString()}</p>
                                                <div className="text-sm text-gray-400 flex gap-4">
                                                    {session.shooterName && <span>{t('shooter_label')}: {session.shooterName}</span>}
                                                    {session.weaponId && <span>{t('weapon')}: {getWeaponName(session.weaponId)}</span>}
                                                </div>
                                            </div>
                                             <div className="grid grid-cols-3 gap-4 text-center text-sm">
                                                <div className="bg-gray-800 p-2 rounded">
                                                    <div className="text-xs text-gray-400">{t('total_time')}</div>
                                                    <div className="font-bold">{session.totalTime.toFixed(2)}s</div>
                                                </div>
                                                <div className="bg-gray-800 p-2 rounded">
                                                    <div className="text-xs text-gray-400">{t('first_shot')}</div>
                                                    <div className="font-bold">{session.firstShotTime.toFixed(2)}s</div>
                                                </div>
                                                <div className="bg-gray-800 p-2 rounded">
                                                    <div className="text-xs text-gray-400">{t('avg_split')}</div>
                                                    <div className="font-bold">{avgSplit}s</div>
                                                </div>
                                            </div>
                                        </div>

                                        {hasPenalties && (
                                            <div className="grid grid-cols-3 gap-2 text-center text-xs bg-gray-600 p-2 rounded mb-3">
                                                <div><span className="text-gray-400">{t('points_down')}:</span> <span className="font-semibold">{session.pointsDown || 0}</span></div>
                                                <div><span className="text-gray-400">{t('procedurals')}:</span> <span className="font-semibold">{session.procedurals || 0}</span></div>
                                                <div><span className="text-gray-400">{t('hit_on_non_threat')}:</span> <span className="font-semibold">{session.hnt || 0}</span></div>
                                            </div>
                                        )}
                                       
                                        <div className="overflow-x-auto">
                                             <table className="w-full text-sm text-left">
                                                <thead className="text-xs text-gray-400 uppercase bg-gray-600">
                                                    <tr>
                                                        <th className="p-2">{t('shot')} #</th>
                                                        <th className="p-2">{t('time')} (s)</th>
                                                        <th className="p-2">{t('split')} (s)</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-600">
                                                    {session.shots.map((shot, index) => (
                                                        <tr key={index}>
                                                            <td className="p-2">{index + 1}</td>
                                                            <td className="p-2 font-mono">{shot.time.toFixed(2)}</td>
                                                            <td className="p-2 font-mono">{session.splits[index].toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })}
                             {sortedSessions.length > visibleCount && (
                                <div className="text-center mt-4">
                                    <button 
                                        onClick={() => setVisibleCount(prev => prev + 10)} 
                                        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg"
                                    >
                                        {t('show_more')}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                         <p className="text-center text-gray-500 py-8">{t('no_sessions_for_drill')}</p>
                    )}
                </div>
            </div>
             {/* Printable Report Component - hidden by default */}
            <PrintableReport sessions={sortedSessions} drillName={drillName} t={t} getWeaponName={getWeaponName} />
        </div>
    );
};

export default DrillHistoryView;