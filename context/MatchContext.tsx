import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Match, Score, P2PMessage, P2PMessageType } from '../types';
import { db } from '../services/db';

interface MatchContextType {
    matches: Match[];
    saveMatch: (match: Match) => Promise<void>;
    updateMatch: (match: Match) => Promise<void>;
    deleteMatch: (id: string) => Promise<void>;
    handleP2PMessage: (message: P2PMessage) => void;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export const MatchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [matches, setMatches] = useState<Match[]>([]);

    useEffect(() => {
        const loadMatches = async () => {
            const storedMatches = await db.matches.toArray();
            setMatches(storedMatches);
        };
        loadMatches();
    }, []);

    const saveMatch = useCallback(async (match: Match) => {
        const newMatch = { ...match, updatedAt: Date.now() };
        await db.matches.add(newMatch);
        setMatches(prev => [...prev, newMatch]);
    }, []);

    const updateMatch = useCallback(async (match: Match) => {
        const updatedMatch = { ...match, updatedAt: Date.now() };
        await db.matches.put(updatedMatch);
        setMatches(prev => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));
    }, []);

    const deleteMatch = useCallback(async (id: string) => {
        await db.matches.delete(id);
        setMatches(prev => prev.filter(m => m.id !== id));
    }, []);

    const handleP2PMessage = useCallback((message: P2PMessage) => {
        setMatches(prevMatches => {
            switch (message.type) {
                case 'FULL_MATCH_SYNC': {
                    const receivedMatch = message.payload as Match;
                    const existingMatchIndex = prevMatches.findIndex(m => m.id === receivedMatch.id);
                    if (existingMatchIndex !== -1) {
                        const updatedMatches = [...prevMatches];
                        updatedMatches[existingMatchIndex] = receivedMatch;
                        db.matches.put(receivedMatch);
                        return updatedMatches;
                    } else {
                        db.matches.add(receivedMatch);
                        return [...prevMatches, receivedMatch];
                    }
                }
                case 'SCORE_UPDATE': {
                    const score = message.payload as Score;
                    // Find the match this score belongs to. We assume we have it.
                    const matchIndex = prevMatches.findIndex(m => m.stages.some(s => s.id === score.stageId));
                    if (matchIndex === -1) return prevMatches;

                    const updatedMatches = [...prevMatches];
                    const matchToUpdate = { ...updatedMatches[matchIndex] };
                    
                    const scoreIndex = matchToUpdate.scores.findIndex(s => s.shooterId === score.shooterId && s.stageId === score.stageId);
                    if (scoreIndex !== -1) {
                        matchToUpdate.scores[scoreIndex] = score;
                    } else {
                        matchToUpdate.scores.push(score);
                    }
                    
                    matchToUpdate.updatedAt = Date.now();
                    updatedMatches[matchIndex] = matchToUpdate;
                    db.matches.put(matchToUpdate);
                    return updatedMatches;
                }
                default:
                    return prevMatches;
            }
        });
    }, []);

    const value = {
        matches,
        saveMatch,
        updateMatch,
        deleteMatch,
        handleP2PMessage,
    };

    return <MatchContext.Provider value={value}>{children}</MatchContext.Provider>;
};

export const useMatchContext = () => {
    const context = useContext(MatchContext);
    if (!context) {
        throw new Error('useMatchContext must be used within a MatchProvider');
    }
    return context;
};
