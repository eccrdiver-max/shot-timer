import React, { useState } from 'react';
import { Match, Shooter, IDPADivision, IDPAClassification } from '../../types';
import { useModal } from '../../context/ModalContext';
import { useI18n } from '../../hooks/useI18n';

const ShooterForm: React.FC<{ onSave: (shooter: Omit<Shooter, 'id'>) => void; onCancel: () => void }> = ({ onSave, onCancel }) => {
    const { t } = useI18n();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [division, setDivision] = useState(IDPADivision.SSP);
    const [classification, setClassification] = useState(IDPAClassification.NOVICE);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!firstName.trim()) return;
        onSave({ 
            firstName, 
            lastName,
            name: `${firstName} ${lastName}`.trim(), 
            division, 
            classification, 
            clubId: 'unassigned' 
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold text-yellow-400 mb-4">{t('add_shooter_to_match')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="firstName" className="block mb-1 text-sm font-medium text-gray-300">{t('first_name')}</label>
                            <input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} required className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5" />
                        </div>
                         <div>
                            <label htmlFor="lastName" className="block mb-1 text-sm font-medium text-gray-300">{t('last_name')}</label>
                            <input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="division" className="block mb-1 text-sm font-medium text-gray-300">{t('division')}</label>
                        <select id="division" value={division} onChange={e => setDivision(e.target.value as IDPADivision)} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5">
                            {Object.values(IDPADivision).map((d: IDPADivision) => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="classification" className="block mb-1 text-sm font-medium text-gray-300">{t('classification')}</label>
                        <select id="classification" value={classification} onChange={e => setClassification(e.target.value as IDPAClassification)} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5">
                            {Object.values(IDPAClassification).map((c: IDPAClassification) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end gap-4 pt-2">
                        <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">{t('cancel_button')}</button>
                        <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded-lg">{t('add_shooter_button')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const ShootersPanel: React.FC<{ match: Match; onUpdate: (match: Match) => void }> = ({ match, onUpdate }) => {
    const [isAdding, setIsAdding] = useState(false);
    const { showConfirmation } = useModal();
    const { t } = useI18n();

    const handleAddShooter = (shooterData: Omit<Shooter, 'id'>) => {
        const newShooter: Shooter = { ...shooterData, id: crypto.randomUUID(), updatedAt: Date.now() };
        const updatedMatch = { ...match, shooters: [...match.shooters, newShooter] };
        onUpdate(updatedMatch);
        setIsAdding(false);
    };

    const handleRemoveShooter = (shooter: Shooter) => {
        showConfirmation(
            t('remove_shooter_title'),
            t('remove_shooter_body', { shooterName: shooter.name }),
            () => {
                const updatedMatch = {
                    ...match,
                    shooters: match.shooters.filter(s => s.id !== shooter.id),
                    scores: match.scores.filter(s => s.shooterId !== shooter.id),
                    squads: match.squads.map(sq => ({ ...sq, shooterIds: sq.shooterIds.filter(id => id !== shooter.id) }))
                };
                onUpdate(updatedMatch);
            }
        );
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{t('match_shooters_title')} ({match.shooters.length})</h2>
                <button onClick={() => setIsAdding(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">
                    {t('add_new_shooter')}
                </button>
            </div>
            
            <ul className="space-y-2">
                {match.shooters.map(shooter => (
                    <li key={shooter.id} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                        <span>{shooter.name} <span className="text-sm text-gray-400">({shooter.division} - {shooter.classification})</span></span>
                        <button onClick={() => handleRemoveShooter(shooter)} className="text-red-500 hover:text-red-400 font-bold">✕</button>
                    </li>
                ))}
            </ul>

            {isAdding && <ShooterForm onSave={handleAddShooter} onCancel={() => setIsAdding(false)} />}
        </div>
    );
};

export default ShootersPanel;