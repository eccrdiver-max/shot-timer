import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Weapon, MaintenanceLog } from '../types';
import { db } from '../services/db';
import Dexie from 'dexie';
import { firebaseService } from '../services/firebase';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import { useI18n } from '../hooks/useI18n';

interface ArmoryContextType {
    weapons: Weapon[];
    maintenanceLogs: MaintenanceLog[];
    addWeapon: (weaponData: Omit<Weapon, 'id'>) => Promise<void>;
    updateWeapon: (weapon: Weapon) => Promise<void>;
    deleteWeapon: (id: string) => Promise<void>;
    addMaintenanceLog: (logData: Omit<MaintenanceLog, 'id'>) => Promise<void>;
    deleteMaintenanceLog: (id: string) => Promise<void>;
    updateWeaponRoundCount: (weaponId: string, roundsFired: number) => Promise<void>;
    syncArmoryFromFirestore: () => Promise<void>;
}

const ArmoryContext = createContext<ArmoryContextType | undefined>(undefined);

export const ArmoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const { addNotification } = useNotification();
    const { t } = useI18n();

    const [weapons, setWeapons] = useState<Weapon[]>([]);
    const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const [w, ml] = await Promise.all([
                db.weapons.toArray(), 
                db.maintenanceLogs.toArray()
            ]);
            setWeapons(w);
            setMaintenanceLogs(ml);
        };
        loadData();
    }, []);

    const syncArmoryFromFirestore = useCallback(async () => {
        if (!currentUser) return;
        try {
            const [cloudWeapons, cloudLogs] = await Promise.all([
                firebaseService.getUserSubcollectionData('weapons', currentUser.uid) as Promise<Weapon[]>,
                firebaseService.getUserSubcollectionData('maintenanceLogs', currentUser.uid) as Promise<MaintenanceLog[]>
            ]);

            await (db as Dexie).transaction('rw', db.weapons, db.maintenanceLogs, async () => {
                await db.weapons.bulkPut(cloudWeapons);
                await db.maintenanceLogs.bulkPut(cloudLogs);
            });

            // After syncing, reload data from the local DB to ensure consistency
            const [updatedWeapons, updatedLogs] = await Promise.all([
                db.weapons.toArray(),
                db.maintenanceLogs.toArray()
            ]);
            setWeapons(updatedWeapons);
            setMaintenanceLogs(updatedLogs);
        } catch (error) {
            console.error("Firestore armory sync failed:", error);
            throw error; // Rethrow to be caught by AppContext
        }
    }, [currentUser]);

    const addWeapon = useCallback(async (weaponData: Omit<Weapon, 'id'>) => {
        if (!currentUser) return;
        const newWeapon: Weapon = { ...weaponData, id: crypto.randomUUID() };
        // Ensure roundCount is a number, as it comes from a form input.
        if (typeof newWeapon.roundCount !== 'number' || isNaN(newWeapon.roundCount)) {
            newWeapon.roundCount = 0;
        }
        await db.weapons.add(newWeapon);
        setWeapons(prev => [...prev, newWeapon]);
        await firebaseService.saveUserSubcollectionData('weapons', newWeapon, currentUser.uid);
    }, [currentUser]);

    const updateWeapon = useCallback(async (weapon: Weapon) => {
        if (!currentUser) return;
        await db.weapons.put(weapon);
        setWeapons(prev => prev.map(w => w.id === weapon.id ? weapon : w));
        await firebaseService.saveUserSubcollectionData('weapons', weapon, currentUser.uid);
    }, [currentUser]);
    
    const updateWeaponRoundCount = useCallback(async (weaponId: string, roundsFired: number) => {
        if (!currentUser) return;
        const weapon = await db.weapons.get(weaponId);
        if (weapon) {
            const updatedWeapon = { ...weapon, roundCount: weapon.roundCount + roundsFired };
            await db.weapons.put(updatedWeapon);
            setWeapons(prev => prev.map(w => w.id === weaponId ? updatedWeapon : w));
            await firebaseService.saveUserSubcollectionData('weapons', updatedWeapon, currentUser.uid);
        }
    }, [currentUser]);

    const deleteWeapon = useCallback(async (id: string) => {
        if (!currentUser) return;
        await (db as Dexie).transaction('rw', db.weapons, db.maintenanceLogs, async () => {
            await db.weapons.delete(id);
            const logsToDelete = await db.maintenanceLogs.where('weaponId').equals(id).primaryKeys();
            await db.maintenanceLogs.bulkDelete(logsToDelete);
        });
        setWeapons(prev => prev.filter(w => w.id !== id));
        setMaintenanceLogs(prev => prev.filter(log => log.weaponId !== id));
        await firebaseService.deleteWeaponAndLogs(id, currentUser.uid);
    }, [currentUser]);
    
    const addMaintenanceLog = useCallback(async (logData: Omit<MaintenanceLog, 'id'>) => {
        if (!currentUser) return;
        const newLog: MaintenanceLog = { ...logData, id: crypto.randomUUID() };
        await db.maintenanceLogs.add(newLog);
        setMaintenanceLogs(prev => [...prev, newLog]);
        await firebaseService.saveUserSubcollectionData('maintenanceLogs', newLog, currentUser.uid);
    }, [currentUser]);
    
    const deleteMaintenanceLog = useCallback(async (id: string) => {
        if (!currentUser) return;
        await db.maintenanceLogs.delete(id);
        setMaintenanceLogs(prev => prev.filter(log => log.id !== id));
        await firebaseService.deleteUserSubcollectionData('maintenanceLogs', id, currentUser.uid);
    }, [currentUser]);

    const value = {
        weapons,
        maintenanceLogs,
        addWeapon,
        updateWeapon,
        deleteWeapon,
        addMaintenanceLog,
        deleteMaintenanceLog,
        updateWeaponRoundCount,
        syncArmoryFromFirestore
    };

    return <ArmoryContext.Provider value={value}>{children}</ArmoryContext.Provider>;
};

export const useArmory = () => {
    const context = useContext(ArmoryContext);
    if (!context) {
        throw new Error('useArmory must be used within an ArmoryProvider');
    }
    return context;
};
