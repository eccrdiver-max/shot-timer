import React, { useState, useMemo } from 'react';
import { Match, IDPADivision, UserRole } from '../../types';
import { calculateMatchResults, FinalScore } from '../../utils/scoring';
import { useI18n } from '../../hooks/useI18n';
import { useAuth } from '../../context/AuthContext';

const LeaderboardPanel: React.FC<{ match: Match; onScoreShooter: (shooterId: string) => void; }> = ({ match, onScoreShooter }) => {
    const { t } = useI18n();
    const { currentUser } = useAuth();
    const [divisionFilter, setDivisionFilter] = useState<IDPADivision | 'all'>('all');

    const results = useMemo(() => calculateMatchResults(match), [match]);

    const filteredResults = useMemo(() => {
        if (divisionFilter === 'all') {
            return results;
        }
        return results.filter(r => r.division === divisionFilter);
    }, [results, divisionFilter]);
    
    const canScore = currentUser?.role === UserRole.MD || currentUser?.role === UserRole.SO;

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                <h2 className="text-xl font-semibold">{t('leaderboard')}</h2>
                <div>
                    <label htmlFor="divisionFilter" className="text-sm mr-2">{t('filter_by_division')}:</label>
                    <select
                        id="divisionFilter"
                        value={divisionFilter}
                        onChange={e => setDivisionFilter(e.target.value as IDPADivision | 'all')}
                        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg p-2"
                    >
                        <option value="all">{t('all_divisions')}</option>
                        {Object.values(IDPADivision).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-700 text-gray-300 uppercase">
                        <tr>
                            <th className="p-3">{divisionFilter === 'all' ? t('rank_overall') : t('rank_division')}</th>
                            <th className="p-3">{t('shooter_label')}</th>
                            <th className="p-3">{t('division')}</th>
                            <th className="p-3 text-right">{t('total_time')}</th>
                            {match.stages.map(stage => <th key={stage.id} className="p-3 text-right">{stage.name}</th>)}
                             {canScore && <th className="p-3"></th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {filteredResults.map(res => (
                            <tr key={res.shooterId}>
                                <td className="p-3 font-bold">{divisionFilter === 'all' ? res.rankOverall : res.rankDivision}</td>
                                <td className="p-3 font-semibold">{res.shooterName}</td>
                                <td className="p-3">{res.division}</td>
                                <td className="p-3 text-right font-mono font-bold text-yellow-400">{res.totalTime.toFixed(2)}</td>
                                {match.stages.map(stage => (
                                    <td key={stage.id} className="p-3 text-right font-mono">{res.stageScores[stage.id]?.toFixed(2) || '0.00'}</td>
                                ))}
                                {canScore && (
                                    <td className="p-3 text-right">
                                        <button onClick={() => onScoreShooter(res.shooterId)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs">{t('score_button')}</button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LeaderboardPanel;
