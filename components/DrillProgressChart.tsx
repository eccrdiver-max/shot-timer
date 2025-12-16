import React from 'react';
import { Session } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useI18n } from '../hooks/useI18n';

interface DrillProgressChartProps {
    sessions: Session[];
    drillName: string;
    onClose: () => void;
}

const DrillProgressChart: React.FC<DrillProgressChartProps> = ({ sessions, drillName, onClose }) => {
    const { t } = useI18n();

    // Sort sessions chronologically to ensure the line chart progresses correctly.
    // Also, format data for the chart, ensuring values are numbers.
    const chartData = [...sessions]
        .sort((a, b) => a.date - b.date)
        .map((session, index) => ({
            name: `${index + 1}`, // Use a simple index for the X-axis label.
            fullLabel: new Date(session.date).toLocaleString(), // A more descriptive label for the tooltip.
            'Total Time': parseFloat(session.totalTime.toFixed(2)),
            'First Shot': parseFloat(session.firstShotTime.toFixed(2)),
        }));

    // Custom tooltip to show detailed information on hover.
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-gray-700 p-2 border border-gray-600 rounded text-sm shadow-lg">
                    <p className="text-gray-300 mb-1 font-semibold">{data.fullLabel}</p>
                    {payload.map((p: any) => (
                        <p key={p.dataKey} style={{ color: p.color }}>{`${p.name}: ${p.value}s`}</p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-3xl shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-yellow-400">{t('chart_performance_for', { drillName })}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
                </div>
                <div style={{ width: '100%', height: 400 }}>
                    {chartData.length >= 2 ? (
                        <ResponsiveContainer>
                            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#a0aec0" 
                                    tick={{ fontSize: 12 }}
                                    label={{ value: t('total_sessions'), position: 'insideBottom', offset: -15, fill: '#a0aec0', fontSize: 14 }} 
                                />
                                <YAxis 
                                    stroke="#a0aec0" 
                                    tick={{ fontSize: 12 }}
                                    label={{ value: t('time_in_seconds'), angle: -90, position: 'insideLeft', fill: '#a0aec0', fontSize: 14, dx: -10 }} 
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ color: '#cbd5e0' }} />
                                <Line type="monotone" dataKey="Total Time" name={t('total_time')} stroke="#f6e05e" strokeWidth={2} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="First Shot" name={t('first_shot')} stroke="#63b3ed" strokeWidth={2} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <p>{t('not_enough_data_for_chart')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DrillProgressChart;
