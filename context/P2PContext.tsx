
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Peer } from 'peerjs';
import { Match, P2PMessage, P2PMessagePayload, Score } from '../types';
import { useMatchContext } from './MatchContext';
import { useNotification } from './NotificationContext';
import { useI18n } from '../hooks/useI18n';

export interface P2PStatus {
    text: string;
    color: string;
    dotColor: string;
    pulse: boolean;
}

interface P2PContextType {
    peerId: string | null;
    isHost: boolean;
    isConnected: boolean;
    isOnline: boolean;
    queueSize: number;
    status: P2PStatus;
    startHostSession: (match: Match) => void;
    joinSession: (hostId: string) => void;
    broadcast: (message: { type: P2PMessage['type']; payload: P2PMessagePayload }) => Promise<void>;
    endSession: () => void;
    setInitialMatch: (match: Match) => void;
}

const P2PContext = createContext<P2PContextType | undefined>(undefined);

// Google's public STUN servers are reliable for basic NAT traversal.
const PEER_CONFIG = {
    debug: 2,
    config: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
        ],
    },
};

const sendWithRetry = async (conn: any, data: string, retries = 3, delay = 100): Promise<boolean> => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      if (conn.open) {
          conn.send(data);
          return true; // Success
      } else {
           throw new Error("Connection is not open.");
      }
    } catch (error) {
      console.warn(`Send attempt ${attempt + 1} failed for peer ${conn.peer}. Retrying in ${delay}ms...`, error);
      attempt++;
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }
  console.error(`Failed to send message to peer ${conn.peer} after ${retries} attempts.`);
  return false; // Failure
};

