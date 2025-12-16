import React, { useState, useMemo, useEffect } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useAppContext } from '../context/AppContext';
import { useShotTimer } from '../hooks/useShotTimer';
import { useShooterContext } from '../context/ShooterContext';
import { useTrainingContext } from '../context/TrainingContext';
import { calculateIDPAScore } from '../utils/scoring';
import { Shooter } from '../types';

type RacePhase = 'setup' | 'race' | 'results';

interface RaceResult {
    shooterId: string;
    shooterName: string;
    rawTime: number;
    pointsDown: number;
    procedurals: number;
    hnt: number;
    finalTime: number;
}

const ResultsList: React.FC<{ results: RaceResult[] }> = ({ results }) => {
    const sortedResults = [...results].sort((a,b) => a.finalTime - b.finalTime);
    return (
        <div className="space-y-3">
            {sortedResults.map((res, index) => (
                <div key={res.shooterId} className={`p-4 rounded-lg flex justify-between items-center ${index === 0 ? 'bg-green-800 border border-green-500' : 'bg-gray-700'}`}>
                    <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-gray-400">{index + 1}.</span>
                        <div>
                            <p className="text-xl font-semibold text-left">{res.shooterName}</p>
                            <div className="text-xs text-gray-400 text-left flex flex-wrap gap-x-2 items-center">
                                <span>{`T: ${res.rawTime.toFixed(2)}s`}</span>
                                {res.pointsDown > 0 && <span className="text-orange-400">{`| PD: ${res.pointsDown} (+${(res.pointsDown * 0.5).toFixed(1)}s)`}</span>}
                                {res.procedurals > 0 && <span className="text-red-400">{`| PROC: ${res.procedurals} (+${res.procedurals * 3}s)`}</span>}
                                {res.hnt > 0 && <span className="text-purple-400">{`| HNT: ${res.hnt} (+${res.hnt * 5}s)`}</span>}
                            </div>
                        </div>
                    </div>
                    <p className="text-3xl font-mono font-bold text-yellow-400">{res.finalTime.toFixed(2)}s</p>
                </div>
            ))}
        </div>
    );
};

const TimerInterface: React.FC<{
    status: 'idle' | 'waiting' | 'running' | 'stopped';
    timer: number;
    onStart: () => void;
    onStop: () => void;
}> = ({ status, timer, onStart, onStop }) => {
    const { t } = useI18n();
    return (
        <>
            <div className="flex-grow flex items-center justify-center bg-gray-800 rounded-lg p-4">
                <span className="text-8xl md:text-9xl font-mono font-bold tracking-tighter">
                    {timer.toFixed(2)}
                </span>
            </div>
            <div className="mt-4">
                {status === 'idle' || status === 'stopped' ? (
                    <button onClick={onStart} className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-4 text-2xl rounded-lg">{t('h2h_start_race_button')}</button>
                ) : (
                    <button onClick={onStop} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 text-2xl rounded-lg">
                        {status === 'waiting' ? t('waiting_status') : t('stop_button')}
                    </button>
                )}
            </div>
        </>
    );
};

const PenaltyForm: React.FC<{
    onSubmit: (penalties: { pointsDown: number, procedurals: number, hnt: number }) => void;
    title: string;
    buttonText: string;
}> = ({ onSubmit, title, buttonText }) => {
    const { t } = useI18n();
    const [pointsDown, setPointsDown] = useState(0);
    const [procedurals, setProcedurals] = useState(0);
    const [hnt, setHnt] = useState(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ pointsDown, procedurals, hnt });
    };

    return (
        <div className="space-y-6 max-w-lg mx-auto">
            <h1 className="text-3xl font-bold text-yellow-400 text-center">{title}</h1>
            <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300">{t('points_down')}</label>
                    <input type="number" value={pointsDown} onChange={e => setPointsDown(parseInt(e.target.value) || 0)} min="0" className="bg-gray-700 border border-gray-600 text-white text-2xl rounded-lg block w-full p-2.5 mt-1" autoFocus />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">{t('procedurals')}</label>
                    <input type="number" value={procedurals} onChange={e => setProcedurals(parseInt(e.target.value) || 0)} min="0" className="bg-gray-700 border border-gray-600 text-white text-2xl rounded-lg block w-full p-2.5 mt-1" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">{t('hit_on_non_threat')}</label>
                    <input type="number" value={hnt} onChange={e => setHnt(parseInt(e.target.value) || 0)} min="0" className="bg-gray-700 border border-gray-600 text-white text-2xl rounded-lg block w-full p-2.5 mt-1" />
                </div>
                <div className="pt-4">
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg">{buttonText}</button>
                </div>
            </form>
        </div>
    );
};

