import React from 'react';
import { Match, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { useI18n } from '../hooks/useI18n';

interface MatchListProps {
    matches: Match[];
    onSelectMatch: (id: string) => void;
    onStartCreation: () => void;
    onDeleteMatch: (id: string) => void;
}

const MatchList: React.FC<MatchListProps> = ({ matches, onSelectMatch, onStartCreation, onDeleteMatch }) => {
    const { currentUser } = useAuth();
    const { showConfirmation } = useModal();
    const { t } = useI18n();

    const handleDelete = (e: React.MouseEvent, match: Match) => {
        e.stopPropagation(); // Prevent triggering onSelectMatch
        showConfirmation(
            t('delete_match_title'),
            t('delete_match_body', { matchName: match.name }),
            () => onDeleteMatch(match.id)
        );
    };
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="text-3xl font-bold text-yellow-400">{t('matches_title')}</h1>
                {currentUser?.role === UserRole.MD && (
                    <button 
                        onClick={onStartCreation} 
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
                    >
                        {t('create_new_match')}
                    </button>
                )}
            </div>
            
            {matches.length === 0 ? (
                <div className="text-center bg-gray-800 rounded-lg p-8">
                    <p className="text-gray-400">{t('no_matches_found')}</p>
                </div>
            ) : (
                <div className="bg-gray-800 rounded-lg p-4">
                    <ul className="space-y-2">
                        {matches.map(match => (
                            <li 
                                key={match.id} 
                                className="bg-gray-700 p-3 rounded-lg flex justify-between items-center group"
                            >
                                <div onClick={() => onSelectMatch(match.id)} className="flex-grow cursor-pointer">
                                    <p className="font-bold text-lg group-hover:text-yellow-400">{match.name}</p>
                                    <p className="text-sm text-gray-400">
                                        {t('match_list_stats', { shooters: match.shooters.length, stages: match.stages.length })}
                                    </p>
                                </div>
                                {currentUser?.role === UserRole.MD && (
                                    <button 
                                        onClick={(e) => handleDelete(e, match)}
                                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm ml-4"
                                    >
                                        {t('delete_button')}
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MatchList;