export const P2PProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { handleP2PMessage } = useMatchContext();
    const { addNotification } = useNotification();
    const { t } = useI18n();
    const [peer, setPeer] = useState<any | null>(null);
    const [peerId, setPeerId] = useState<string | null>(null);
    const [isHost, setIsHost] = useState(false);
    const [connections, setConnections] = useState<any[]>([]);
    const [isOnline, setIsOnline] = useState(false);
    const [messageQueue, setMessageQueue] = useState<P2PMessage[]>([]);
    const initialMatchRef = useRef<Match | null>(null);
    const heartbeatIntervalRef = useRef<number | null>(null);

    const isPeerConnected = peer && !peer.disconnected;
    const isConnected = connections.length > 0 && isPeerConnected;

    const cleanup = useCallback(() => {
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
        }
        if (peer) {
            peer.destroy();
        }
        setPeer(null);
        setPeerId(null);
        setIsHost(false);
        setConnections([]);
        setIsOnline(false);
        setMessageQueue([]); // Clear queue on full session end
        initialMatchRef.current = null;
    }, [peer]);

    useEffect(() => {
        return () => {
            if (peer) peer.destroy();
        };
    }, [peer]);
    
    const setInitialMatch = useCallback((match: Match) => {
        initialMatchRef.current = match;
    }, []);

    const initializePeer = useCallback((id?: string) => {
        if (peer) {
            peer.destroy();
        }
        
        try {
            // Apply config with STUN servers
            const newPeer = id ? new Peer(id, PEER_CONFIG) : new Peer(PEER_CONFIG);

            newPeer.on('open', (id: string) => {
                setPeerId(id);
            });

            newPeer.on('error', (err: any) => {
                console.error('PeerJS Error:', err);
                 if (err.type === 'peer-unavailable') {
                    alert(t('p2p_peer_unavailable_alert'));
                    addNotification(t('p2p_could_not_connect'), "error");
                    cleanup();
                } else if (err.type === 'disconnected' || err.type === 'network' || err.type === 'webrtc') {
                    setIsOnline(false);
                    addNotification(t('p2p_connection_lost_reconnecting'), "warning");
                    console.log("Peer disconnected from server, attempting to reconnect...");
                    newPeer.reconnect();
                }
            });
            
            newPeer.on('disconnected', () => {
                 setIsOnline(false);
                 addNotification(t('p2p_disconnected_reconnecting'), "warning");
                 console.log("Peer disconnected. Will attempt to reconnect automatically.");
            });

            newPeer.on('close', () => {
                console.log("Peer connection closed permanently.");
                setIsOnline(false);
            });
            
            setPeer(newPeer);
            return newPeer;
        } catch (error) {
            console.error("Failed to initialize PeerJS. The library might not be loaded.", error);
            addNotification(t('p2p_library_failed'), "error");
            return null;
        }
    }, [cleanup, addNotification, peer, t]);


    const startHostSession = (match: Match) => {
        cleanup();
        const newPeer = initializePeer();
        if (!newPeer) return; 
        setIsHost(true);
        setIsOnline(true);
        setInitialMatch(match);
        addNotification(t('p2p_host_session_started'), "success");

        newPeer.on('connection', (conn: any) => {
            console.log(`Incoming connection from ${conn.peer}`);
            addNotification(t('p2p_client_connected', { clientId: conn.peer.slice(-4) }), "info");
            
            conn.on('open', () => {
                (conn as any).lastSeen = Date.now();
                setConnections(prev => [...prev, conn]);
                const syncMessage: P2PMessage = { type: 'FULL_MATCH_SYNC', payload: initialMatchRef.current!, messageId: crypto.randomUUID() };
                sendWithRetry(conn, JSON.stringify(syncMessage));
            });

            conn.on('data', (data: string) => {
                (conn as any).lastSeen = Date.now();
                const message: P2PMessage = JSON.parse(data);

                if (message.type === 'HEARTBEAT_ACK') return;
                
                handleP2PMessage(message);
                // Forward to other clients
                connections.forEach(c => {
                    if (c.peer !== conn.peer && c.open) {
                        sendWithRetry(c, data);
                    }
                });
            });
            
            conn.on('close', () => {
                console.log(`Connection closed with ${conn.peer}`);
                addNotification(t('p2p_client_disconnected', { clientId: conn.peer.slice(-4) }), "info");
                setConnections(prev => prev.filter(c => c.peer !== conn.peer));
            });
             conn.on('error', (err:any) => {
                console.error(`Connection error with ${conn.peer}:`, err);
                conn.close(); // Force close on error
            });
        });
    };

    const joinSession = (hostId: string) => {
        cleanup();
        const newPeer = initializePeer();
        if (!newPeer) return;
        setIsHost(false);
        addNotification(t('p2p_connecting_to_host', { hostId }), "info");

        newPeer.on('open', () => {
            const conn = newPeer.connect(hostId, { reliable: true });

            conn.on('open', () => {
                console.log(`Connected to host ${hostId}`);
                setConnections([conn]);
                setIsOnline(true); // Connection is live
                addNotification(t('p2p_connected_to_host'), "success");
            });

            conn.on('data', (data: string) => {
                const message: P2PMessage = JSON.parse(data);
                
                if (message.type === 'HEARTBEAT') {
                    sendWithRetry(conn, JSON.stringify({ type: 'HEARTBEAT_ACK', payload: {}, messageId: crypto.randomUUID() }), 2, 50);
                    return;
                }

                handleP2PMessage(message);
            });
            
            conn.on('close', () => {
                 console.log('Connection to host closed. Will attempt to reconnect.');
                 addNotification(t('p2p_host_connection_lost'), "warning");
                 setIsOnline(false);
            });
            conn.on('error', (err:any) => {
                console.error(`Connection error with host ${conn.peer}:`, err);
                setIsOnline(false);
            });
        });
    };
    
    const broadcast = useCallback(async (message: { type: P2PMessage['type']; payload: P2PMessagePayload }) => {
        if (!peer) return;
        
        const fullMessage: P2PMessage = { ...message, messageId: crypto.randomUUID() };

        // Host needs to update its own state immediately, and then broadcast
        if (isHost) {
            handleP2PMessage(fullMessage);
            const data = JSON.stringify(fullMessage);
            // Use Promise.all to handle concurrent async operations
            await Promise.all(connections.map(async conn => {
                const success = await sendWithRetry(conn, data);
                 if (!success) {
                    console.log(`Closing connection to unresponsive peer ${conn.peer}`);
                    conn.close();
                }
            }));
            return;
        }

        if (!isOnline) {
            console.log("Offline. Queuing message:", fullMessage.type);
            setMessageQueue(prev => [...prev, fullMessage]);
            return;
        }

        const clientConnection = connections[0];
        if (clientConnection && clientConnection.open) {
            const data = JSON.stringify(fullMessage);
            const success = await sendWithRetry(clientConnection, data);
            if (!success) {
                console.log("Send failed, connection likely lost. Going offline and queuing.");
                setIsOnline(false);
                setMessageQueue(prev => [...prev, fullMessage]);
            }
        } else {
             console.log("No open connection. Queuing message:", fullMessage.type);
             setMessageQueue(prev => [...prev, fullMessage]);
             setIsOnline(false);
        }
    }, [peer, connections, isHost, isOnline, handleP2PMessage]);

    useEffect(() => {
        const processQueue = async () => {
            if (isOnline && messageQueue.length > 0 && connections.length > 0 && !isHost) {
                const queueLength = messageQueue.length;
                console.log(`Connection restored. Processing ${queueLength} queued messages...`);
                addNotification(t('p2p_syncing_offline_scores', { count: queueLength }), "info");
                
                const clientConnection = connections[0];
                const stillUnsent: P2PMessage[] = [];

                for (const message of messageQueue) {
                    const data = JSON.stringify(message);
                    const success = await sendWithRetry(clientConnection, data);
                    if (!success) {
                        console.warn(`Failed to send queued message ${message.messageId}, keeping in queue.`);
                        stillUnsent.push(message);
                        setIsOnline(false); 
                        break; 
                    }
                }
                if (stillUnsent.length === 0 && queueLength > 0) {
                    addNotification(t('p2p_sync_complete'), "success");
                }
                setMessageQueue(stillUnsent);
            }
        };
        processQueue();
    }, [isOnline, messageQueue, connections, isHost, addNotification, t]);


    // Heartbeat mechanism for host
    useEffect(() => {
        if (!isHost || heartbeatIntervalRef.current) {
            return;
        }

        const HEARTBEAT_INTERVAL = 5000;
        const CONNECTION_TIMEOUT = 15000;

        heartbeatIntervalRef.current = window.setInterval(() => {
            connections.forEach(conn => {
                if (Date.now() - (conn as any).lastSeen > CONNECTION_TIMEOUT) {
                    console.log(`Connection with ${conn.peer} timed out. Closing.`);
                    conn.close();
                } else {
                    const fullMessage: P2PMessage = { type: 'HEARTBEAT', payload: {}, messageId: crypto.randomUUID() };
                    sendWithRetry(conn, JSON.stringify(fullMessage));
                }
            });
        }, HEARTBEAT_INTERVAL);

        return () => {
            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
                heartbeatIntervalRef.current = null;
            }
        };
    }, [isHost, connections]);
    
    const status: P2PStatus = useMemo(() => {
        if (!isConnected && !peerId) {
            return { text: t('p2p_status_inactive'), color: "text-gray-400", dotColor: "bg-gray-400", pulse: false };
        }
         if (isHost) {
             if (connections.length > 0) {
                 return { text: t('p2p_status_host_active_clients', { count: connections.length }), color: "text-green-400", dotColor: "bg-green-400", pulse: true };
             }
             return { text: t('p2p_status_host_waiting'), color: "text-yellow-400", dotColor: "bg-yellow-400", pulse: true };
         }
        if (isOnline) {
            if (messageQueue.length > 0) {
                return { text: t('p2p_status_syncing', { count: messageQueue.length }), color: "text-yellow-400", dotColor: "bg-yellow-400", pulse: true };
            }
            return { text: t('p2p_status_connected_active'), color: "text-green-400", dotColor: "bg-green-400", pulse: true };
        } else {
            const pendingText = messageQueue.length > 0 ? t('p2p_status_pending_queue', { count: messageQueue.length }) : '';
            return { text: `${t('p2p_status_offline_reconnecting')}${pendingText}`, color: "text-orange-400", dotColor: "bg-orange-400", pulse: true };
        }
    }, [isConnected, isHost, isOnline, messageQueue.length, t, peerId, connections.length]);

    const endSession = () => {
        addNotification(t('p2p_session_ended'), "info");
        cleanup();
    };

    const value: P2PContextType = {
        peerId,
        isHost,
        isConnected,
        isOnline,
        queueSize: messageQueue.length,
        status,
        startHostSession,
        joinSession,
        broadcast,
        endSession,
        setInitialMatch,
    };

    return <P2PContext.Provider value={value}>{children}</P2PContext.Provider>;
};

export const useP2P = () => {
    const context = useContext(P2PContext);
    if (context === undefined) {
        throw new Error('useP2P must be used within a P2PProvider');
    }
    return context;
};