const HeadToHeadView: React.FC = () => {
    const { t } = useI18n();
    const { settings } = useAppContext();
    const { shooters } = useShooterContext();
    const { drills, officialDrills } = useTrainingContext();

    const allDrills = useMemo(() => [...drills, ...officialDrills].sort((a, b) => a.name.localeCompare(b.name)), [drills, officialDrills]);
    
    const [phase, setPhase] = useState<RacePhase>('setup');
    const [selectedShooterIds, setSelectedShooterIds] = useState<Set<string>>(new Set());
    const [selectedDrillName, setSelectedDrillName] = useState('');
    
    const [raceResults, setRaceResults] = useState<RaceResult[]>([]);
    const [currentShooterIndex, setCurrentShooterIndex] = useState(0);
    const [currentSubPhase, setCurrentSubPhase] = useState<'timer' | 'penalties'>('timer');
    const [tempRawTime, setTempRawTime] = useState(0);
    const [isStandingsOpen, setIsStandingsOpen] = useState(false);
    
    const { status, timer, handleStart, handleStop, handleReset } = useShotTimer({ settings, parTime: 0 });

    const selectedShootersArray = useMemo(() => Array.from(selectedShooterIds).map(id => shooters.find(s => s.id === id)).filter(Boolean) as Shooter[], [selectedShooterIds, shooters]);
    const currentShooter = useMemo(() => selectedShootersArray[currentShooterIndex], [selectedShootersArray, currentShooterIndex]);
    const nextShooter = useMemo(() => selectedShootersArray[currentShooterIndex + 1], [selectedShootersArray, currentShooterIndex]);

    useEffect(() => {
        if (phase === 'race' && status === 'stopped' && timer > 0) {
            const timeout = setTimeout(() => {
                setTempRawTime(timer);
                setCurrentSubPhase('penalties');
            }, 750);
            return () => clearTimeout(timeout);
        }
    }, [phase, status, timer]);
    
    const handleStartCompetition = () => {
        if (selectedShooterIds.size >= 2 && selectedDrillName) {
            setPhase('race');
            setCurrentShooterIndex(0);
            setCurrentSubPhase('timer');
        } else {
            alert(t('h2h_validation_error'));
        }
    };

    const handleToggleShooter = (shooterId: string) => {
        setSelectedShooterIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(shooterId)) newSet.delete(shooterId);
            else newSet.add(shooterId);
            return newSet;
        });
    };
    
    const handlePenaltySubmit = (penalties: { pointsDown: number, procedurals: number, hnt: number }) => {
        if (!currentShooter) return;
        
        const finalTime = calculateIDPAScore({ time: tempRawTime, pointsDown: penalties.pointsDown, procedurals: penalties.procedurals, h_n_t: penalties.hnt, shooterId: '', stageId: '', updatedAt: 0 });
        
        setRaceResults(prev => [...prev, {
            shooterId: currentShooter.id,
            shooterName: currentShooter.name,
            rawTime: tempRawTime,
            ...penalties,
            finalTime
        }]);

        handleReset();

        if (currentShooterIndex + 1 < selectedShooterIds.size) {
            setCurrentShooterIndex(prev => prev + 1);
            setCurrentSubPhase('timer');
        } else {
            setPhase('results');
        }
    };
    
    const handleNewCompetition = () => {
        setPhase('setup');
        setSelectedShooterIds(new Set());
        setSelectedDrillName('');
        setRaceResults([]);
        setCurrentShooterIndex(0);
        setCurrentSubPhase('timer');
        setTempRawTime(0);
        setIsStandingsOpen(false);
        handleReset();
    };

    if (phase === 'setup') {
        return (
            <div className="space-y-6 max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-yellow-400 text-center">{t('h2h_setup_title')}</h1>
                <div className="bg-gray-800 p-6 rounded-lg space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">{t('h2h_select_competitors')}</label>
                        <div className="mt-2 bg-gray-700 p-3 rounded-lg max-h-60 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-2">
                           {shooters.map(s => (
                                <div key={s.id} className="flex items-center">
                                    <input
                                        id={`shooter-${s.id}`}
                                        type="checkbox"
                                        checked={selectedShooterIds.has(s.id)}
                                        onChange={() => handleToggleShooter(s.id)}
                                        className="h-5 w-5 rounded bg-gray-600 border-gray-500 text-yellow-500 focus:ring-yellow-600"
                                    />
                                    <label htmlFor={`shooter-${s.id}`} className="ml-3 text-white">{s.name}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">{t('h2h_drill_selection')}</label>
                        <select value={selectedDrillName} onChange={e => setSelectedDrillName(e.target.value)} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5 mt-1">
                            <option value="">{t('select_drill_option')}</option>
                            {allDrills.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                        </select>
                    </div>
                    <div className="pt-4">
                         <button onClick={handleStartCompetition} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg">{t('h2h_start_competition')}</button>
                    </div>
                </div>
            </div>
        );
    }

    if (phase === 'race') {
        if (currentSubPhase === 'timer') {
            return (
                <div className="flex flex-col h-full space-y-4">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-yellow-400">{t('h2h_turn_for', { name: currentShooter?.name || '' })}</h1>
                        <p className="text-gray-400">{selectedDrillName}</p>
                    </div>
                    {raceResults.length > 0 && (
                        <div className="flex gap-2">
                             <div className="bg-gray-800 p-2 rounded-lg text-center flex-1">
                                <p className="text-xs text-gray-400 uppercase">{t('h2h_time_to_beat')}</p>
                                <p className="text-xl font-mono font-bold">{Math.min(...raceResults.map(r => r.finalTime)).toFixed(2)}s</p>
                            </div>
                            <button onClick={() => setIsStandingsOpen(true)} className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg text-center flex-1 flex flex-col items-center justify-center border border-gray-600">
                                 <p className="text-xs text-gray-400 uppercase font-bold">{t('h2h_current_standings')}</p>
                                 <svg className="w-5 h-5 text-yellow-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                            </button>
                        </div>
                    )}
                    <TimerInterface status={status} timer={timer} onStart={handleStart} onStop={handleStop} />

                    {isStandingsOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={() => setIsStandingsOpen(false)}>
                            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl border border-gray-700" onClick={e => e.stopPropagation()}>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-yellow-400">{t('h2h_current_standings')}</h2>
                                    <button onClick={() => setIsStandingsOpen(false)} className="text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
                                </div>
                                <div className="overflow-y-auto flex-grow">
                                    <ResultsList results={raceResults} />
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-700">
                                    <button onClick={() => setIsStandingsOpen(false)} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 rounded-lg">{t('close_button')}</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        }
        if (currentSubPhase === 'penalties') {
            const buttonText = nextShooter ? t('h2h_record_and_next') : t('h2h_finish_and_results');
            return <PenaltyForm onSubmit={handlePenaltySubmit} title={t('h2h_penalties_for', { name: currentShooter?.name || '' })} buttonText={buttonText} />;
        }
    }

    if (phase === 'results') {
        return (
            <div className="space-y-6 max-w-lg mx-auto text-center">
                <h1 className="text-3xl font-bold text-yellow-400">{t('h2h_final_ranking')}</h1>
                <div className="bg-gray-800 p-6 rounded-lg">
                   <ResultsList results={raceResults} />
                </div>
                 <button onClick={handleNewCompetition} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg">{t('h2h_reset_competition')}</button>
            </div>
        );
    }
    
    return null;
};

export default HeadToHeadView;