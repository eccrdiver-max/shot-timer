import React, { useMemo } from 'react';
import { Session } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useI18n } from '../hooks/useI18n';

interface PenaltiesChartProps {
    sessions: Session[];
}

const PenaltiesChart: React.FC<PenaltiesChartProps> = ({ sessions }) => {
    const { t } = useI18n();

    const chartData = useMemo(() => {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const recentSessions = sessions.filter(s => s.date > ninetyDaysAgo.getTime());
        
        if (recentSessions.length < 5) return [];

        type ChartDataPoint = { date: string; pointsDown: number; procedurals: number; hnt: number };

        const data = recentSessions.reduce((acc, session) => {
            const date = new Date(session.date).toLocaleDateString();
            if (!acc[date]) {
                acc[date] = { date, pointsDown: 0, procedurals: 0, hnt: 0 };
            }
            acc[date].pointsDown += session.pointsDown || 0;
            acc[date].procedurals += session.procedurals || 0;
            acc[date].hnt += session.hnt || 0;
            return acc;
        }, {} as Record<string, ChartDataPoint>);
        
        // FIX: Explicitly type the sort parameters to resolve 'unknown' type errors.
        return Object.values(data).sort((a: ChartDataPoint, b: ChartDataPoint) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [sessions]);

    if (chartData.length === 0) {
        return (
            <div className="bg-gray-800 p-6 rounded-lg flex flex-col items-center justify-center h-full">
                 <h2 className="text-2xl font-semibold text-yellow-400 mb-4">{t('penalties_analysis_title')}</h2>
                 <p className="text-gray-500">{t('no_penalty_data')}</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-yellow-400 mb-4">{t('penalties_analysis_title')}</h2>
            <div style={{ width: '100%', height: 300 }}>
                 <ResponsiveContainer>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                        <XAxis dataKey="date" stroke="#a0aec0" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#a0aec0" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }}
                            labelStyle={{ color: '#f7fafc' }}
                        />
                        <Legend wrapperStyle={{ color: '#cbd5e0' }} />
                        <Bar dataKey="pointsDown" name={t('points_down')} stackId="a" fill="#ed8936" />
                        <Bar dataKey="procedurals" name={t('procedurals')} stackId="a" fill="#f56565" />
                        <Bar dataKey="hnt" name={t('hit_on_non_threat')} stackId="a" fill="#9f7aea" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PenaltiesChart;