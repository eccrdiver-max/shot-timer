import React, { useState } from 'react';
import { Match, Squad, Shooter } from '../../types';
import { useModal } from '../../context/ModalContext';
import { useI18n } from '../../hooks/useI18n';
import { useAuth } from '../../context/AuthContext';

interface SquadsPanelProps {
    match: Match;
    onUpdate: (match: Match) => void;
}

const SquadsPanel: React.FC<SquadsPanelProps> = ({ match, onUpdate }) => {
    const { t } = useI18n();
    const { showConfirmation } = useModal();
    const { allUserProfiles } = useAuth();
    const [newSquadName, setNewSquadName] = useState('');
    const [editingSquad, setEditingSquad] = useState<Squad | null>(null);

    const handleAddSquad = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSquadName.trim()) return;
        const newSquad: Squad = { id: crypto.randomUUID(), name: newSquadName.trim(), shooterIds: [] };
        onUpdate({ ...match, squads: [...match.squads, newSquad] });
        setNewSquadName('');
    };
    
    const handleDeleteSquad = (squad: Squad) => {
        showConfirmation(
            t('delete_squad_title'),
            t('delete_squad_body', { squadName: squad.name }),
            () => {
                const updatedMatch = { ...match, squads: match.squads.filter(s => s.id !== squad.id) };
                onUpdate(updatedMatch);
            }
        );
    };
    
    const handleAddShooterToSquad = (squadId: string, shooterId: string) => {
        const updatedSquads = match.squads.map(s => {
            if (s.id === squadId) {
                return { ...s, shooterIds: [...s.shooterIds, shooterId] };
            }
            // Remove from other squads
            return { ...s, shooterIds: s.shooterIds.filter(id => id !== shooterId) };
        });
        onUpdate({ ...match, squads: updatedSquads });
    };

    const handleRemoveShooterFromSquad = (squadId: string, shooterId: string) => {
        const updatedSquads = match.squads.map(s => {
            if (s.id === squadId) {
                return { ...s, shooterIds: s.shooterIds.filter(id => id !== shooterId) };
            }
            return s;
        });
        onUpdate({ ...match, squads: updatedSquads });
    };

    const handleAssignSO = (squadId: string, soUid: string) => {
        const so = allUserProfiles.find(u => u.uid === soUid);
        const updatedSquads = match.squads.map(s => {
            if (s.id === squadId) {
                return { ...s, soId: so?.uid, soName: `${so?.firstName} ${so?.lastName}`.trim() };
            }
            return s;
        });
        onUpdate({ ...match, squads: updatedSquads });
    };

    const getShooterName = (id: string) => match.shooters.find(s => s.id === id)?.name || 'Unknown Shooter';
    
    const unsquaddedShooters = match.shooters.filter(shooter => !match.squads.some(squad => squad.shooterIds.includes(shooter.id)));

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">{t('squad_management_title')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {match.squads.map(squad => (
                    <div key={squad.id} className="bg-gray-700 p-4 rounded-lg flex flex-col">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-lg text-yellow-400">{squad.name}</h3>
                            <button onClick={() => handleDeleteSquad(squad)} className="text-red-500 hover:text-red-400 font-bold">✕</button>
                        </div>

                        <div className="mb-3">
                             <label className="text-xs text-gray-400">{t('safety_officer')}</label>
                            <select value={squad.soId || ''} onChange={e => handleAssignSO(squad.id, e.target.value)} className="bg-gray-600 border-gray-500 text-white text-sm rounded w-full p-2 mt-1">
                                <option value="">{t('unassigned')}</option>
                                {allUserProfiles.filter(u => u.role === 'SO' || u.role === 'MD').map(so => (
                                    <option key={so.uid} value={so.uid}>{so.firstName} {so.lastName}</option>
                                ))}
                            </select>
                        </div>
                        
                        <ul className="space-y-2 flex-grow">
                            {squad.shooterIds.map(shooterId => (
                                <li key={shooterId} className="flex justify-between items-center text-sm">
                                    <span>{getShooterName(shooterId)}</span>
                                    <button onClick={() => handleRemoveShooterFromSquad(squad.id, shooterId)} className="text-gray-400 hover:text-white">Remove</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">{t('unsquadded_shooters')}</h3>
                    <ul className="space-y-2">
                        {unsquaddedShooters.map(shooter => (
                            <li key={shooter.id} className="flex justify-between items-center text-sm">
                                <span>{shooter.name}</span>
                                <select onChange={e => handleAddShooterToSquad(e.target.value, shooter.id)} className="bg-gray-600 text-xs p-1 rounded">
                                    <option>{t('add_to_squad')}</option>
                                    {match.squads.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">{t('add_new_squad')}</h3>
                     <form onSubmit={handleAddSquad} className="flex gap-2">
                        <input value={newSquadName} onChange={e => setNewSquadName(e.target.value)} placeholder={t('squad_name_placeholder')} className="bg-gray-600 border border-gray-500 text-white text-sm rounded-lg block w-full p-2.5" />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">{t('add_button')}</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SquadsPanel;
