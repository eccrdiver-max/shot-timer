import React, { useState, useMemo } from 'react';
import { useExternalSessionContext } from '../context/ExternalSessionContext';
import { useTrainingContext } from '../context/TrainingContext';
import { useI18n } from '../hooks/useI18n';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ExternalDiaryView: React.FC = () => {
    const { externalSessions, addExternalSession, deleteExternalSession } = useExternalSessionContext();
    const { drills, officialDrills } = useTrainingContext();
    const { t } = useI18n();

    const [isAdding, setIsAdding] = useState(false);
    const [selectedChartDrill, setSelectedChartDrill] = useState<string>('all');
    const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [formDrillName, setFormDrillName] = useState<string>('');
    const [formTotalTime, setFormTotalTime] = useState<number>(0);
    const [formPenalties, setFormPenalties] = useState<number>(0);
    const [formNotes, setFormNotes] = useState<string>('');

    const allDrills = [...officialDrills, ...drills];

    // Unique drills from the external sessions for the chart dropdown
    const uniqueSessionDrills = useMemo(() => {
        const uniqueNames = new Set(externalSessions.map(s => s.drillName));
        return Array.from(uniqueNames).sort();
    }, [externalSessions]);

    // Data for the chart
    const chartData = useMemo(() => {
        if (selectedChartDrill === 'all') return [];
        return externalSessions
            .filter(s => s.drillName === selectedChartDrill)
            .sort((a, b) => a.date - b.date) // Chronological order
            .map((s, i) => ({
                name: `${i + 1}`,
                fullLabel: new Date(s.date).toLocaleDateString(),
                'Tempo Totale': s.totalTime,
                'Penalità': s.penalties
            }));
    }, [externalSessions, selectedChartDrill]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formDrillName) {
            alert(t('alert_drill_name_required'));
            return;
        }

        const dateTimestamp = new Date(formDate).getTime();
        
        await addExternalSession({
            date: dateTimestamp,
            drillName: formDrillName,
            totalTime: Number(formTotalTime),
            penalties: Number(formPenalties),
            notes: formNotes
        });

        setIsAdding(false);
        setFormTotalTime(0);
        setFormPenalties(0);
        setFormNotes('');
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-gray-700 p-2 border border-gray-600 rounded text-sm shadow-lg">
                    <p className="text-gray-300 mb-1 font-semibold">{data.fullLabel}</p>
                    {payload.map((p: any) => (
                        <p key={p.dataKey} style={{ color: p.color }}>{`${p.name}: ${p.value}`}</p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-yellow-400">{t('external_diary_title')}</h1>
                    <p className="text-gray-400 mt-1">{t('external_diary_subtitle')}</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded-lg flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    <span className="hidden md:inline">{t('add_external_session')}</span>
                </button>
            </div>

            {/* Chart Section */}
            {uniqueSessionDrills.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-200">
                            {selectedChartDrill !== 'all' 
                                ? t('chart_progress_for', { drillName: selectedChartDrill }) 
                                : t('select_drill')}
                        </h2>
                        <select
                            value={selectedChartDrill}
                            onChange={(e) => setSelectedChartDrill(e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white rounded-md p-2"
                        >
                            <option value="all">-- {t('select_drill')} --</option>
                            {uniqueSessionDrills.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>

                    {selectedChartDrill !== 'all' && (
                        <div style={{ width: '100%', height: 300 }}>
                            {chartData.length >= 2 ? (
                                <ResponsiveContainer>
                                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                                        <XAxis 
                                            dataKey="name" 
                                            stroke="#a0aec0" 
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis 
                                            yAxisId="left"
                                            stroke="#f6e05e" 
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis 
                                            yAxisId="right"
                                            orientation="right"
                                            stroke="#fc8181" 
                                            tick={{ fontSize: 12 }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ color: '#cbd5e0' }} />
                                        <Line yAxisId="left" type="monotone" dataKey="Tempo Totale" name={t('total_time')} stroke="#f6e05e" strokeWidth={2} activeDot={{ r: 6 }} />
                                        <Line yAxisId="right" type="monotone" dataKey="Penalità" name={t('penalties')} stroke="#fc8181" strokeWidth={2} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <p>{t('not_enough_data_for_chart')}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* List Section */}
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-gray-200">{t('sessions_logged')}</h2>
                </div>
                {externalSessions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        {t('no_external_sessions')}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('session_date')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('drill_name')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('total_time')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('penalties')}</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">{t('actions_label')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {externalSessions.map(session => (
                                    <tr key={session.id} className="hover:bg-gray-750 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {new Date(session.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                            {session.drillName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-400 font-mono">
                                            {session.totalTime.toFixed(2)}s
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400 font-mono">
                                            {session.penalties}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => {
                                                    if(window.confirm(t('delete_external_session_body'))) {
                                                        deleteExternalSession(session.id);
                                                    }
                                                }} 
                                                className="text-red-400 hover:text-red-300 p-1"
                                                title={t('delete_button')}
                                            >
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {isAdding && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl border border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-yellow-400">{t('add_external_session')}</h2>
                            <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">{t('session_date')}</label>
                                <input
                                    type="date"
                                    required
                                    value={formDate}
                                    onChange={(e) => setFormDate(e.target.value)}
                                    className="w-full bg-gray-700 border-gray-600 rounded-md text-white px-3 py-2 focus:ring-yellow-500 focus:border-yellow-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">{t('drill_name')}</label>
                                <input
                                    type="text"
                                    required
                                    value={formDrillName}
                                    onChange={(e) => setFormDrillName(e.target.value)}
                                    list="drills-list"
                                    className="w-full bg-gray-700 border-gray-600 rounded-md text-white px-3 py-2 focus:ring-yellow-500 focus:border-yellow-500"
                                    placeholder={t('drill_name')}
                                />
                                <datalist id="drills-list">
                                    {allDrills.map(d => (
                                        <option key={d.id} value={d.name} />
                                    ))}
                                </datalist>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">{t('total_time')}</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formTotalTime}
                                        onChange={(e) => setFormTotalTime(Number(e.target.value))}
                                        className="w-full bg-gray-700 border-gray-600 rounded-md text-white px-3 py-2 focus:ring-yellow-500 focus:border-yellow-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">{t('penalties')}</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formPenalties}
                                        onChange={(e) => setFormPenalties(Number(e.target.value))}
                                        className="w-full bg-gray-700 border-gray-600 rounded-md text-white px-3 py-2 focus:ring-yellow-500 focus:border-yellow-500"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">{t('notes_placeholder')}</label>
                                <textarea
                                    value={formNotes}
                                    onChange={(e) => setFormNotes(e.target.value)}
                                    className="w-full bg-gray-700 border-gray-600 rounded-md text-white px-3 py-2 focus:ring-yellow-500 focus:border-yellow-500"
                                    rows={2}
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700"
                                >
                                    {t('cancel_button')}
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-md"
                                >
                                    {t('save_button')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExternalDiaryView;
