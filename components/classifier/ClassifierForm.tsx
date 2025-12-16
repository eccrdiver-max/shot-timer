import React, { useState, useMemo } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useClassifier } from '../../context/ClassifierContext';
import { useShooterContext } from '../../context/ShooterContext';
import { ClassifierStageScore, ClassifierAttempt, IDPAClassification } from '../../types';
import { availableClassifiers, calculateClassifierScore, determineClassification, ClassifierInfo, ClassifierStage } from '../../utils/classifier';

const Spinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

interface ClassifierFormProps {
    onCancel: () => void;
}

const ClassifierForm: React.FC<ClassifierFormProps> = ({ onCancel }) => {
    const { t } = useI18n();
    const { addAttempt } = useClassifier();
    const { shooters } = useShooterContext();
    
    const [classifierId, setClassifierId] = useState<string>(availableClassifiers[0].id);
    const [shooterId, setShooterId] = useState<string>('');
    const [stageScores, setStageScores] = useState<Record<string, ClassifierStageScore>>({});
    const [isSaving, setIsSaving] = useState(false);

    const selectedClassifier = useMemo(() => {
        return availableClassifiers.find(c => c.id === classifierId) as ClassifierInfo;
    }, [classifierId]);

    const handleScoreChange = (stageId: string, field: keyof ClassifierStageScore, value: string) => {
        const numValue = parseFloat(value);
        if (value === '' || (!isNaN(numValue) && numValue >= 0)) {
            setStageScores(prev => ({
                ...prev,
                [stageId]: {
                    ...prev[stageId],
                    [field]: value === '' ? 0 : numValue,
                }
            }));
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const shooter = shooters.find(s => s.id === shooterId);
        if (!shooter || Object.keys(stageScores).length !== selectedClassifier.stages.length) {
            alert(t('alert_fill_all_fields'));
            return;
        }

        setIsSaving(true);
        try {
            const totalTime = calculateClassifierScore(stageScores);
            const classification = determineClassification(classifierId, totalTime);

            const newAttempt: Omit<ClassifierAttempt, 'id' | 'date'> = {
                shooterId,
                shooterName: shooter.name,
                classifierId,
                stageScores,
                totalTime,
                classification,
                finalPercent: 0, // Not used yet
            };
            
            await addAttempt(newAttempt);
            onCancel(); // Close form on success
        } catch (error) {
            console.error("Failed to save classifier attempt", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">{t('add_new_attempt')}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="classifierSelect" className="block text-sm font-medium text-gray-300">{t('classifier_label')}</label>
                        <select id="classifierSelect" value={classifierId} onChange={e => setClassifierId(e.target.value)} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5 mt-1">
                            {availableClassifiers.map(c => <option key={c.id} value={c.id}>{t(c.nameKey)}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="shooterSelect" className="block text-sm font-medium text-gray-300">{t('shooter_label')}</label>
                        <select id="shooterSelect" value={shooterId} onChange={e => setShooterId(e.target.value)} required className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5 mt-1">
                            <option value="">{t('select_shooter_option')}</option>
                            {shooters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-300 border-b border-gray-700 pb-2">{t('stage_scores')}</h3>
                    {selectedClassifier.stages.map((stage: ClassifierStage) => (
                        <div key={stage.id} className="bg-gray-700 p-4 rounded-lg">
                            <h4 className="font-semibold text-yellow-400 mb-2">{t(stage.nameKey)}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400">{t('time')}</label>
                                    <input type="number" step="0.01" min="0" value={stageScores[stage.id]?.time || ''} onChange={e => handleScoreChange(stage.id, 'time', e.target.value)} required className="bg-gray-600 border border-gray-500 text-white text-sm rounded-lg block w-full p-2.5 mt-1" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400">{t('points_down')}</label>
                                    <input type="number" step="1" min="0" value={stageScores[stage.id]?.pointsDown || ''} onChange={e => handleScoreChange(stage.id, 'pointsDown', e.target.value)} required className="bg-gray-600 border border-gray-500 text-white text-sm rounded-lg block w-full p-2.5 mt-1" />
                                </div>
                                 <div>
                                    <label className="block text-xs font-medium text-gray-400">{t('procedurals')}</label>
                                    <input type="number" step="1" min="0" value={stageScores[stage.id]?.procedurals || ''} onChange={e => handleScoreChange(stage.id, 'procedurals', e.target.value)} className="bg-gray-600 border border-gray-500 text-white text-sm rounded-lg block w-full p-2.5 mt-1" />
                                </div>
                                 <div>
                                    <label className="block text-xs font-medium text-gray-400">{t('hit_on_non_threat')}</label>
                                    <input type="number" step="1" min="0" value={stageScores[stage.id]?.hnt || ''} onChange={e => handleScoreChange(stage.id, 'hnt', e.target.value)} className="bg-gray-600 border border-gray-500 text-white text-sm rounded-lg block w-full p-2.5 mt-1" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-4 pt-2">
                    <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">{t('cancel_button')}</button>
                    <button type="submit" disabled={isSaving} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded-lg flex items-center justify-center disabled:bg-yellow-700">
                        {isSaving ? <><Spinner />{t('saving_button')}</> : t('save_attempt_button')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ClassifierForm;
