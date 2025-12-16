import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Session, Drill, CommunityDrill, UserProfile, UserRole } from '../types';
import { db } from '../services/db';
import { firebaseService } from '../services/firebase';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import { useI18n } from '../hooks/useI18n';
import { useArmory } from './ArmoryContext';
import { useShooterContext } from './ShooterContext';
import Dexie from 'dexie';

interface TrainingContextType {
    sessions: Session[];
    drills: Drill[];
    officialDrills: Drill[];
    selectedDrillForTimer: string | null;
    addSession: (sessionData: Omit<Session, 'id' | 'date'>) => Promise<void>;
    addDrill: (drillData: Omit<Drill, 'id'>, isOfficial: boolean) => Promise<void>;
    updateDrill: (drill: Drill) => Promise<void>;
    deleteDrill: (drill: Drill) => Promise<void>;
    selectDrillForTimer: (drillName: string | null) => void;
    shareDrill: (drill: Drill) => Promise<void>;
    downloadCommunityDrill: (drill: CommunityDrill) => Promise<void>;
    syncDrillsFromFirestore: () => Promise<void>;
    syncSessions: () => Promise<void>;
}

const TrainingContext = createContext<TrainingContextType | undefined>(undefined);

export const TrainingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const { addNotification } = useNotification();
    const { updateWeaponRoundCount } = useArmory();
    const { shooters } = useShooterContext(); // Import shooters to find linked UIDs
    const { t } = useI18n();

    const [sessions, setSessions] = useState<Session[]>([]);
    const [drills, setDrills] = useState<Drill[]>([]);
    const [officialDrills, setOfficialDrills] = useState<Drill[]>([]);
    const [selectedDrillForTimer, setSelectedDrillForTimer] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            const [s, d, od] = await Promise.all([
                db.sessions.toArray(),
                db.drills.toArray(),
                db.officialDrills.toArray()
            ]);
            setSessions(s);
            setDrills(d);
            setOfficialDrills(od);
        };
        loadData();
    }, []);

    const syncDrillsFromFirestore = useCallback(async () => {
        if (!currentUser) return;
        try {
            const personalDrills = await firebaseService.getUserSubcollectionData('drills', currentUser.uid) as Drill[];
            const allOfficialDrills = await firebaseService.getOfficialDrills();

            await (db as Dexie).transaction('rw', db.drills, db.officialDrills, async () => {
                await db.drills.bulkPut(personalDrills);
                await db.officialDrills.bulkPut(allOfficialDrills);
            });
            
            // After syncing, reload data from the local DB to ensure consistency
            const [updatedPersonal, updatedOfficial] = await Promise.all([
                db.drills.toArray(),
                db.officialDrills.toArray()
            ]);
            setDrills(updatedPersonal);
            setOfficialDrills(updatedOfficial);

        } catch (error) {
            console.error("Firestore drill sync failed:", error);
            throw error; // Rethrow to be caught by AppContext
        }
    }, [currentUser]);

    const syncSessions = useCallback(async () => {
        if (!currentUser) return;
        try {
            // 1. Push Local to Cloud (Ensure local history is backed up)
            const localSessions = await db.sessions.toArray();
            if (localSessions.length > 0) {
                await Promise.all(localSessions.map(session => 
                    firebaseService.saveUserSubcollectionData('sessions', session, currentUser.uid)
                ));
            }

            // 2. Pull Cloud to Local
            const cloudSessions = await firebaseService.getUserSubcollectionData('sessions', currentUser.uid) as Session[];
            await db.sessions.bulkPut(cloudSessions);
            
            // 3. Update State from Local DB
            const updatedSessions = await db.sessions.toArray();
            setSessions(updatedSessions);
        } catch (error) {
            console.error("Sessions sync failed:", error);
            throw error;
        }
    }, [currentUser]);


    const addSession = useCallback(async (sessionData: Omit<Session, 'id' | 'date'>) => {
        const newSession: Session = {
            ...sessionData,
            id: crypto.randomUUID(),
            date: Date.now(),
            updatedAt: Date.now(),
        };
        
        // 1. Save to Local DB
        await db.sessions.add(newSession);
        setSessions(prev => [...prev, newSession]);
        
        if (currentUser) {
            // 2. Sync to Current User's Cloud (MD's backup)
            firebaseService.saveUserSubcollectionData('sessions', newSession, currentUser.uid).catch(err => {
                console.error("Background sync of session failed:", err);
            });

            // 3. SPECIAL FEATURE: If user is MD/SO and the session is for a specific shooter
            // who has a linked User Account (UID), push a copy to THEIR account.
            if ((currentUser.role === UserRole.MD || currentUser.role === UserRole.SO) && sessionData.shooterId) {
                const targetShooter = shooters.find(s => s.id === sessionData.shooterId);
                
                if (targetShooter && targetShooter.uid) {
                    console.log(`Pushing session copy to linked shooter: ${targetShooter.name} (${targetShooter.uid})`);
                    // We save to the *target shooter's* subcollection using their UID
                    firebaseService.saveUserSubcollectionData('sessions', newSession, targetShooter.uid)
                        .then(() => {
                            addNotification(t('session_pushed_to_shooter', { name: targetShooter.name }), 'success');
                        })
                        .catch(err => {
                            console.error("Failed to push session to target shooter:", err);
                            addNotification(t('error_pushing_to_shooter'), 'warning');
                        });
                }
            }
        }

        if (sessionData.weaponId && sessionData.shots.length > 0) {
            updateWeaponRoundCount(sessionData.weaponId, sessionData.shots.length);
        }
    }, [updateWeaponRoundCount, currentUser, shooters, addNotification, t]);

    const addDrill = useCallback(async (drillData: Omit<Drill, 'id'>, isOfficial: boolean) => {
        if (!currentUser) return;
        const newDrill: Drill = { ...drillData, id: crypto.randomUUID() };
        
        if (isOfficial) {
            if (currentUser.role !== UserRole.MD) {
                addNotification(t('md_only_action_error'), 'error');
                return;
            }
            await db.officialDrills.add(newDrill);
            setOfficialDrills(prev => [...prev, newDrill]);
            await firebaseService.saveOfficialDrill(newDrill);
        } else {
            await db.drills.add(newDrill);
            setDrills(prev => [...prev, newDrill]);
            await firebaseService.saveUserSubcollectionData('drills', newDrill, currentUser.uid);
        }
    }, [currentUser, addNotification, t]);

    const updateDrill = useCallback(async (drill: Drill) => {
        if (!currentUser) return;
        if (currentUser.role !== UserRole.MD && drill.isOfficial) {
            addNotification(t('md_only_action_error'), 'error');
            return;
        }
        
        const wasOfficialInState = officialDrills.some(d => d.id === drill.id);
        const isNowOfficial = drill.isOfficial === true;

        // --- Local DB Update ---
        if (wasOfficialInState && !isNowOfficial) {
            await db.officialDrills.delete(drill.id);
            setOfficialDrills(prev => prev.filter(d => d.id !== drill.id));
            await db.drills.put(drill);
            setDrills(prev => [...prev.filter(d => d.id !== drill.id), drill]);
        } else if (!wasOfficialInState && isNowOfficial) {
            await db.drills.delete(drill.id);
            setDrills(prev => prev.filter(d => d.id !== drill.id));
            await db.officialDrills.put(drill);
            setOfficialDrills(prev => [...prev.filter(d => d.id !== drill.id), drill]);
        } else if (isNowOfficial) {
            await db.officialDrills.put(drill);
            setOfficialDrills(prev => prev.map(d => d.id === drill.id ? drill : d));
        } else {
            await db.drills.put(drill);
            setDrills(prev => prev.map(d => d.id === drill.id ? drill : d));
        }
        
        // --- Firestore Update ---
        if (wasOfficialInState && !isNowOfficial) {
            // Official -> Personal
            await firebaseService.deleteOfficialDrill(drill.id);
            await firebaseService.saveUserSubcollectionData('drills', { ...drill, isOfficial: false }, currentUser.uid);
        } else if (!wasOfficialInState && isNowOfficial) {
            // Personal -> Official
            await firebaseService.deleteUserSubcollectionData('drills', drill.id, currentUser.uid);
            await firebaseService.saveOfficialDrill({ ...drill, isOfficial: true });
        } else {
            // No change in official status, just update the document in its current location
            if (isNowOfficial) {
                await firebaseService.saveOfficialDrill(drill);
            } else {
                await firebaseService.saveUserSubcollectionData('drills', drill, currentUser.uid);
            }
        }
    }, [currentUser, officialDrills, addNotification, t]);
    
    const deleteDrill = useCallback(async (drill: Drill) => {
        if (!currentUser) return;
        const isOfficial = officialDrills.some(d => d.id === drill.id);

        if (isOfficial) {
             if (currentUser.role !== UserRole.MD) {
                addNotification(t('md_only_action_error'), 'error');
                return;
            }
            await db.officialDrills.delete(drill.id);
            setOfficialDrills(prev => prev.filter(d => d.id !== drill.id));
            await firebaseService.deleteOfficialDrill(drill.id);
        } else {
            await db.drills.delete(drill.id);
            setDrills(prev => prev.filter(d => d.id !== drill.id));
            await firebaseService.deleteUserSubcollectionData('drills', drill.id, currentUser.uid);
        }
    }, [currentUser, officialDrills, addNotification, t]);

    const selectDrillForTimer = (drillName: string | null) => {
        setSelectedDrillForTimer(drillName);
    };

    const shareDrill = useCallback(async (drill: Drill) => {
        if (!currentUser) {
            addNotification(t('notification_login_to_share'), 'error');
            return;
        }
        try {
            await firebaseService.shareDrill(drill, currentUser.uid, currentUser.email);
            addNotification(t('notification_drill_shared_success'), 'success');
        } catch (error) {
            console.error("Failed to share drill", error);
            addNotification(t('notification_drill_shared_error'), 'error');
        }
    }, [currentUser, addNotification, t]);
    
    const downloadCommunityDrill = useCallback(async (drill: CommunityDrill) => {
        try {
            const newDrill: Omit<Drill, 'id'> = {
                name: drill.name,
                description: drill.description
            };
            await addDrill(newDrill, false);
            await firebaseService.incrementDrillDownloads(drill.id);
            addNotification(t('notification_drill_downloaded_success', { drillName: drill.name }), 'success');
        } catch (error) {
            console.error("Failed to download community drill", error);
            addNotification(t('notification_drill_downloaded_error'), 'error');
        }
    }, [addDrill, addNotification, t]);

    const value = {
        sessions,
        drills,
        officialDrills,
        selectedDrillForTimer,
        addSession,
        addDrill,
        updateDrill,
        deleteDrill,
        selectDrillForTimer,
        shareDrill,
        downloadCommunityDrill,
        syncDrillsFromFirestore,
        syncSessions // Export renamed function
    };

    return <TrainingContext.Provider value={value}>{children}</TrainingContext.Provider>;
};

export const useTrainingContext = () => {
    const context = useContext(TrainingContext);
    if (!context) {
        throw new Error('useTrainingContext must be used within a TrainingProvider');
    }
    return context;
};