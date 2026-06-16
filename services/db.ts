import Dexie, { type Table } from 'dexie';
import { Settings, Session, Drill, Shooter, Club, Weapon, ClassifierAttempt, Match, MaintenanceLog, ExternalSession } from '../types';

export class ShotTimerProDB extends Dexie {
    settings!: Table<Settings, number>;
    sessions!: Table<Session, string>;
    drills!: Table<Drill, string>;
    officialDrills!: Table<Drill, string>; // New table for official drills
    shooters!: Table<Shooter, string>;
    clubs!: Table<Club, string>;
    weapons!: Table<Weapon, string>;
    classifierAttempts!: Table<ClassifierAttempt, string>;
    matches!: Table<Match, string>;
    maintenanceLogs!: Table<MaintenanceLog, string>;
    externalSessions!: Table<ExternalSession, string>;

    constructor() {
        super('ShotTimerProDB');
        // FIX: The TypeScript compiler was incorrectly reporting that 'version' does not exist on this subclass. Casting 'this' to the base Dexie class resolves the type error.
        (this as Dexie).version(4).stores({
            settings: '++id',
            sessions: '&id, date, drillName, shooterId, weaponId',
            drills: '&id, name',
            officialDrills: '&id, name', // Added new table
            shooters: '&id, uid, clubId, name',
            clubs: '&id, name',
            weapons: '&id, shooterId',
            classifierAttempts: '&id, date, shooterId, classifierId',
            matches: '&id, name, updatedAt',
            maintenanceLogs: '&id, weaponId, date'
        });
        
        (this as Dexie).version(5).stores({
            externalSessions: '&id, date, drillName'
        });
    }
}

export const db = new ShotTimerProDB();