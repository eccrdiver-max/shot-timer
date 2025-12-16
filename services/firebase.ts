import { db } from '../config/firebaseConfig';
import {
    collection,
    getDocs,
    doc,
    setDoc,
    query,
    where,
    getDoc,
    updateDoc,
    increment,
    serverTimestamp,
    runTransaction,
    writeBatch,
    deleteDoc,
} from 'firebase/firestore';
import { Drill, UserProfile, UserRole, CommunityDrill, Club, Shooter, Weapon, MaintenanceLog } from '../types';

// Helper to recursively convert Firestore Timestamps and JS Dates to numbers
const convertTimestamps = (data: any): any => {
    if (data && typeof data.toMillis === 'function') { // Is a Firestore Timestamp
        return data.toMillis();
    }
    if (data instanceof Date) { // Is a JS Date
        return data.getTime();
    }
    if (Array.isArray(data)) {
        return data.map(convertTimestamps);
    }
    // Only recurse on plain objects, not other object types like GeoPoint or class instances.
    if (data !== null && typeof data === 'object' && data.constructor === Object) {
        const res: { [key: string]: any } = {};
        for (const key in data) {
            res[key] = convertTimestamps(data[key]);
        }
        return res;
    }
    return data;
};

// Helper to recursively remove undefined values, as Firestore does not support them.
const cleanData = (data: any): any => {
    if (Array.isArray(data)) {
        return data.map(item => cleanData(item));
    } else if (data !== null && typeof data === 'object') {
        // Preserve Firestore Timestamps and Dates
        if (typeof data.toMillis === 'function' || data instanceof Date) return data;

        return Object.fromEntries(
            Object.entries(data)
                .filter(([_, v]) => v !== undefined)
                .map(([k, v]) => [k, cleanData(v)])
        );
    }
    return data;
};


class FirebaseService {
    // User Management
    async getUserProfile(uid: string): Promise<UserProfile | null> {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return convertTimestamps(userSnap.data()) as UserProfile;
        }
        return null;
    }

    async createUserProfile(uid: string, email: string, firstName: string, lastName: string) {
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, {
            uid,
            email,
            firstName,
            lastName,
            role: UserRole.USER, // Default role
            status: 'active',
        });
    }
    
    async updateUserProfile(uid: string, data: Partial<UserProfile>) {
        const userRef = doc(db, 'users', uid);
        // We clean data here too, just in case partial updates carry undefined
        await updateDoc(userRef, cleanData(data));
    }

    async getAllUsers(): Promise<UserProfile[]> {
        const usersCol = collection(db, 'users');
        const userSnapshot = await getDocs(usersCol);
        return userSnapshot.docs.map(doc => convertTimestamps(doc.data()) as UserProfile);
    }
    
    // Community Drills
    async shareDrill(drill: Drill, authorId: string, authorEmail: string | null): Promise<void> {
        const docId = `${drill.name.replace(/\s+/g, '_').toLowerCase()}_${authorId}`;
        const drillRef = doc(db, 'community_drills', docId);

        const drillData: CommunityDrill = {
            ...drill,
            id: docId,
            authorId,
            authorEmail,
            downloads: 0,
            isOfficial: false,
        };
        await setDoc(drillRef, cleanData(drillData), { merge: true });
    }

    async getCommunityDrills(): Promise<CommunityDrill[]> {
        const drillsCol = collection(db, 'community_drills');
        const drillSnapshot = await getDocs(drillsCol);
        return drillSnapshot.docs.map(doc => convertTimestamps(doc.data()) as CommunityDrill);
    }
    
    async incrementDrillDownloads(drillId: string): Promise<void> {
        const drillRef = doc(db, 'community_drills', drillId);
        await updateDoc(drillRef, {
            downloads: increment(1)
        });
    }

    // Official Drills (Top-Level)
    async saveOfficialDrill(drill: Drill) {
        const docRef = doc(db, 'official_drills', drill.id);
        const cleanedDrill = cleanData(drill);
        const data = { ...cleanedDrill, isOfficial: true, updatedAt: serverTimestamp() };
        await setDoc(docRef, data);
    }

    async deleteOfficialDrill(drillId: string) {
        const docRef = doc(db, 'official_drills', drillId);
        await deleteDoc(docRef);
    }

    async getOfficialDrills(): Promise<Drill[]> {
        const collectionRef = collection(db, 'official_drills');
        const querySnapshot = await getDocs(collectionRef);
        return querySnapshot.docs.map(doc => convertTimestamps(doc.data()) as Drill);
    }

    // Global Collections (Clubs, Shooters)
    async saveGlobalClub(club: Club) {
        const docRef = doc(db, 'clubs', club.id);
        const cleanedClub = cleanData(club);
        const data = { ...cleanedClub, updatedAt: serverTimestamp() };
        await setDoc(docRef, data);
    }
    
    async saveGlobalShooter(shooter: Shooter) {
        const docRef = doc(db, 'shooters', shooter.id);
        const cleanedShooter = cleanData(shooter);
        const data = { ...cleanedShooter, updatedAt: serverTimestamp() };
        await setDoc(docRef, data);
    }

    async deleteGlobalClub(clubId: string) {
        const docRef = doc(db, 'clubs', clubId);
        await deleteDoc(docRef);
    }

    async deleteGlobalShooter(shooterId: string) {
        const docRef = doc(db, 'shooters', shooterId);
        await deleteDoc(docRef);
    }

    async getAllGlobalClubs(): Promise<Club[]> {
        const collectionRef = collection(db, 'clubs');
        const querySnapshot = await getDocs(collectionRef);
        return querySnapshot.docs.map(doc => convertTimestamps(doc.data()) as Club);
    }

    async getAllGlobalShooters(): Promise<Shooter[]> {
        const collectionRef = collection(db, 'shooters');
        const querySnapshot = await getDocs(collectionRef);
        return querySnapshot.docs.map(doc => convertTimestamps(doc.data()) as Shooter);
    }

    // Generic User PRIVATE Subcollection Data
    async saveUserSubcollectionData(collectionName: string, data: { id: string; [key: string]: any; }, ownerUid: string) {
        const docRef = doc(db, 'users', ownerUid, collectionName, data.id);
        const cleanedData = cleanData(data);
        const safeData = { ...cleanedData, updatedAt: serverTimestamp() };
        await setDoc(docRef, safeData);
    }

    async deleteUserSubcollectionData(collectionName: string, dataId: string, ownerUid: string) {
        const docRef = doc(db, 'users', ownerUid, collectionName, dataId);
        await deleteDoc(docRef);
    }
    
    async getUserSubcollectionData(collectionName: string, ownerUid: string): Promise<any[]> {
        const collectionRef = collection(db, 'users', ownerUid, collectionName);
        const querySnapshot = await getDocs(collectionRef);
        return querySnapshot.docs.map(doc => convertTimestamps(doc.data()));
    }

    async deleteWeaponAndLogs(weaponId: string, ownerUid: string) {
        const batch = writeBatch(db);
        const weaponRef = doc(db, 'users', ownerUid, 'weapons', weaponId);
        batch.delete(weaponRef);

        const logsCollectionRef = collection(db, 'users', ownerUid, 'maintenanceLogs');
        const q = query(logsCollectionRef, where('weaponId', '==', weaponId));
        const logsSnapshot = await getDocs(q);
        logsSnapshot.forEach(logDoc => {
            batch.delete(logDoc.ref);
        });

        await batch.commit();
    }
}

export const firebaseService = new FirebaseService();