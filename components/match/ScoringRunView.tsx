import React, { useState, useEffect, useMemo } from 'react';
import { Match, Score } from '../../types';
import { useP2P } from '../../context/P2PContext';
import { useNotification } from '../../context/NotificationContext';
import { useMatchContext } from '../../context/MatchContext';
import { useI18n } from '../../hooks/useI18n';

interface ScoringRunViewProps {
    match: Match;
    context: { shooterId: string; stageId: string };
    onFinish: () => void;
}

const ScoringRunView: React.FC<ScoringRunViewProps> = ({ match, context, onFinish }) => {
    const { broadcast } = useP2P();
    const { updateMatch } = useMatchContext();
    const { addNotification } = useNotification();
    const { t } = useI18n();
    
    const [score, setScore] = useState<Omit<Score, 'shooterId' | 'stageId' | 'updatedAt'>>({
        time: 0,
        pointsDown: 0,
        procedurals: 0,
        h_n_t: 0,
    });
    
    const shooter = useMemo(() => match.shooters.find(s => s.id === context.shooterId), [match.shooters, context.shooterId]);
    const stage = useMemo(() => match.stages.find(s => s.id === context.stageId), [match.stages, context.stageId]);

    useEffect(() => {
        const existingScore = match.scores.find(s => s.shooterId === context.shooterId && s.stageId === context.stageId);
        if (existingScore) {
            const { shooterId, stageId, updatedAt, ...rest } = existingScore;
            setScore(rest);
        }
    }, [match.scores, context.shooterId, context.stageId]);

    const handleScoreChange = (field: keyof typeof score, value: string) => {
        const numValue = parseFloat(value);
        if (value === '' || (!isNaN(numValue) && numValue >= 0)) {
            setScore(prev => ({ ...prev, [field]: value === '' ? 0 : numValue }));
        }
    };
    
    const handleSaveScore = async () => {
        if (!shooter || !stage) return;
        
        const newScore: Score = {
            time: score.time || 0,
            pointsDown: score.pointsDown || 0,
            procedurals: score.procedurals || 0,
            h_n_t: score.h_n_t || 0,
            shooterId: shooter.id,
            stageId: stage.id,
            updatedAt: Date.now()
        };
        
        await broadcast({ type: 'SCORE_UPDATE', payload: newScore });
        addNotification(t('score_saved_notification', { shooterName: shooter.name, stageName: stage.name }), "success");
        onFinish();
    };

    if (!shooter || !stage) {
        return (
            <div>
                <p>{t('error_shooter_or_stage_not_found')}</p>
                <button onClick={onFinish}>{t('back_button')}</button>
            </div>
        );
    }
    
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-yellow-400">{t('scoring_title')}</h1>
                <p className="text-xl text-gray-300">{shooter.name}</p>
                <p className="text-lg text-gray-400">{t('stage')}: {stage.name}</p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="time" className="block mb-2 text-lg font-medium text-gray-300">{t('time')}</label>
                    <input id="time" type="number" step="0.01" value={score.time} onChange={e => handleScoreChange('time', e.target.value)} className="bg-gray-700 border border-gray-600 text-white text-3xl rounded-lg block w-full p-2.5" autoFocus/>
                </div>
                <div>
                    <label htmlFor="pointsDown" className="block mb-2 text-lg font-medium text-gray-300">{t('points_down')}</label>
                    <input id="pointsDown" type="number" step="1" value={score.pointsDown} onChange={e => handleScoreChange('pointsDown', e.target.value)} className="bg-gray-700 border border-gray-600 text-white text-3xl rounded-lg block w-full p-2.5" />
                </div>
                <div>
                    <label htmlFor="procedurals" className="block mb-2 text-lg font-medium text-gray-300">{t('procedurals')}</label>
                    <input id="procedurals" type="number" step="1" value={score.procedurals} onChange={e => handleScoreChange('procedurals', e.target.value)} className="bg-gray-700 border border-gray-600 text-white text-3xl rounded-lg block w-full p-2.5" />
                </div>
                <div>
                    <label htmlFor="hnt" className="block mb-2 text-lg font-medium text-gray-300">{t('hit_on_non_threat')}</label>
                    <input id="hnt" type="number" step="1" value={score.h_n_t} onChange={e => handleScoreChange('h_n_t', e.target.value)} className="bg-gray-700 border border-gray-600 text-white text-3xl rounded-lg block w-full p-2.5" />
                </div>
            </div>

            <div className="flex justify-center gap-4 pt-4">
                <button onClick={onFinish} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg">{t('cancel_button')}</button>
                <button onClick={handleSaveScore} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg">{t('save_score_button')}</button>
            </div>
        </div>
    );
};

export default ScoringRunView;
