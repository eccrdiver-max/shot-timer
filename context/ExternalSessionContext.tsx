import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ExternalSession } from '../types';
import { db } from '../services/db';
import { firebaseService } from '../services/firebase';
import { useAuth } from './AuthContext';
import Dexie from 'dexie';

interface ExternalSessionContextType {
    externalSessions: ExternalSession[];
    addExternalSession: (sessionData: Omit<ExternalSession, 'id' | 'updatedAt'>) => Promise<void>;
    deleteExternalSession: (id: string) => Promise<void>;
    syncExternalSessions: () => Promise<void>;
}

const ExternalSessionContext = createContext<ExternalSessionContextType | undefined>(undefined);

export const ExternalSessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const [externalSessions, setExternalSessions] = useState<ExternalSession[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const sessions = await db.externalSessions.toArray();
            // Sort by date descending
            sessions.sort((a, b) => b.date - a.date);
            setExternalSessions(sessions);
        };
        loadData();
    }, []);

    const syncExternalSessions = useCallback(async () => {
        if (!currentUser) return;
        try {
            // Push Local to Cloud
            const localSessions = await db.externalSessions.toArray();
            if (localSessions.length > 0) {
                await Promise.all(localSessions.map(session => 
                    firebaseService.saveUserSubcollectionData('externalSessions', session, currentUser.uid)
                ));
            }

            // Pull Cloud to Local
            const cloudSessions = await firebaseService.getUserSubcollectionData('externalSessions', currentUser.uid) as ExternalSession[];
            await db.externalSessions.bulkPut(cloudSessions);
            
            // Update State from Local DB
            const updatedSessions = await db.externalSessions.toArray();
            updatedSessions.sort((a, b) => b.date - a.date);
            setExternalSessions(updatedSessions);
        } catch (error) {
            console.error("External sessions sync failed:", error);
            throw error;
        }
    }, [currentUser]);

    const addExternalSession = useCallback(async (sessionData: Omit<ExternalSession, 'id' | 'updatedAt'>) => {
        const newSession: ExternalSession = {
            ...sessionData,
            id: crypto.randomUUID(),
            updatedAt: Date.now(),
        };
        
        await db.externalSessions.add(newSession);
        
        setExternalSessions(prev => {
            const updated = [newSession, ...prev];
            updated.sort((a, b) => b.date - a.date);
            return updated;
        });
        
        if (currentUser) {
            firebaseService.saveUserSubcollectionData('externalSessions', newSession, currentUser.uid).catch(err => {
                console.error("Background sync of external session failed:", err);
            });
        }
    }, [currentUser]);

    const deleteExternalSession = useCallback(async (id: string) => {
        await db.externalSessions.delete(id);
        setExternalSessions(prev => prev.filter(s => s.id !== id));
        
        if (currentUser) {
            firebaseService.deleteUserSubcollectionData('externalSessions', id, currentUser.uid).catch(err => {
                console.error("Background delete of external session failed:", err);
            });
        }
    }, [currentUser]);

    const value = {
        externalSessions,
        addExternalSession,
        deleteExternalSession,
        syncExternalSessions
    };

    return <ExternalSessionContext.Provider value={value}>{children}</ExternalSessionContext.Provider>;
};

export const useExternalSessionContext = () => {
    const context = useContext(ExternalSessionContext);
    if (!context) {
        throw new Error('useExternalSessionContext must be used within a ExternalSessionProvider');
    }
    return context;
};
