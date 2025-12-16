import React from 'react';
import { Match, Shooter } from '../../types';
import { calculateIDPAScore } from '../../utils/scoring';
import { useI18n } from '../../hooks/useI18n';

interface ShooterScoringPanelProps {
    match: Match;
    shooter: Shooter;
    onStartScoring: (shooterId: string, stageId: string) => void;
    onBack: () => void;
}

const ShooterScoringPanel: React.FC<ShooterScoringPanelProps> = ({ match, shooter, onStartScoring, onBack }) => {
    const { t } = useI18n();

    return (
        <div className="space-y-6">
             <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-yellow-400">{t('scoring_for', { shooterName: shooter.name })}</h1>
                    <p className="text-gray-400">{shooter.division} - {shooter.classification}</p>
                </div>
                <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg self-start md:self-auto">
                    &larr; {t('back_to_leaderboard')}
                </button>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">{t('stages')}</h2>
                <ul className="space-y-2">
                    {match.stages.map(stage => {
                        const score = match.scores.find(s => s.shooterId === shooter.id && s.stageId === stage.id);
                        const totalStageTime = score ? calculateIDPAScore(score) : null;

                        return (
                            <li key={stage.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                                <div>
                                    <p className="font-bold text-lg">{stage.name}</p>
                                    <p className="text-sm text-gray-400 font-mono">
                                        {totalStageTime !== null ? `${t('total')}: ${totalStageTime.toFixed(2)}s` : t('not_scored')}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => onStartScoring(shooter.id, stage.id)} 
                                    className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded-lg whitespace-nowrap"
                                >
                                    {score ? t('edit_score') : t('score_stage')}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default ShooterScoringPanel;