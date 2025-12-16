import React, { useState } from 'react';
import { Match, Stage } from '../../types';
import { useModal } from '../../context/ModalContext';
import { useI18n } from '../../hooks/useI18n';

interface StagesPanelProps {
    match: Match;
    onUpdate: (match: Match) => void;
}

const StagesPanel: React.FC<StagesPanelProps> = ({ match, onUpdate }) => {
    const [newStageName, setNewStageName] = useState('');
    const { showConfirmation } = useModal();
    const { t } = useI18n();

    const handleAddStage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newStageName.trim()) return;
        const newStage: Stage = { id: crypto.randomUUID(), name: newStageName.trim() };
        onUpdate({ ...match, stages: [...match.stages, newStage] });
        setNewStageName('');
    };

    const handleDeleteStage = (stage: Stage) => {
        showConfirmation(
            t('delete_stage_title'),
            t('delete_stage_body', { stageName: stage.name }),
            () => {
                const updatedMatch = {
                    ...match,
                    stages: match.stages.filter(s => s.id !== stage.id),
                    scores: match.scores.filter(s => s.stageId !== stage.id),
                };
                onUpdate(updatedMatch);
            }
        );
    };
    
    return (
         <div>
            <h2 className="text-xl font-semibold mb-4">{t('stage_management_title')}</h2>
            <ul className="space-y-2 mb-4">
                {match.stages.map(s => (
                    <li key={s.id} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                        <span>{s.name}</span>
                        <button onClick={() => handleDeleteStage(s)} className="text-red-500 hover:text-red-400 font-bold">✕</button>
                    </li>
                ))}
            </ul>
            <form onSubmit={handleAddStage} className="flex gap-2">
                <input value={newStageName} onChange={e => setNewStageName(e.target.value)} placeholder={t('new_stage_name_placeholder')} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5" />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">{t('add_button')}</button>
            </form>
        </div>
    );
};

export default StagesPanel;