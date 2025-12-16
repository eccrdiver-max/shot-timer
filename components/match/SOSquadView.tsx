import React from 'react';
import { Match, Squad, Shooter } from '../../types';
import { calculateIDPAScore } from '../../utils/scoring';
import { useI18n } from '../../hooks/useI18n';

interface SOSquadViewProps {
    match: Match;
    squad: Squad;
    onStartScoring: (shooterId: string, stageId: string) => void;
    onBack: () => void;
}

const SOSquadView: React.FC<SOSquadViewProps> = ({ match, squad, onStartScoring, onBack }) => {
    const squadShooters = match.shooters.filter(s => squad.shooterIds.includes(s.id));
    const { t } = useI18n();
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-yellow-400">{match.name}</h1>
                    <p className="text-xl text-gray-300">{t('scoring_squad')}: <span className="font-semibold">{squad.name}</span></p>
                </div>
                <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg self-start md:self-auto">
                    &larr; {t('back_to_match_list')}
                </button>
            </div>
            
            <p className="text-gray-400">{t('so_squad_view_instructions')}</p>
            
            <div className="space-y-4">
                {squadShooters.map(shooter => (
                    <div key={shooter.id} className="bg-gray-800 rounded-lg p-4">
                        <h2 className="text-2xl font-semibold text-yellow-400 mb-3">{shooter.name}</h2>
                         <ul className="space-y-2">
                            {match.stages.map(stage => {
                                const score = match.scores.find(s => s.shooterId === shooter.id && s.stageId === stage.id);
                                const totalStageTime = score ? calculateIDPAScore(score) : null;

                                return (
                                    <li key={stage.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                                        <div>
                                            <p className="font-bold">{stage.name}</p>
                                            <p className="text-sm text-gray-400 font-mono">
                                                {totalStageTime !== null ? `${t('total')}: ${totalStageTime.toFixed(2)}s` : t('not_scored')}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => onStartScoring(shooter.id, stage.id)} 
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg whitespace-nowrap"
                                        >
                                            {score ? t('edit_score') : t('score_stage')}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SOSquadView;