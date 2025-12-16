import React, { useState } from 'react';
import { Match } from '../../types';
import { useP2P, P2PStatus } from '../../context/P2PContext';
import { useI18n } from '../../hooks/useI18n';

const StatusIndicator: React.FC<{ status: P2PStatus }> = ({ status }) => (
    <div className="flex items-center gap-2">
        <span className={`relative flex h-3 w-3`}>
            {status.pulse && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${status.dotColor} opacity-75`}></span>}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${status.dotColor}`}></span>
        </span>
        <span className={status.color}>{status.text}</span>
    </div>
);

const P2PControls: React.FC<{ match: Match }> = ({ match }) => {
    const { peerId, isHost, isConnected, status, startHostSession, joinSession, endSession, setInitialMatch } = useP2P();
    const { t } = useI18n();
    const [hostIdInput, setHostIdInput] = useState('');

    const handleStartHost = () => {
        setInitialMatch(match);
        startHostSession(match);
    };

    const handleJoin = () => {
        if (hostIdInput.trim()) {
            joinSession(hostIdInput.trim());
        }
    };
    
    const handleCopyId = () => {
        if(peerId) navigator.clipboard.writeText(peerId);
    };

    if (isConnected || isHost) {
        return (
            <div className="bg-gray-700 p-4 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4">
                <StatusIndicator status={status} />
                <div className="flex items-center gap-2">
                    {isHost && peerId && (
                        <div className="flex items-center gap-2 bg-gray-800 p-2 rounded">
                            <span className="text-sm font-mono">{peerId}</span>
                            <button onClick={handleCopyId} className="text-xs bg-blue-600 px-2 py-1 rounded">{t('copy_id')}</button>
                        </div>
                    )}
                    <button onClick={endSession} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">{t('end_session')}</button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-700 p-4 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold">{t('p2p_title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <p className="text-sm text-gray-300">{t('p2p_host_instructions')}</p>
                    <button onClick={handleStartHost} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">{t('start_host_session')}</button>
                </div>
                <div className="space-y-2">
                    <p className="text-sm text-gray-300">{t('p2p_join_instructions')}</p>
                    <div className="flex gap-2">
                        <input value={hostIdInput} onChange={e => setHostIdInput(e.target.value)} placeholder={t('enter_host_id')} className="flex-grow bg-gray-600 border border-gray-500 text-white text-sm rounded-lg p-2.5" />
                        <button onClick={handleJoin} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">{t('join_button')}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default P2PControls;
