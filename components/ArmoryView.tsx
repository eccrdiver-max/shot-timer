import React, { useState, useMemo } from 'react';
import { useArmory } from '../context/ArmoryContext';
import { Weapon, UserRole, Shooter } from '../types';
import { useI18n } from '../hooks/useI18n';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';
import { useShooterContext } from '../context/ShooterContext';
import MaintenanceLogModal from './MaintenanceLogModal';

const Spinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const WeaponForm: React.FC<{ 
    weapon?: Weapon; 
    onSave: (weapon: Omit<Weapon, 'id'> | Weapon) => Promise<void>; 
    onCancel: () => void;
}> = ({ weapon, onSave, onCancel }) => {
    const { t } = useI18n();
    const { currentUser } = useAuth();
    const { shooters } = useShooterContext();

    const [manufacturer, setManufacturer] = useState(weapon?.manufacturer || '');
    const [model, setModel] = useState(weapon?.model || '');
    const [caliber, setCaliber] = useState(weapon?.caliber || '');
    const [roundCount, setRoundCount] = useState(weapon?.roundCount || 0);
    const [shooterId, setShooterId] = useState(weapon?.shooterId || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manufacturer.trim() || !model.trim() || !caliber.trim()) return;
        
        setIsSaving(true);
        try {
            const shooter = shooters.find(s => s.id === shooterId);
            const weaponData = { manufacturer, model, caliber, roundCount, shooterId: shooterId || undefined, shooterName: shooter?.name || undefined };
            await onSave(weapon ? { ...weapon, ...weaponData } : weaponData);
        } catch (error) {
            console.error("Failed to save weapon", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold text-yellow-400 mb-4">{weapon ? t('edit_weapon') : t('add_weapon')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {currentUser?.role !== UserRole.USER && (
                        <div>
                            <label htmlFor="shooterId" className="block text-sm font-medium text-gray-300">{t('assign_to_shooter')}</label>
                            <select id="shooterId" value={shooterId} onChange={e => setShooterId(e.target.value)} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5">
                                <option value="">{t('unassigned')}</option>
                                {shooters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-300">{t('manufacturer')}</label>
                        <input id="manufacturer" value={manufacturer} onChange={e => setManufacturer(e.target.value)} required className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5" />
                    </div>
                    <div>
                        <label htmlFor="model" className="block text-sm font-medium text-gray-300">{t('model')}</label>
                        <input id="model" value={model} onChange={e => setModel(e.target.value)} required className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5" />
                    </div>
                    <div>
                        <label htmlFor="caliber" className="block text-sm font-medium text-gray-300">{t('caliber')}</label>
                        <input id="caliber" value={caliber} onChange={e => setCaliber(e.target.value)} required className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5" />
                    </div>
                     <div>
                        <label htmlFor="roundCount" className="block text-sm font-medium text-gray-300">{t('round_count')}</label>
                        <input id="roundCount" type="number" value={roundCount} onChange={e => setRoundCount(parseInt(e.target.value) || 0)} required className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5" />
                    </div>
                    <div className="flex justify-end gap-4 pt-2">
                        <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">{t('cancel_button')}</button>
                        <button type="submit" disabled={isSaving} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded-lg flex items-center justify-center disabled:bg-yellow-700">
                           {isSaving ? (
                                <>
                                    <Spinner />
                                    {t('saving_button')}
                                </>
                            ) : (
                                t('save_button')
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const WeaponCard: React.FC<{
    weapon: Weapon;
    onEdit: (weapon: Weapon) => void;
    onDelete: (weapon: Weapon) => void;
    onViewLog: (weapon: Weapon) => void;
}> = ({ weapon, onEdit, onDelete, onViewLog }) => {
    const { t } = useI18n();
    const { maintenanceLogs } = useArmory();
    
    const lastLog = useMemo(() => {
        return maintenanceLogs
            .filter(log => log.weaponId === weapon.id)
            .sort((a,b) => b.date - a.date)[0];
    }, [maintenanceLogs, weapon.id]);

    const roundsSinceLastLog = lastLog ? weapon.roundCount - lastLog.roundCountAtMaintenance : weapon.roundCount;
    const needsAttention = roundsSinceLastLog > 2500;

    return (
         <div className={`bg-gray-800 p-4 rounded-lg border ${needsAttention ? 'border-red-500' : 'border-transparent'}`}>
            <h2 className="text-xl font-bold text-yellow-400">{weapon.manufacturer} {weapon.model}</h2>
            <p className="text-gray-300">{weapon.caliber}</p>
            <p className="text-sm text-gray-400 mt-2">{t('round_count')}: <span className="font-mono font-semibold">{weapon.roundCount.toLocaleString()}</span></p>
            {needsAttention && (
                <p className="text-xs text-red-400 mt-1">{t('high_round_count_warning', { count: roundsSinceLastLog.toLocaleString() })}</p>
            )}
            <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => onViewLog(weapon)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded-lg text-sm">{t('log_button')}</button>
                <button onClick={() => onEdit(weapon)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-lg text-sm">{t('edit_button')}</button>
                <button onClick={() => onDelete(weapon)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg text-sm">{t('delete_button')}</button>
            </div>
        </div>
    );
};

const ArmoryView: React.FC = () => {
    const { weapons, addWeapon, updateWeapon, deleteWeapon } = useArmory();
    const { showConfirmation } = useModal();
    const { t } = useI18n();
    const { currentUser } = useAuth();
    const { shooters } = useShooterContext();

    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingWeapon, setEditingWeapon] = useState<Weapon | undefined>(undefined);
    const [viewingLogFor, setViewingLogFor] = useState<Weapon | null>(null);

    const userShooterProfile = useMemo(() => shooters.find(s => s.uid === currentUser?.uid), [shooters, currentUser]);

    const handleSave = async (weaponData: Omit<Weapon, 'id'> | Weapon) => {
        let finalWeaponData = { ...weaponData };
        if (currentUser?.role === UserRole.USER && userShooterProfile) {
            finalWeaponData = { ...finalWeaponData, shooterId: userShooterProfile.id, shooterName: userShooterProfile.name };
        }

        if ('id' in finalWeaponData) {
            await updateWeapon(finalWeaponData as Weapon);
        } else {
            // FIX: The type assertion incorrectly omitted `roundCount`, which is a required property for a new weapon. Corrected to only omit `id`.
            await addWeapon(finalWeaponData as Omit<Weapon, 'id'>);
        }
        setIsFormVisible(false);
        setEditingWeapon(undefined);
    };

    const handleEdit = (weapon: Weapon) => {
        setEditingWeapon(weapon);
        setIsFormVisible(true);
    };

    const handleDelete = (weapon: Weapon) => {
        showConfirmation(
            t('delete_weapon_title'),
            t('delete_weapon_body', { weaponName: `${weapon.manufacturer} ${weapon.model}` }),
            () => deleteWeapon(weapon.id)
        );
    };

    const { unassignedWeapons, weaponsByShooter } = useMemo(() => {
        const unassigned: Weapon[] = [];
        const byShooter = new Map<string, { shooter: Shooter; weapons: Weapon[] }>();

        weapons.forEach(weapon => {
            if (weapon.shooterId && shooters.find(s => s.id === weapon.shooterId)) {
                if (!byShooter.has(weapon.shooterId)) {
                    byShooter.set(weapon.shooterId, { shooter: shooters.find(s => s.id === weapon.shooterId)!, weapons: [] });
                }
                byShooter.get(weapon.shooterId)!.weapons.push(weapon);
            } else {
                unassigned.push(weapon);
            }
        });
        return { unassignedWeapons: unassigned, weaponsByShooter: Array.from(byShooter.values()) };
    }, [weapons, shooters]);
    
    // Simplified view for standard USER
    if (currentUser?.role === UserRole.USER) {
        const myWeapons = weapons.filter(w => w.shooterId === userShooterProfile?.id);
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-yellow-400">{t('my_armory')}</h1>
                    <button onClick={() => { setEditingWeapon(undefined); setIsFormVisible(true); }} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">{t('add_new_weapon')}</button>
                </div>
                 {myWeapons.length === 0 ? (
                    <div className="text-center bg-gray-800 rounded-lg p-8">
                        <p className="text-gray-400">{t('no_weapons_found_personal')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myWeapons.map(weapon => (
                             <WeaponCard key={weapon.id} weapon={weapon} onEdit={handleEdit} onDelete={handleDelete} onViewLog={setViewingLogFor} />
                        ))}
                    </div>
                )}
                 {isFormVisible && <WeaponForm weapon={editingWeapon} onSave={handleSave} onCancel={() => setIsFormVisible(false)} />}
                 {viewingLogFor && <MaintenanceLogModal weapon={viewingLogFor} onClose={() => setViewingLogFor(null)} />}
            </div>
        );
    }
    
    // Full view for MD/SO
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-yellow-400">{t('nav_armory')}</h1>
                <button onClick={() => { setEditingWeapon(undefined); setIsFormVisible(true); }} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">{t('add_new_weapon')}</button>
            </div>

            {weapons.length === 0 ? (
                <div className="text-center bg-gray-800 rounded-lg p-8">
                    <p className="text-gray-400">{t('no_weapons_found')}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {unassignedWeapons.length > 0 && (
                        <div className="bg-gray-700 rounded-lg p-4">
                            <h2 className="text-xl font-bold text-yellow-400 mb-4">{t('unassigned_weapons')}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {unassignedWeapons.map(weapon => (
                                    <WeaponCard key={weapon.id} weapon={weapon} onEdit={handleEdit} onDelete={handleDelete} onViewLog={setViewingLogFor} />
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {weaponsByShooter.map(({ shooter, weapons }) => (
                         <div key={shooter.id} className="bg-gray-800 rounded-lg p-4">
                            <h2 className="text-xl font-bold text-yellow-400 mb-4">{shooter.name}</h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {weapons.map(weapon => (
                                     <WeaponCard key={weapon.id} weapon={weapon} onEdit={handleEdit} onDelete={handleDelete} onViewLog={setViewingLogFor} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isFormVisible && <WeaponForm weapon={editingWeapon} onSave={handleSave} onCancel={() => setIsFormVisible(false)} />}
            {viewingLogFor && <MaintenanceLogModal weapon={viewingLogFor} onClose={() => setViewingLogFor(null)} />}
        </div>
    );
};

export default ArmoryView;