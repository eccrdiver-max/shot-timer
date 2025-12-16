import React, { useMemo } from 'react';
import { Session } from '../types';
import { useI18n } from '../hooks/useI18n';
import { useArmory } from '../context/ArmoryContext';

interface DrillWeaponComparisonProps {
    sessions: Session[];
    drillName: string;
}

const DrillWeaponComparison: React.FC<DrillWeaponComparisonProps> = ({ sessions, drillName }) => {
    const { t } = useI18n();
    const { weapons } = useArmory();

    const comparisonData = useMemo(() => {
        const drillSessions = sessions.filter(s => s.drillName === drillName && s.weaponId);

        const dataByWeapon = drillSessions.reduce((acc, session) => {
            if (!session.weaponId) return acc;
            if (!acc[session.weaponId]) {
                acc[session.weaponId] = [];
            }
            acc[session.weaponId].push(session);
            return acc;
        }, {} as Record<string, Session[]>);

        // FIX: Explicitly type the destructured array to resolve 'unknown' type errors on `weaponSessions`.
        return Object.entries(dataByWeapon).map(([weaponId, weaponSessions]: [string, Session[]]) => {
            const weapon = weapons.find(w => w.id === weaponId);
            const totalTimes = weaponSessions.map(s => s.totalTime);
            const firstShotTimes = weaponSessions.map(s => s.firstShotTime);

            return {
                weaponId,
                weaponName: weapon ? `${weapon.manufacturer} ${weapon.model}` : t('unknown_weapon'),
                sessionCount: weaponSessions.length,
                bestTime: Math.min(...totalTimes),
                avgTime: totalTimes.reduce((a, b) => a + b, 0) / totalTimes.length,
                avgFirstShot: firstShotTimes.reduce((a, b) => a + b, 0) / firstShotTimes.length,
            };
        }).sort((a,b) => a.avgTime - b.avgTime);

    }, [sessions, drillName, weapons, t]);

    if (comparisonData.length < 2) {
        return null; // Don't show the component if there's nothing to compare
    }

    return (
        <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-yellow-400 mb-4">{t('drill_weapon_comparison_title', { drillName })}</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-700 text-gray-300 uppercase">
                        <tr>
                            <th className="p-3">{t('weapon')}</th>
                            <th className="p-3 text-center">{t('sessions')}</th>
                            <th className="p-3 text-right">{t('best_time')}</th>
                            <th className="p-3 text-right">{t('avg_time')}</th>
                            <th className="p-3 text-right">{t('avg_first_shot')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {comparisonData.map(data => (
                            <tr key={data.weaponId}>
                                <td className="p-3 font-semibold">{data.weaponName}</td>
                                <td className="p-3 text-center">{data.sessionCount}</td>
                                <td className="p-3 text-right font-mono">{data.bestTime.toFixed(2)}s</td>
                                <td className="p-3 text-right font-mono">{data.avgTime.toFixed(2)}s</td>
                                <td className="p-3 text-right font-mono">{data.avgFirstShot.toFixed(2)}s</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DrillWeaponComparison;