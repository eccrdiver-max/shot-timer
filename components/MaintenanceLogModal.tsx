import React, { useState, useMemo } from 'react';
import { Weapon, MaintenanceLog } from '../types';
import { useArmory } from '../context/ArmoryContext';
import { useI18n } from '../hooks/useI18n';
import { useModal } from '../context/ModalContext';

interface MaintenanceLogModalProps {
    weapon: Weapon;
    onClose: () => void;
}

const MaintenanceLogModal: React.FC<MaintenanceLogModalProps> = ({ weapon, onClose }) => {
    const { t } = useI18n();
    const { maintenanceLogs, addMaintenanceLog, deleteMaintenanceLog } = useArmory();
    const { showConfirmation } = useModal();
    const [notes, setNotes] = useState('');
    const [roundCountAtMaintenance, setRoundCountAtMaintenance] = useState(weapon.roundCount);
    const [isSaving, setIsSaving] = useState(false);

    const weaponLogs = useMemo(() => {
        return maintenanceLogs
            .filter(log => log.weaponId === weapon.id)
            .sort((a, b) => b.date - a.date);
    }, [maintenanceLogs, weapon.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!notes.trim()) return;
        setIsSaving(true);
        try {
            await addMaintenanceLog({
                weaponId: weapon.id,
                date: Date.now(),
                roundCountAtMaintenance: roundCountAtMaintenance,
                notes,
            });
            setNotes('');
            setRoundCountAtMaintenance(weapon.roundCount);
        } catch (error) {
            console.error("Failed to add maintenance log", error);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDelete = (log: MaintenanceLog) => {
        showConfirmation(
            t('delete_log_entry_title'),
            t('delete_log_entry_body', { date: new Date(log.date).toLocaleDateString() }),
            () => deleteMaintenanceLog(log.id)
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-yellow-400">{t('maintenance_log_title', { weaponName: `${weapon.manufacturer} ${weapon.model}` })}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
                </div>

                <div className="overflow-y-auto flex-grow pr-2 space-y-4">
                    {weaponLogs.length > 0 ? (
                        weaponLogs.map(log => {
                             const prevLog = weaponLogs[weaponLogs.indexOf(log) + 1];
                             const roundsSincePrev = prevLog ? log.roundCountAtMaintenance - prevLog.roundCountAtMaintenance : log.roundCountAtMaintenance;
                            return (
                                <div key={log.id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold">{new Date(log.date).toLocaleString()}</p>
                                        <p className="text-sm text-gray-300 my-1">{log.notes}</p>
                                        <div className="text-xs text-gray-400">
                                            <span>{t('round_count_at_service')}: {log.roundCountAtMaintenance.toLocaleString()}</span>
                                            <span className="mx-2">|</span>
                                            <span>(+{roundsSincePrev.toLocaleString()} rounds)</span>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete(log)} className="text-red-500 hover:text-red-400 font-bold ml-4">✕</button>
                                </div>
                            )
                        })
                    ) : (
                        <p className="text-center text-gray-500 py-8">{t('no_maintenance_logs')}</p>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700 flex-shrink-0">
                    <h3 className="text-lg font-semibold mb-2">{t('add_log_entry_button')}</h3>
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-grow w-full">
                            <label htmlFor="logNotes" className="block text-sm font-medium text-gray-300 mb-1">{t('notes_placeholder')}</label>
                            <input 
                                id="logNotes"
                                value={notes} 
                                onChange={e => setNotes(e.target.value)} 
                                required 
                                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5" 
                            />
                        </div>
                        <div className="w-full sm:w-48 flex-shrink-0">
                            <label htmlFor="logRoundCount" className="block text-sm font-medium text-gray-300 mb-1">{t('round_count')}</label>
                            <input 
                                id="logRoundCount"
                                type="number"
                                value={roundCountAtMaintenance}
                                onChange={e => setRoundCountAtMaintenance(parseInt(e.target.value, 10) || 0)}
                                required
                                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5"
                            />
                        </div>
                        <button type="submit" disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500 flex-shrink-0">
                            {isSaving ? t('saving_button') : t('add_button')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MaintenanceLogModal;
