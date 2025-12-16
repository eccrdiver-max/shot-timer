import React, { useState, useMemo, useCallback } from 'react';
import { useTrainingContext } from '../context/TrainingContext';
import { useAppContext } from '../context/AppContext';
import { AppView, Drill, UserRole } from '../types';
import { useI18n } from '../hooks/useI18n';
import DrillHistoryView from './DrillHistoryView';
import DrillProgressChart from './DrillProgressChart';
import { useModal } from '../context/ModalContext';
import CommunityDrillsModal from './CommunityDrillsModal';
import { useAuth } from '../context/AuthContext';

const Spinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const DrillForm: React.FC<{
    drill?: Drill;
    onSave: (drillData: Omit<Drill, 'id'> | Drill, isOfficial: boolean) => Promise<void>;
    onCancel: () => void;
}> = ({ drill, onSave, onCancel }) => {
    const { t } = useI18n();
    const { currentUser } = useAuth();
    const [name, setName] = useState(drill?.name || '');
    const [description, setDescription] = useState(drill?.description || '');
    const [isOfficial, setIsOfficial] = useState(drill?.isOfficial || false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setIsSaving(true);
        try {
            const drillData = { name, description };
            if (drill) {
                // FIX: Reconstruct the drill object to prevent passing enriched properties like `lastPracticed` or `sessionCount` to Firestore.
                const cleanDrillData = {
                    id: drill.id,
                    name,
                    description,
                };
                await onSave(cleanDrillData, isOfficial);
            } else {
                await onSave(drillData, isOfficial);
            }
        } catch (error) {
            console.error("Failed to save drill", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold text-yellow-400 mb-4">{drill ? t('edit_drill') : t('add_new_drill')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="drillName" className="block text-sm font-medium text-gray-300">{t('drill_name')}</label>
                        <input id="drillName" value={name} onChange={e => setName(e.target.value)} required className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5 mt-1" />
                    </div>
                     <div>
                        <label htmlFor="drillDescription" className="block text-sm font-medium text-gray-300">{t('description')}</label>
                        <textarea id="drillDescription" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5 mt-1"></textarea>
                    </div>

                    {currentUser?.role === UserRole.MD && (
                         <div className="flex items-center">
                            <input
                                id="isOfficial"
                                type="checkbox"
                                checked={isOfficial}
                                onChange={(e) => setIsOfficial(e.target.checked)}
                                className="h-4 w-4 text-yellow-600 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                            />
                            <label htmlFor="isOfficial" className="ml-2 block text-sm text-gray-300">{t('make_official_drill_label')}</label>
                        </div>
                    )}

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

const DrillCard: React.FC<{
    drill: Drill & { sessionCount: number; lastPracticed?: number };
    isOfficial: boolean;
    onStart: (name: string) => void;
    onHistory: (name: string) => void;
    onChart: (name: string) => void;
    onEdit: (drill: Drill) => void;
    onDelete: (drill: Drill) => void;
    onShare: (drill: Drill) => void;
}> = ({ drill, isOfficial, onStart, onHistory, onChart, onEdit, onDelete, onShare }) => {
    const { t } = useI18n();
    const { currentUser } = useAuth();
    const canManage = currentUser?.role === UserRole.MD;

    return (
        <div key={drill.id} className="bg-gray-800 rounded-lg p-4 flex flex-col justify-between">
            <div>
                <h2 className="text-xl font-bold text-yellow-400">{drill.name}</h2>
                <p className="text-sm text-gray-400 h-12 overflow-hidden">{drill.description}</p>
                <div className="text-xs text-gray-500 mt-2">
                    <p>{t('sessions_logged')}: {drill.sessionCount}</p>
                    <p>{t('last_practiced')}: {drill.lastPracticed ? new Date(drill.lastPracticed).toLocaleDateString() : t('n_a')}</p>
                </div>
            </div>
            <div className="mt-4 flex flex-col space-y-2">
                <button onClick={() => onStart(drill.name)} className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded-lg">{t('start_drill_button')}</button>
                <div className="flex gap-2">
                    <button onClick={() => onHistory(drill.name)} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg text-sm" disabled={drill.sessionCount === 0}>{t('view_history')}</button>
                    <button onClick={() => onChart(drill.name)} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg text-sm" disabled={drill.sessionCount < 2}>{t('view_chart')}</button>
                </div>
                <div className="flex gap-2">
                    {(canManage || !isOfficial) && (
                        <button onClick={() => onEdit(drill)} className="flex-1 bg-blue-800 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-lg text-xs">{t('edit_button')}</button>
                    )}
                    {!isOfficial && (
                        <button onClick={() => onShare(drill)} className="flex-1 bg-purple-800 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded-lg text-xs">{t('share_button')}</button>
                    )}
                     {(canManage || !isOfficial) && (
                        <button onClick={() => onDelete(drill)} className="flex-1 bg-red-800 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg text-xs">{t('delete_button')}</button>
                    )}
                </div>
            </div>
        </div>
    );
};


const TrainingView: React.FC = () => {
    const { drills, officialDrills, sessions, addDrill, updateDrill, deleteDrill, selectDrillForTimer, shareDrill } = useTrainingContext();
    const { setView } = useAppContext();
    const { showConfirmation } = useModal();
    const { t } = useI18n();

    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingDrill, setEditingDrill] = useState<Drill | undefined>(undefined);
    const [viewingHistory, setViewingHistory] = useState<string | null>(null);
    const [viewingChart, setViewingChart] = useState<string | null>(null);
    const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);

    const enrichDrills = (drillList: Drill[]) => {
        return drillList.map(drill => {
            const drillSessions = sessions.filter(s => s.drillName === drill.name);
            const lastSession = drillSessions.sort((a, b) => b.date - a.date)[0];
            return {
                ...drill,
                sessionCount: drillSessions.length,
                lastPracticed: lastSession?.date,
            };
        });
    };

    const officialDrillsWithData = useMemo(() => enrichDrills(officialDrills).sort((a, b) => a.name.localeCompare(b.name)), [officialDrills, sessions]);
    const personalDrillsWithData = useMemo(() => enrichDrills(drills).sort((a, b) => a.name.localeCompare(b.name)), [drills, sessions]);
    
    const handleStartDrill = (drillName: string) => {
        selectDrillForTimer(drillName);
        setView(AppView.TIMER);
    };

    const handleSaveDrill = useCallback(async (drillData: Omit<Drill, 'id'> | Drill, isOfficial: boolean) => {
        if ('id' in drillData) {
            await updateDrill({...(drillData as Drill), isOfficial });
        } else {
            await addDrill(drillData as Omit<Drill, 'id'>, isOfficial);
        }
        setIsFormVisible(false);
        setEditingDrill(undefined);
    }, [addDrill, updateDrill]);
    
    const handleEditDrill = (drill: Drill) => {
        setEditingDrill(drill);
        setIsFormVisible(true);
    };

    const handleDeleteDrill = (drill: Drill) => {
        showConfirmation(
            t('delete_drill_title'),
            t('delete_drill_body', { drillName: drill.name }),
            () => deleteDrill(drill)
        );
    };

    const getDrillSessions = (drillName: string) => {
        return sessions.filter(s => s.drillName === drillName);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="text-3xl font-bold text-yellow-400">{t('nav_training')}</h1>
                <div className="flex gap-4">
                    <button onClick={() => setIsCommunityModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg">{t('browse_community_drills')}</button>
                    <button onClick={() => { setEditingDrill(undefined); setIsFormVisible(true); }} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">{t('add_new_drill')}</button>
                </div>
            </div>
            
            {/* Official Drills Section */}
            <div>
                <h2 className="text-2xl font-semibold text-yellow-500 mb-4 border-b border-gray-700 pb-2">{t('official_club_drills')}</h2>
                {officialDrills.length === 0 ? (
                    <div className="text-center bg-gray-800 rounded-lg p-6">
                        <p className="text-gray-400">No official club drills found.</p>
                    </div>
                ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {officialDrillsWithData.map(drill => (
                            <DrillCard 
                                key={drill.id}
                                drill={drill}
                                isOfficial={true}
                                onStart={handleStartDrill}
                                onHistory={setViewingHistory}
                                onChart={setViewingChart}
                                onEdit={handleEditDrill}
                                onDelete={handleDeleteDrill}
                                onShare={shareDrill}
                            />
                        ))}
                    </div>
                )}
            </div>
            
             {/* Personal Drills Section */}
            <div>
                <h2 className="text-2xl font-semibold text-yellow-500 mb-4 border-b border-gray-700 pb-2">{t('my_personal_drills')}</h2>
                {drills.length === 0 ? (
                    <div className="text-center bg-gray-800 rounded-lg p-6">
                        <p className="text-gray-400">{t('no_drills_found')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {personalDrillsWithData.map(drill => (
                            <DrillCard 
                                key={drill.id}
                                drill={drill}
                                isOfficial={false}
                                onStart={handleStartDrill}
                                onHistory={setViewingHistory}
                                onChart={setViewingChart}
                                onEdit={handleEditDrill}
                                onDelete={handleDeleteDrill}
                                onShare={shareDrill}
                            />
                        ))}
                    </div>
                )}
            </div>
            
            {isFormVisible && <DrillForm drill={editingDrill} onSave={handleSaveDrill} onCancel={() => setIsFormVisible(false)} />}
            {viewingHistory && <DrillHistoryView sessions={getDrillSessions(viewingHistory)} drillName={viewingHistory} onClose={() => setViewingHistory(null)} />}
            {viewingChart && <DrillProgressChart sessions={getDrillSessions(viewingChart)} drillName={viewingChart} onClose={() => setViewingChart(null)} />}
            {isCommunityModalOpen && <CommunityDrillsModal onClose={() => setIsCommunityModalOpen(false)} />}
        </div>
    );
};

export default TrainingView;
