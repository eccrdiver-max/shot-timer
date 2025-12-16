import React, { useState, useMemo, useEffect } from 'react';
import { useShooterContext } from '../context/ShooterContext';
import { useAuth } from '../context/AuthContext';
import { Shooter, Club, UserRole, IDPADivision, IDPAClassification, UserProfile } from '../types';
import { useModal } from '../context/ModalContext';
import { useI18n } from '../hooks/useI18n';
import ShooterHistoryView from './ShooterHistoryView';

const Spinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const ShooterForm: React.FC<{
    shooter?: Shooter;
    clubs: Club[];
    onSave: (data: Omit<Shooter, 'id'> | Shooter) => Promise<void>;
    onCancel: () => void;
    allUserProfiles: UserProfile[];
    shooters: Shooter[];
}> = ({ shooter, clubs, onSave, onCancel, allUserProfiles, shooters }) => {
    const { t } = useI18n();
    const [uid, setUid] = useState(shooter?.uid || '');
    const [firstName, setFirstName] = useState(shooter?.firstName || '');
    const [lastName, setLastName] = useState(shooter?.lastName || '');
    const [clubId, setClubId] = useState(shooter?.clubId || '');
    const [division, setDivision] = useState(shooter?.division || IDPADivision.SSP);
    const [classification, setClassification] = useState(shooter?.classification || IDPAClassification.NOVICE);
    const [isSaving, setIsSaving] = useState(false);

    const availableUsers = useMemo(() => {
        const linkedUids = shooters.map(s => s.uid).filter(Boolean);
        // A user is available if they are not linked, OR if they are the user currently being edited.
        return allUserProfiles.filter(u => !linkedUids.includes(u.uid) || u.uid === shooter?.uid);
    }, [allUserProfiles, shooters, shooter]);

    useEffect(() => {
        const selectedUser = allUserProfiles.find(u => u.uid === uid);
        if (selectedUser) {
            setFirstName(selectedUser.firstName || '');
            setLastName(selectedUser.lastName || '');
        } else if (!shooter) {
            // Clear names only if creating a new shooter and unlinking
            setFirstName('');
            setLastName('');
        }
    }, [uid, allUserProfiles, shooter]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!firstName.trim()) {
            alert(t('alert_name_required'));
            return;
        }

        if (!clubId) {
            alert(t('alert_club_required'));
            return;
        }

        setIsSaving(true);
        try {
            const shooterData = {
                uid: uid || null, // Changed from undefined to null to support Firestore
                firstName,
                lastName,
                name: `${firstName} ${lastName}`.trim(),
                clubId,
                division,
                classification
            };
            await onSave(shooter ? { ...shooter, ...shooterData } : shooterData);
        } catch (error) {
            console.error("Failed to save shooter", error);
            alert(t('error_saving_data'));
        } finally {
            setIsSaving(false);
        }
    };

    const isNameReadOnly = !!uid;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold text-yellow-400 mb-4">{shooter ? t('edit_shooter') : t('add_new_shooter')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="userLink" className="block mb-1 text-sm font-medium text-gray-300">Link to User Account (Optional)</label>
                        <select id="userLink" value={uid || ''} onChange={e => setUid(e.target.value)} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5">
                            <option value="">Unlinked / Guest Shooter</option>
                            {availableUsers.map(u => <option key={u.uid} value={u.uid}>{u.firstName} {u.lastName} ({u.email})</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="firstName" className="block mb-1 text-sm font-medium text-gray-300">{t('first_name')}</label>
                            <input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} required readOnly={isNameReadOnly} className={`bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5 ${isNameReadOnly ? 'cursor-not-allowed bg-gray-600' : ''}`} />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block mb-1 text-sm font-medium text-gray-300">{t('last_name')}</label>
                            <input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} readOnly={isNameReadOnly} className={`bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5 ${isNameReadOnly ? 'cursor-not-allowed bg-gray-600' : ''}`} />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="club" className="block mb-1 text-sm font-medium text-gray-300">{t('club')}</label>
                        <select id="club" value={clubId} onChange={e => setClubId(e.target.value)} required className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5">
                            <option value="">{t('select_club')}</option>
                            {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="division" className="block mb-1 text-sm font-medium text-gray-300">{t('division')}</label>
                        <select id="division" value={division} onChange={e => setDivision(e.target.value as IDPADivision)} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5">
                            {Object.values(IDPADivision).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="classification" className="block mb-1 text-sm font-medium text-gray-300">{t('classification')}</label>
                        <select id="classification" value={classification} onChange={e => setClassification(e.target.value as IDPAClassification)} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5">
                            {Object.values(IDPAClassification).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
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

const ShootersView: React.FC = () => {
    const { shooters, clubs, addShooter, updateShooter, deleteShooter, addClub } = useShooterContext();
    const { currentUser, allUserProfiles } = useAuth();
    const { showConfirmation } = useModal();
    const { t } = useI18n();

    const [isShooterFormVisible, setIsShooterFormVisible] = useState(false);
    const [editingShooter, setEditingShooter] = useState<Shooter | undefined>(undefined);
    const [newClubName, setNewClubName] = useState('');
    const [viewingShooterHistory, setViewingShooterHistory] = useState<Shooter | null>(null);

    const shootersByClub = useMemo(() => {
        const map = new Map<string, Shooter[]>();
        shooters.forEach(s => {
            const list = map.get(s.clubId) || [];
            list.push(s);
            map.set(s.clubId, list);
        });
        return map;
    }, [shooters]);

    const handleSaveShooter = async (data: Omit<Shooter, 'id'> | Shooter) => {
        if ('id' in data) {
            await updateShooter(data);
        } else {
            await addShooter(data as Omit<Shooter, 'id'>);
        }
        setIsShooterFormVisible(false);
        setEditingShooter(undefined);
    };
    
    const handleDeleteShooter = (shooter: Shooter) => {
        showConfirmation(
            t('delete_shooter_title'),
            t('delete_shooter_body', { shooterName: shooter.name }),
            () => deleteShooter(shooter.id)
        );
    };

    const handleAddClub = (e: React.FormEvent) => {
        e.preventDefault();
        if (newClubName.trim()) {
            addClub({ name: newClubName.trim() });
            setNewClubName('');
        }
    };
    
    if (currentUser?.role !== UserRole.MD && currentUser?.role !== UserRole.SO) {
        return <p>{t('unauthorized_access')}</p>;
    }
    
    if (viewingShooterHistory) {
        return <ShooterHistoryView shooter={viewingShooterHistory} onClose={() => setViewingShooterHistory(null)} />;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-yellow-400">{t('nav_shooters')}</h1>
            
            {currentUser?.role === UserRole.MD && (
                <div className="bg-gray-800 p-4 rounded-lg">
                    <h2 className="text-xl font-semibold mb-3">{t('clubs')}</h2>
                    <form onSubmit={handleAddClub} className="flex gap-2 mb-4">
                        <input value={newClubName} onChange={e => setNewClubName(e.target.value)} placeholder={t('new_club_name_placeholder')} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5" />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">{t('add_club')}</button>
                    </form>
                </div>
            )}

            <div className="space-y-6">
                {clubs.map(club => (
                    <div key={club.id} className="bg-gray-800 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-yellow-400">{club.name}</h2>
                             <button onClick={() => { setEditingShooter(undefined); setIsShooterFormVisible(true); }} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm">{t('add_shooter_to_club')}</button>
                        </div>
                        <ul className="space-y-2">
                           {(shootersByClub.get(club.id) || []).map(shooter => (
                               <li key={shooter.id} className="bg-gray-700 p-3 rounded-lg flex flex-col md:flex-row justify-between md:items-center">
                                   <div>
                                       <p className="font-bold">{shooter.name}{shooter.uid && ' (👤)'}</p>
                                       <p className="text-sm text-gray-400">{shooter.division} - {shooter.classification}</p>
                                   </div>
                                   <div className="flex gap-2 mt-2 md:mt-0">
                                       <button onClick={() => setViewingShooterHistory(shooter)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded text-sm">{t('history')}</button>
                                       <button onClick={() => { setEditingShooter(shooter); setIsShooterFormVisible(true); }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm">{t('edit_button')}</button>
                                       <button onClick={() => handleDeleteShooter(shooter)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm">{t('delete_button')}</button>
                                   </div>
                               </li>
                           ))}
                           {!shootersByClub.has(club.id) && <p className="text-gray-500">{t('no_shooters_in_club')}</p>}
                        </ul>
                    </div>
                ))}
            </div>

            {isShooterFormVisible && <ShooterForm shooter={editingShooter} clubs={clubs} onSave={handleSaveShooter} onCancel={() => setIsShooterFormVisible(false)} allUserProfiles={allUserProfiles} shooters={shooters} />}
        </div>
    );
};

export default ShootersView;