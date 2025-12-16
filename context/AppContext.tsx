import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppView, Settings, UserRole, UserProfile } from '../types';
import { db } from '../services/db';
import { useI18n } from '../hooks/useI18n';
import { useShooterContext } from './ShooterContext';
import { useTrainingContext } from './TrainingContext';
import { useAuth } from './AuthContext';
import { useArmory } from './ArmoryContext';

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

interface AppContextType {
    view: AppView;
    setView: (view: AppView) => void;
    settings: Settings;
    updateSettings: (newSettings: Settings) => void;
    syncStatus: SyncStatus;
    triggerFullSync: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_SETTINGS: Settings = {
    micSensitivity: 80,
    randomStartMin: 1.5,
    randomStartMax: 4.0,
    autoStopDelay: 2.0,
    language: 'it',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [view, setView] = useState<AppView>(AppView.DASHBOARD);
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
    const { setLanguage } = useI18n();
    const { syncDataFromFirestore: syncShooterData } = useShooterContext();
    const { syncDrillsFromFirestore, syncSessions } = useTrainingContext();
    const { syncArmoryFromFirestore } = useArmory();
    const { currentUser, fetchAllUsers } = useAuth();


    useEffect(() => {
        const loadSettings = async () => {
            const storedSettings = await db.settings.get(1);
            if (storedSettings) {
                setSettings(storedSettings);
                setLanguage(storedSettings.language);
            } else {
                await db.settings.put(DEFAULT_SETTINGS, 1);
            }
        };
        loadSettings();
    }, [setLanguage]);

    const updateSettings = useCallback(async (newSettings: Settings) => {
        setSettings(newSettings);
        
        // Sanitize the settings object before saving to DB.
        // We remove the 'id' property if it exists to ensure Dexie handles the primary key (1) correctly
        // without conflict, as 'id' is often present in the object retrieved from DB but redundant for the 'put' with explicit key.
        const settingsToSave = { ...newSettings };
        if (settingsToSave.id) {
            delete settingsToSave.id;
        }

        await db.settings.put(settingsToSave, 1);
        
        if (newSettings.language !== settings.language) {
            setLanguage(newSettings.language);
        }
    }, [settings.language, setLanguage]);

    const triggerFullSync = useCallback(async () => {
        if (syncStatus === 'syncing' || !currentUser) return;
        setSyncStatus('syncing');
        try {
            let userProfiles: UserProfile[] = [];
            // Step 1: Only MDs fetch all user profiles for management and advanced sync features.
            if (currentUser.role === UserRole.MD) {
                console.log("Step 1: Syncing all user profiles (MD only)...");
                userProfiles = await fetchAllUsers();
            }

            // Step 2: Sync clubs and shooters (now fetches from global collections)
            console.log("Step 2: Syncing clubs and shooters...");
            await syncShooterData(userProfiles); // Pass profiles for MD's name correction feature

            // Step 3: Sync drills (personal and official)
            console.log("Step 3: Syncing drills...");
            await syncDrillsFromFirestore();

            // Step 4: Sync Armory (personal weapons and logs)
            console.log("Step 4: Syncing armory...");
            await syncArmoryFromFirestore();

            // Step 5: Sync Training Sessions (History)
            console.log("Step 5: Syncing sessions...");
            await syncSessions();

            setSyncStatus('success');
            setTimeout(() => setSyncStatus('idle'), 3000);
        } catch (error) {
            console.error("Full sync failed", error);
            setSyncStatus('error');
        }
    }, [syncShooterData, syncDrillsFromFirestore, syncArmoryFromFirestore, syncSessions, fetchAllUsers, syncStatus, currentUser]);
    

    const value = {
        view,
        setView,
        settings,
        updateSettings,
        syncStatus,
        triggerFullSync,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};