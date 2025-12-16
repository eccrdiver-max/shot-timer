import React, { useState } from 'react';
import { Match, Stage, Shooter, IDPADivision, IDPAClassification } from '../../types';
import { useShooterContext } from '../../context/ShooterContext';
import ImportShootersModal from './ImportShootersModal';
import { useI18n } from '../../hooks/useI18n';

interface MatchCreationWizardProps {
    onFinish: (newMatch: Match) => void;
    onCancel: () => void;
}

const MatchCreationWizard: React.FC<MatchCreationWizardProps> = ({ onFinish, onCancel }) => {
    const { t } = useI18n();
    const { shooters: globalShooters, clubs } = useShooterContext();
    const [isImporting, setIsImporting] = useState(false);

    const [matchName, setMatchName] = useState('');
    const [stages, setStages] = useState<Stage[]>([]);
    const [newStageName, setNewStageName] = useState('');
    const [shooters, setShooters] = useState<Shooter[]>([]);

    const [newShooterName, setNewShooterName] = useState('');
    const [newShooterDivision, setNewShooterDivision] = useState<IDPADivision>(IDPADivision.SSP);
    const [newShooterClassification, setNewShooterClassification] = useState<IDPAClassification>(IDPAClassification.NOVICE);

    const handleAddStage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newStageName.trim()) {
            setStages([...stages, { id: crypto.randomUUID(), name: newStageName.trim() }]);
            setNewStageName('');
        }
    };

    const handleAddShooter = (e: React.FormEvent) => {
        e.preventDefault();
        if (newShooterName.trim()) {
            alert(t('add_shooter_from_global_list_alert'));
            return;
        }
    };
    
    const handleRemoveShooter = (id: string) => {
        setShooters(prev => prev.filter(s => s.id !== id));
    };

    const handleImportShooters = (importedShooters: Shooter[]) => {
        const existingShooterIds = new Set(shooters.map(s => s.id));
        const newShooters = importedShooters.filter(s => !existingShooterIds.has(s.id));
        setShooters(prev => [...prev, ...newShooters]);
        setIsImporting(false);
    };

    const handleCreateMatch = () => {
        if (!matchName.trim() || stages.length === 0 || shooters.length === 0) {
            alert(t('create_match_validation_alert'));
            return;
        }

        const newMatch: Match = {
            id: crypto.randomUUID(),
            name: matchName.trim(),
            scoreSystem: 'IDPA',
            shooters,
            stages,
            squads: [],
            scores: [],
        };
        onFinish(newMatch);
    };

    return (
        <>
            <div className="space-y-8 max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-yellow-400 text-center">{t('create_new_match')}</h1>
                
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">{t('step_1_details')}</h2>
                    <label htmlFor="matchName" className="block mb-2 text-sm font-medium text-gray-300">{t('match_name')}</label>
                    <input id="matchName" value={matchName} onChange={e => setMatchName(e.target.value)} placeholder={t('match_name_placeholder')} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5" />
                </div>

                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">{t('step_2_stages')}</h2>
                    <ul className="space-y-2 mb-4">
                        {stages.map(s => <li key={s.id} className="bg-gray-700 p-2 rounded">{s.name}</li>)}
                    </ul>
                    <form onSubmit={handleAddStage} className="flex gap-2">
                        <input value={newStageName} onChange={e => setNewStageName(e.target.value)} placeholder={t('new_stage_name_placeholder')} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5" />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">{t('add_button')}</button>
                    </form>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">{t('step_3_shooters')}</h2>
                        <button onClick={() => setIsImporting(true)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg text-sm">{t('import_shooters_button')}</button>
                    </div>
                    <ul className="space-y-2 mb-4">
                        {shooters.map(s => (
                            <li key={s.id} className="bg-gray-700 p-2 rounded flex justify-between items-center">
                                <span>{s.name} ({s.division} - {s.classification})</span>
                                <button onClick={() => handleRemoveShooter(s.id)} className="text-red-500 hover:text-red-400 font-bold">✕</button>
                            </li>
                        ))}
                         {shooters.length === 0 && (
                            <p className="text-center text-gray-500 py-4">{t('no_shooters_added_to_match')}</p>
                        )}
                    </ul>
                </div>

                <div className="flex justify-center gap-4 pt-4">
                    <button onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg">{t('cancel_button')}</button>
                    <button onClick={handleCreateMatch} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg">{t('create_match_button')}</button>
                </div>
            </div>
            {isImporting && (
                <ImportShootersModal
                    allShooters={globalShooters}
                    allClubs={clubs}
                    matchShooters={shooters}
                    onImport={handleImportShooters}
                    onClose={() => setIsImporting(false)}
                />
            )}
        </>
    );
};

export default MatchCreationWizard;