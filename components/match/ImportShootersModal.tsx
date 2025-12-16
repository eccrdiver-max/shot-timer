import React, { useState, useMemo } from 'react';
import { Shooter, Club } from '../../types';
import { useI18n } from '../../hooks/useI18n';

interface ImportShootersModalProps {
    allShooters: Shooter[];
    allClubs: Club[];
    matchShooters: Shooter[];
    onImport: (selectedShooters: Shooter[]) => void;
    onClose: () => void;
}

const ImportShootersModal: React.FC<ImportShootersModalProps> = ({ allShooters, allClubs, matchShooters, onImport, onClose }) => {
    const { t } = useI18n();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const availableShootersByClub = useMemo(() => {
        const matchShooterIds = new Set(matchShooters.map(s => s.id));
        const available = allShooters.filter(s => !matchShooterIds.has(s.id));
        
        return allClubs.map(club => ({
            ...club,
            shooters: available.filter(s => s.clubId === club.id)
        })).filter(group => group.shooters.length > 0)
           .sort((a,b) => a.name.localeCompare(b.name));

    }, [allShooters, allClubs, matchShooters]);

    const handleToggle = (shooterId: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(shooterId)) {
                newSet.delete(shooterId);
            } else {
                newSet.add(shooterId);
            }
            return newSet;
        });
    };
    
    const handleSelectClub = (clubShooterIds: string[], select: boolean) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (select) {
                clubShooterIds.forEach(id => newSet.add(id));
            } else {
                clubShooterIds.forEach(id => newSet.delete(id));
            }
            return newSet;
        });
    };

    const handleImport = () => {
        const shootersToImport = allShooters.filter(s => selectedIds.has(s.id));
        onImport(shootersToImport);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg flex flex-col max-h-[90vh]">
                <h2 className="text-2xl font-bold text-yellow-400 mb-4">{t('import_shooters_title')}</h2>
                
                <div className="flex-grow overflow-y-auto border-t border-b border-gray-700 py-2">
                    {availableShootersByClub.length > 0 ? (
                        <div className="space-y-4">
                            {availableShootersByClub.map(group => {
                                const clubShooterIds = group.shooters.map(s => s.id);
                                const areAllSelected = clubShooterIds.every(id => selectedIds.has(id));
                                return (
                                    <div key={group.id}>
                                        <div className="flex items-center bg-gray-900 p-2 rounded-t-lg">
                                            <input
                                                type="checkbox"
                                                id={`club-${group.id}`}
                                                checked={areAllSelected}
                                                onChange={() => handleSelectClub(clubShooterIds, !areAllSelected)}
                                                className="h-5 w-5 rounded bg-gray-600 border-gray-500 text-yellow-500 focus:ring-yellow-600"
                                            />
                                            <label htmlFor={`club-${group.id}`} className="ml-3 text-yellow-400 font-bold">
                                                {t('select_all_club', {clubName: group.name})}
                                            </label>
                                        </div>
                                        <ul className="space-y-2 p-2 bg-gray-700 rounded-b-lg">
                                            {group.shooters.map(shooter => (
                                                <li key={shooter.id} className="flex items-center">
                                                    <input 
                                                        type="checkbox" 
                                                        id={`shooter-${shooter.id}`}
                                                        checked={selectedIds.has(shooter.id)}
                                                        onChange={() => handleToggle(shooter.id)}
                                                        className="h-5 w-5 rounded bg-gray-600 border-gray-500 text-yellow-500 focus:ring-yellow-600"
                                                    />
                                                    <label htmlFor={`shooter-${shooter.id}`} className="ml-3 text-white">
                                                        <p className="font-semibold">{shooter.name}</p>
                                                        <p className="text-sm text-gray-400">{shooter.division} - {shooter.classification}</p>
                                                    </label>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">{t('no_shooters_to_import')}</p>
                    )}
                </div>

                <div className="flex justify-between items-center pt-4">
                    <span className="text-gray-400">{t('shooters_to_import', { count: selectedIds.size })}</span>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">{t('cancel_button')}</button>
                        <button 
                            onClick={handleImport} 
                            disabled={selectedIds.size === 0}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            {t('import_button')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImportShootersModal;