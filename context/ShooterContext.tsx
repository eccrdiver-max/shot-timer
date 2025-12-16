import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Shooter, Club, UserProfile, UserRole } from '../types';
import { db } from '../services/db';
import { firebaseService } from '../services/firebase';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import { useI18n } from '../hooks/useI18n';
import { useModal } from './ModalContext';
import Dexie from 'dexie';

interface ShooterContextType {
    shooters: Shooter[];
    clubs: Club[];
    addShooter: (shooterData: Omit<Shooter, 'id'>) => Promise<void>;
    updateShooter: (shooter: Shooter) => Promise<void>;
    deleteShooter: (id: string) => Promise<void>;
    addClub: (clubData: Omit<Club, 'id'>) => Promise<void>;
    syncDataFromFirestore: (allUsers?: UserProfile[]) => Promise<void>;
}

const ShooterContext = createContext<ShooterContextType | undefined>(undefined);

export const ShooterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const { addNotification } = useNotification();
    const { showConfirmation } = useModal();
    const { t } = useI18n();
    const [shooters, setShooters] = useState<Shooter[]>([]);
    const [clubs, setClubs] = useState<Club[]>([]);

    useEffect(() => {
        const loadDataFromDB = async () => {
            const [s, c] = await Promise.all([db.shooters.toArray(), db.clubs.toArray()]);
            setShooters(s);
            setClubs(c.sort((a, b) => a.name.localeCompare(b.name)));
        };
        loadDataFromDB();
    }, []);
    
    const syncDataFromFirestore = useCallback(async (allUsers: UserProfile[] = []) => {
        if (!currentUser) return;
        try {
            // Fetch directly from global collections, accessible to all users
            const [cloudClubs, cloudShooters] = await Promise.all([
                firebaseService.getAllGlobalClubs(),
                firebaseService.getAllGlobalShooters()
            ]);

            // This advanced feature only runs for MDs who have the full user list
            if (currentUser.role === UserRole.MD && allUsers.length > 0) {
                const userMap = new Map(allUsers.map(u => [u.uid, u]));
                cloudShooters.forEach(shooter => {
                    if (shooter.uid && userMap.has(shooter.uid)) {
                        const user = userMap.get(shooter.uid)!;
                        const expectedName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
                        if (expectedName && (shooter.name !== expectedName || shooter.firstName !== user.firstName || shooter.lastName !== user.lastName)) {
                            const correctedShooter = { 
                                ...shooter, 
                                name: expectedName, 
                                firstName: user.firstName || '', 
                                lastName: user.lastName || ''
                            };
                            // Update Firestore in the background, don't block the sync
                            firebaseService.saveGlobalShooter(correctedShooter);
                            // Update the local copy for immediate UI consistency
                            const index = cloudShooters.findIndex(s => s.id === shooter.id);
                            if(index !== -1) cloudShooters[index] = correctedShooter;
                        }
                    }
                });
            }

            // FIX: The TypeScript compiler was incorrectly reporting that 'transaction' does not exist on this subclass. Casting 'db' to the base Dexie class resolves the type error.
            await (db as Dexie).transaction('rw', db.clubs, db.shooters, async () => {
                await db.clubs.bulkPut(cloudClubs);
                await db.shooters.bulkPut(cloudShooters);
            });

            // After syncing, reload data from the local DB to ensure consistency
            // This prevents race conditions where optimistic UI updates are overwritten by stale cloud data
            const [updatedClubs, updatedShooters] = await Promise.all([
                db.clubs.toArray(),
                db.shooters.toArray()
            ]);
            setClubs(updatedClubs.sort((a, b) => a.name.localeCompare(b.name)));
            setShooters(updatedShooters);
        } catch (error) {
            console.error("Firestore shooter/club sync failed:", error);
            addNotification(t('sync_failed'), 'error');
            throw error;
        }
    }, [currentUser, addNotification, t]);

    const addShooter = useCallback(async (shooterData: Omit<Shooter, 'id'>) => {
        if (!currentUser || (currentUser.role !== UserRole.MD && currentUser.role !== UserRole.SO)) return;
        
        const newShooter: Shooter = { ...shooterData, id: crypto.randomUUID(), updatedAt: Date.now() };
        
        // 1. Critical: Save to Local DB first
        await db.shooters.add(newShooter);
        setShooters(prev => [...prev, newShooter]);

        // 2. Try to sync with Cloud (Best Effort)
        try {
            await firebaseService.saveGlobalShooter(newShooter);
            addNotification(t('shooter_added'), 'success');
        } catch (error) {
            console.error("Cloud save failed:", error);
            // Warn user but do NOT throw error, as local save succeeded
            addNotification(t('saved_local_only'), 'warning');
        }
    }, [currentUser, t, addNotification]);

    const updateShooter = useCallback(async (shooter: Shooter) => {
        if (!currentUser || (currentUser.role !== UserRole.MD && currentUser.role !== UserRole.SO)) return;

        const updatedShooter = { ...shooter, updatedAt: Date.now() };
        
        // 1. Critical: Local Update
        await db.shooters.put(updatedShooter);
        setShooters(prev => prev.map(s => s.id === updatedShooter.id ? updatedShooter : s));

        // 2. Cloud Sync (Best Effort)
        try {
            await firebaseService.saveGlobalShooter(updatedShooter);
            addNotification(t('shooter_updated'), 'success');
        } catch (error) {
            console.error("Cloud update failed:", error);
            addNotification(t('saved_local_only'), 'warning');
        }

        // Handle duplicates *after* the update (Logic kept same)
        const originalShooter = shooters.find(s => s.id === shooter.id);
        const isLinkingAccount = shooter.uid && shooter.uid !== originalShooter?.uid;

        if (isLinkingAccount) {
            const duplicates = shooters.filter(s =>
                s.name.toLowerCase() === shooter.name.toLowerCase() &&
                s.id !== shooter.id && !s.uid
            );

            if (duplicates.length > 0) {
                showConfirmation(
                    t('confirm_merge_duplicates_title'),
                    t('confirm_merge_duplicates_body', { count: duplicates.length, shooterName: shooter.name }),
                    async () => {
                        const duplicateIds = duplicates.map(d => d.id);
                        try {
                            await db.shooters.bulkDelete(duplicateIds);
                            await Promise.all(duplicateIds.map(id => firebaseService.deleteGlobalShooter(id)));
                            setShooters(prev => prev.filter(s => !duplicateIds.includes(s.id)));
                            addNotification(t('shooter_profile_merged', { count: duplicates.length }), 'success');
                        } catch (error) {
                            console.error("Failed to delete duplicates", error);
                        }
                    }
                );
            }
        }
    }, [currentUser, shooters, showConfirmation, t, addNotification]);

    const deleteShooter = useCallback(async (id: string) => {
        if (!currentUser || (currentUser.role !== UserRole.MD && currentUser.role !== UserRole.SO)) return;
        
        // 1. Critical: Local Delete
        await db.shooters.delete(id);
        setShooters(prev => prev.filter(s => s.id !== id));
        
        // 2. Cloud Sync (Best Effort)
        try {
            await firebaseService.deleteGlobalShooter(id);
            addNotification(t('shooter_deleted'), 'success');
        } catch (error) {
             console.error("Cloud delete failed:", error);
             addNotification(t('saved_local_only'), 'warning');
        }
    }, [currentUser, t, addNotification]);

    const addClub = useCallback(async (clubData: Omit<Club, 'id'>) => {
        if (!currentUser || currentUser.role !== UserRole.MD) {
            addNotification(t('unauthorized_action'), 'error');
            return;
        }
        const newClub: Club = { ...clubData, id: crypto.randomUUID(), updatedAt: Date.now() };
        try {
            await db.clubs.add(newClub);
            setClubs(prev => [...prev, newClub].sort((a, b) => a.name.localeCompare(b.name)));
            await firebaseService.saveGlobalClub(newClub);
            addNotification(t('club_added'), 'success');
        } catch (error) {
            console.error("Failed to add club:", error);
            addNotification(t('error_adding_club'), 'error');
            // Revert optimistic update
            await db.clubs.delete(newClub.id).catch(e => console.error("Revert failed", e));
            setClubs(prev => prev.filter(c => c.id !== newClub.id));
        }
    }, [currentUser, addNotification, t]);

    const value = {
        shooters,
        clubs,
        addShooter,
        updateShooter,
        deleteShooter,
        addClub,
        syncDataFromFirestore,
    };

    return <ShooterContext.Provider value={value}>{children}</ShooterContext.Provider>;
};

export const useShooterContext = () => {
    const context = useContext(ShooterContext);
    if (!context) {
        throw new Error('useShooterContext must be used within a ShooterProvider');
    }
    return context;
};