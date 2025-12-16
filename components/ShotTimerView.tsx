import React, { useState, useEffect, useMemo } from 'react';
import { useShotTimer } from '../hooks/useShotTimer';
import { useAppContext } from '../context/AppContext';
import { useTrainingContext } from '../context/TrainingContext';
import { useShooterContext } from '../context/ShooterContext';
import { useArmory } from '../context/ArmoryContext';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../hooks/useI18n';
import { Shot, Session, UserRole } from '../types';

const Spinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const SaveSessionForm: React.FC<{
    shots: Shot[];
    totalTime: number;
    firstShotTime: number;
    splits: number[];
    initialPointsDown: number;
    initialProcedurals: number;
    initialHnt: number;
    onSave: (sessionData: Omit<Session, 'id' | 'date'>) => Promise<void>;
    onCancel: () => void;
}> = ({ shots, totalTime, firstShotTime, splits, initialPointsDown, initialProcedurals, initialHnt, onSave, onCancel }) => {
    const { t } = useI18n();
    const { currentUser } = useAuth();
    const { drills, selectedDrillForTimer } = useTrainingContext();
    const { shooters, clubs } = useShooterContext();
    const { weapons } = useArmory();
    const [isSaving, setIsSaving] = useState(false);

    const userShooterProfile = useMemo(() => shooters.find(s => s.uid === currentUser?.uid), [shooters, currentUser]);

    const [drillName, setDrillName] = useState(selectedDrillForTimer || '');
    const [shooterId, setShooterId] = useState(userShooterProfile?.id || '');
    const [weaponId, setWeaponId] = useState('');
    const [pointsDown, setPointsDown] = useState(initialPointsDown);
    const [procedurals, setProcedurals] = useState(initialProcedurals);
    const [hnt, setHnt] = useState(initialHnt);

    const groupedShooters = useMemo(() => {
        return clubs.map(club => ({
            ...club,
            shooters: shooters.filter(shooter => shooter.clubId === club.id)
        })).sort((a,b) => a.name.localeCompare(b.name));
    }, [clubs, shooters]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!drillName.trim()) {
            alert(t('alert_drill_name_required'));
            return;
        }
        setIsSaving(true);
        try {
            const shooter = shooters.find(s => s.id === shooterId);
            await onSave({
                drillName,
                shots,
                totalTime,
                firstShotTime,
                splits,
                shooterId: shooter?.id,
                shooterName: shooter?.name,
                weaponId: weaponId || undefined,
                pointsDown,
                procedurals,
                hnt,
            });
        } catch (error) {
            console.error("Failed to save session", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg">
                <h2 className="text-2xl font-bold text-yellow-400 mb-4">{t('save_training_session')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" value={drillName} onChange={e => setDrillName(e.target.value)} list="drill-list" placeholder={t('drill_name')} required className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5" />
                        <datalist id="drill-list">
                            {drills.map(d => <option key={d.id} value={d.name} />)}
                        </datalist>

                        { currentUser?.role !== UserRole.USER ? (
                            <select value={shooterId} onChange={e => setShooterId(e.target.value)} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5">
                                <option value="">{t('select_shooter_option')}</option>
                                {groupedShooters.map(group => (
                                    <optgroup key={group.id} label={group.name}>
                                        {group.shooters.map(shooter => (
                                            <option key={shooter.id} value={shooter.id}>{shooter.name}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        ) : <div /> }

                        <select value={weaponId} onChange={e => setWeaponId(e.target.value)} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5">
                            <option value="">{t('select_weapon_option')}</option>
                            {weapons.filter(w => !w.shooterId || w.shooterId === shooterId).map(w => <option key={w.id} value={w.id}>{`${w.manufacturer} ${w.model}`}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-300">{t('points_down')}</label>
                            <input type="number" value={pointsDown} onChange={e => setPointsDown(parseInt(e.target.value) || 0)} min="0" className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">{t('procedurals')}</label>
                            <input type="number" value={procedurals} onChange={e => setProcedurals(parseInt(e.target.value) || 0)} min="0" className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">{t('hit_on_non_threat')}</label>
                            <input type="number" value={hnt} onChange={e => setHnt(parseInt(e.target.value) || 0)} min="0" className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5" />
                        </div>
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


const ShotTimerView: React.FC = () => {
    const { settings } = useAppContext();
    const { addSession, selectDrillForTimer } = useTrainingContext();
    const { t } = useI18n();
    const { currentUser } = useAuth();
    const { shooters } = useShooterContext();

    const [parTime, setParTime] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [pointsDown, setPointsDown] = useState(0);
    const [procedurals, setProcedurals] = useState(0);
    const [hnt, setHnt] = useState(0);
    
    const userShooterProfile = useMemo(() => shooters.find(s => s.uid === currentUser?.uid), [shooters, currentUser]);

    const {
        status,
        timer,
        shots,
        totalTime,
        firstShot,
        splits,
        isParTimeExceeded,
        handleStart,
        handleStop,
        handleReset,
    } = useShotTimer({ settings, parTime });

    const finalTime = useMemo(() => {
        if (shots.length === 0) return 0;
        return totalTime + (pointsDown * 0.5) + (procedurals * 3) + (hnt * 5);
    }, [totalTime, pointsDown, procedurals, hnt, shots.length]);

    useEffect(() => {
        // When a user leaves the timer view, ensure drill selection is cleared.
        return () => {
            selectDrillForTimer(null);
        };
    }, [selectDrillForTimer]);
    
    const handleFullReset = () => {
        handleReset();
        setPointsDown(0);
        setProcedurals(0);
        setHnt(0);
    }

    const handleStartWrapper = () => {
        handleFullReset();
        handleStart();
    }

    const handleSaveSession = async (sessionData: Omit<Session, 'id' | 'date'>) => {
        let finalSessionData = { ...sessionData };
        if (currentUser?.role === UserRole.USER && userShooterProfile) {
            finalSessionData = { ...finalSessionData, shooterId: userShooterProfile.id, shooterName: userShooterProfile.name };
        }
        await addSession(finalSessionData);
        setIsSaving(false);
        handleFullReset();
    };
    
    const canSave = status === 'stopped' && shots.length > 0;

    return (
        <div className="flex flex-col space-y-6">
            <h1 className="text-3xl font-bold text-yellow-400">{t('nav_timer')}</h1>
            
            {/* Timer Display */}
            <div className={`flex items-center justify-center rounded-lg p-4 transition-colors ${isParTimeExceeded ? 'bg-red-900' : 'bg-gray-800'}`}>
                <span className="text-8xl md:text-9xl font-mono font-bold tracking-tighter">
                    {timer.toFixed(2)}
                </span>
            </div>
            
            {/* Main Controls - Moved under timer */}
            <div className="grid grid-cols-1 gap-4">
                <div>
                    {status === 'idle' || status === 'stopped' ? (
                        <button onClick={handleStartWrapper} className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-4 text-2xl rounded-lg shadow-lg transition-transform active:scale-95">{t('start_button')}</button>
                    ) : (
                        <button onClick={handleStop} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 text-2xl rounded-lg shadow-lg transition-transform active:scale-95">
                            {status === 'waiting' ? t('waiting_status') : t('stop_button')}
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={canSave ? () => setIsSaving(true) : undefined} disabled={!canSave} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-700 disabled:cursor-not-allowed shadow transition-colors">{t('save_button')}</button>
                    <button onClick={handleFullReset} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg shadow transition-colors">{t('reset_button')}</button>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-4 text-center shadow">
                    <p className="text-sm text-gray-400">{t('shots')}</p>
                    <p className="text-3xl font-bold">{shots.length}</p>
                </div>
                 <div className="bg-gray-800 rounded-lg p-4 text-center shadow">
                    <p className="text-sm text-gray-400">{t('first_shot')}</p>
                    <p className="text-3xl font-bold">{firstShot.toFixed(2)}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center shadow">
                    <p className="text-sm text-gray-400">{t('last_split')}</p>
                    <p className="text-3xl font-bold">{splits.length > 1 ? splits[splits.length-1].toFixed(2) : '0.00'}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center shadow border border-gray-700">
                    <p className="text-sm text-gray-400">{t('final_time')}</p>
                    <p className="text-3xl font-bold text-yellow-400">{finalTime.toFixed(2)}</p>
                </div>
            </div>

            {/* Settings & Penalties - Merged */}
            <div className="bg-gray-800 rounded-lg p-4 shadow">
                <h3 className="text-lg font-semibold mb-2 text-gray-300">{t('penalties')} & {t('nav_settings')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex flex-col justify-between">
                        <label className="block text-sm font-medium text-gray-300 mb-1">{t('points_down')}</label>
                        <input type="number" value={pointsDown} onChange={e => setPointsDown(parseInt(e.target.value) || 0)} min="0" className="bg-gray-700 border border-gray-600 text-white text-lg font-bold rounded-lg block w-full p-2.5" />
                    </div>
                    <div className="flex flex-col justify-between">
                        <label className="block text-sm font-medium text-gray-300 mb-1">{t('procedurals')}</label>
                        <input type="number" value={procedurals} onChange={e => setProcedurals(parseInt(e.target.value) || 0)} min="0" className="bg-gray-700 border border-gray-600 text-white text-lg font-bold rounded-lg block w-full p-2.5" />
                    </div>
                    <div className="flex flex-col justify-between">
                        <label className="block text-sm font-medium text-gray-300 mb-1">{t('hit_on_non_threat')}</label>
                        <input type="number" value={hnt} onChange={e => setHnt(parseInt(e.target.value) || 0)} min="0" className="bg-gray-700 border border-gray-600 text-white text-lg font-bold rounded-lg block w-full p-2.5" />
                    </div>
                    <div className="flex flex-col justify-between">
                        <label htmlFor="parTime" className="block text-sm font-medium text-gray-300 mb-1">{t('par_time_seconds')}</label>
                        <input id="parTime" type="number" step="0.1" min="0" value={parTime} onChange={e => setParTime(parseFloat(e.target.value) || 0)} className="bg-gray-700 border border-gray-600 text-white text-lg font-bold rounded-lg block w-full p-2.5" placeholder="0" />
                    </div>
                </div>
            </div>

            {/* Timeline */}
            {shots.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-4 shadow">
                    <h3 className="text-lg font-semibold mb-4 text-gray-300">{t('shot_timeline')}</h3>
                    <div className="relative w-full h-10 flex items-center">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-600 rounded"></div>
                        {shots.map((shot, index) => {
                            const position = totalTime > 0 ? (shot.time / totalTime) * 100 : 0;
                            return (
                                <div
                                    key={index}
                                    className="absolute top-1/2 -translate-y-1/2 group"
                                    style={{ left: `${position}%` }}
                                >
                                    <div className="w-3 h-3 bg-yellow-400 rounded-full cursor-pointer transform -translate-x-1/2"></div>
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-gray-900 border border-gray-600 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                        <p>{t('shot')} #{index + 1}: <span className="font-mono">{shot.time.toFixed(2)}s</span></p>
                                        <p>{t('split')}: <span className="font-mono">{splits[index].toFixed(2)}s</span></p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Shot Details List - Full Height Scrolling */}
            <div className="bg-gray-800 rounded-lg p-4 shadow">
                <h3 className="text-lg font-semibold mb-2 text-gray-300">{t('shot_details')}</h3>
                <div className="w-full">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                            <tr>
                                <th className="p-3 rounded-tl-lg">{t('shot')} #</th>
                                <th className="p-3">{t('time')} (s)</th>
                                <th className="p-3 rounded-tr-lg">{t('split')} (s)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {shots.map((shot, index) => (
                                <tr key={index} className="hover:bg-gray-700 transition-colors">
                                    <td className="p-3">{index + 1}</td>
                                    <td className="p-3 font-mono text-lg">{shot.time.toFixed(2)}</td>
                                    <td className="p-3 font-mono text-lg text-yellow-400">{splits[index].toFixed(2)}</td>
                                </tr>
                            ))}
                            {shots.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="text-center text-gray-500 py-8">{t('no_shots_detected')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {isSaving && (
                <SaveSessionForm
                    shots={shots}
                    totalTime={totalTime}
                    firstShotTime={firstShot}
                    splits={splits}
                    initialPointsDown={pointsDown}
                    initialProcedurals={procedurals}
                    initialHnt={hnt}
                    onSave={handleSaveSession}
                    onCancel={() => setIsSaving(false)}
                />
            )}
        </div>
    );
};

export default ShotTimerView;