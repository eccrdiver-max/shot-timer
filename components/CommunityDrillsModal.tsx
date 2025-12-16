import React, { useState, useEffect } from 'react';
import { useI18n } from '../hooks/useI18n';
import { firebaseService } from '../services/firebase';
import { CommunityDrill } from '../types';
import { useTrainingContext } from '../context/TrainingContext';
import { useAuth } from '../context/AuthContext';

const Spinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

interface CommunityDrillsModalProps {
    onClose: () => void;
}

const CommunityDrillsModal: React.FC<CommunityDrillsModalProps> = ({ onClose }) => {
    const { t } = useI18n();
    const { downloadCommunityDrill } = useTrainingContext();
    const { currentUser } = useAuth();
    const [drills, setDrills] = useState<CommunityDrill[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchDrills = async () => {
            if (!currentUser) {
                setError(t('unauthorized_access'));
                setLoading(false);
                return;
            }
            try {
                const communityDrills = await firebaseService.getCommunityDrills();
                setDrills(communityDrills as CommunityDrill[]);
            } catch (err) {
                console.error("Failed to fetch community drills", err);
                setError(t('error_fetching_community_drills'));
            } finally {
                setLoading(false);
            }
        };
        fetchDrills();
    }, [t, currentUser]);

    const handleDownload = async (drill: CommunityDrill) => {
        setDownloadingId(drill.id);
        await downloadCommunityDrill(drill);
        setDownloadingId(null);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-yellow-400">{t('browse_community_drills')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
                </div>
                
                <div className="overflow-y-auto flex-grow pr-2">
                    {loading ? (
                        <div className="flex justify-center items-center h-48"><Spinner /></div>
                    ) : error ? (
                        <p className="text-center text-red-400">{error}</p>
                    ) : drills.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">{t('no_community_drills_found')}</p>
                    ) : (
                        <div className="space-y-3">
                            {drills.map(drill => (
                                <div key={drill.id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-lg">{drill.name}</p>
                                        <p className="text-sm text-gray-300">{drill.description}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {t('author')}: {drill.authorEmail || t('unknown_author')} | {t('downloads')}: {drill.downloads || 0}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDownload(drill)}
                                        disabled={downloadingId === drill.id}
                                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center min-w-[100px]"
                                    >
                                        {downloadingId === drill.id ? <Spinner /> : t('download_button')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommunityDrillsModal;