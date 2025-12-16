import React, { useState } from 'react';
import MatchList from './MatchList';
import MatchCreationWizard from './match/MatchCreationWizard';
import MatchDashboard from './match/MatchDashboard';
import { Match } from '../types';
import { useMatchContext } from '../context/MatchContext';

const MatchView: React.FC = () => {
    const { matches, saveMatch, updateMatch, deleteMatch } = useMatchContext();
    const [view, setView] = useState<'list' | 'create' | 'dashboard'>('list');
    const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

    const handleSelectMatch = (id: string) => {
        setSelectedMatchId(id);
        setView('dashboard');
    };

    const handleStartCreation = () => {
        setView('create');
    };

    const handleFinishCreation = (newMatch: Match) => {
        saveMatch(newMatch);
        setSelectedMatchId(newMatch.id);
        setView('dashboard');
    };
    
    const handleBackToList = () => {
        setSelectedMatchId(null);
        setView('list');
    };

    const selectedMatch = matches.find(m => m.id === selectedMatchId);

    if (view === 'create') {
        return <MatchCreationWizard onFinish={handleFinishCreation} onCancel={() => setView('list')} />;
    }
    
    if (view === 'dashboard' && selectedMatch) {
        return <MatchDashboard match={selectedMatch} onUpdate={updateMatch} onBack={handleBackToList} />;
    }

    return (
        <MatchList
            matches={matches}
            onSelectMatch={handleSelectMatch}
            onStartCreation={handleStartCreation}
            onDeleteMatch={deleteMatch}
        />
    );
};

export default MatchView;