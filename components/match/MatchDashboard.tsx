import React, { useState } from 'react';
import { Match, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../hooks/useI18n';
import P2PControls from './P2PControls';
import LeaderboardPanel from './LeaderboardPanel';
import ShootersPanel from './ShootersPanel';
import StagesPanel from './StagesPanel';
import SquadsPanel from './SquadsPanel';
import ScoringRunView from './ScoringRunView';
import ShooterScoringPanel from './ShooterScoringPanel';
import SOSquadView from './SOSquadView';

interface MatchDashboardProps {
    match: Match;
    onUpdate: (match: Match) => void;
    onBack: () => void;
}

type DashboardView = 'leaderboard' | 'shooters' | 'stages' | 'squads' | 'scoring_shooter' | 'scoring_run' | 'so_squad_view';

const MatchDashboard: React.FC<MatchDashboardProps> = ({ match, onUpdate, onBack }) => {
    const { t } = useI18n();
    const { currentUser } = useAuth();
    const [view, setView] = useState<DashboardView>('leaderboard');
    const [scoringContext, setScoringContext] = useState<{ shooterId: string; stageId: string } | null>(null);
    const [selectedShooterId, setSelectedShooterId] = useState<string | null>(null);
    
    const isMd = currentUser?.role === UserRole.MD;
    
    // For SOs, find their assigned squad
    const soSquad = match.squads.find(sq => sq.soId === currentUser?.uid);
    const isSoForThisMatch = !!soSquad;

    const handleStartScoring = (shooterId: string, stageId: string) => {
        setScoringContext({ shooterId, stageId });
        setView('scoring_run');
    };

    const handleSelectShooterForScoring = (shooterId: string) => {
        setSelectedShooterId(shooterId);
        setView('scoring_shooter');
    };

    const renderContent = () => {
        if (isSoForThisMatch && !isMd) {
            return <SOSquadView match={match} squad={soSquad} onStartScoring={handleStartScoring} onBack={onBack} />;
        }
        
        switch (view) {
            case 'scoring_run':
                return <ScoringRunView match={match} context={scoringContext!} onFinish={() => setView(selectedShooterId ? 'scoring_shooter' : 'leaderboard')} />;
            case 'scoring_shooter':
                const shooter = match.shooters.find(s => s.id === selectedShooterId);
                if (!shooter) return <p>Shooter not found</p>;
                return <ShooterScoringPanel match={match} shooter={shooter} onStartScoring={handleStartScoring} onBack={() => setView('leaderboard')} />;
            case 'shooters':
                return <ShootersPanel match={match} onUpdate={onUpdate} />;
            case 'stages':
                return <StagesPanel match={match} onUpdate={onUpdate} />;
            case 'squads':
                return <SquadsPanel match={match} onUpdate={onUpdate} />;
            case 'leaderboard':
            default:
                return <LeaderboardPanel match={match} onScoreShooter={handleSelectShooterForScoring} />;
        }
    };
    
    const isScoringView = view === 'scoring_run' || view === 'scoring_shooter' || (isSoForThisMatch && !isMd);

    return (
        <div className="space-y-6">
            {!isScoringView && (
                <>
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-yellow-400">{match.name}</h1>
                            <p className="text-gray-400">{t('match_dashboard_title')}</p>
                        </div>
                        <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg self-start md:self-auto">
                           &larr; {t('back_to_match_list')}
                        </button>
                    </div>

                    {isMd && <P2PControls match={match} />}
                    
                    {isMd && (
                         <div className="bg-gray-800 p-2 rounded-lg flex gap-2">
                            <button onClick={() => setView('leaderboard')} className={`flex-1 py-2 px-4 rounded ${view === 'leaderboard' ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700'}`}>{t('leaderboard')}</button>
                            <button onClick={() => setView('shooters')} className={`flex-1 py-2 px-4 rounded ${view === 'shooters' ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700'}`}>{t('shooters')}</button>
                            <button onClick={() => setView('stages')} className={`flex-1 py-2 px-4 rounded ${view === 'stages' ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700'}`}>{t('stages')}</button>
                            <button onClick={() => setView('squads')} className={`flex-1 py-2 px-4 rounded ${view === 'squads' ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700'}`}>{t('squads')}</button>
                        </div>
                    )}
                </>
            )}
            
            <div className="bg-gray-800 p-4 rounded-lg">
                {renderContent()}
            </div>
        </div>
    );
};

export default MatchDashboard;
