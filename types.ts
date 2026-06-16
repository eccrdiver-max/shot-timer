export enum AppView {
    DASHBOARD = 'dashboard',
    TIMER = 'timer',
    TRAINING = 'training',
    CLASSIFIER = 'classifier',
    MATCHES = 'matches',
    SHOOTERS = 'shooters',
    ARMORY = 'armory',
    SETTINGS = 'settings',
    HEAD_TO_HEAD = 'head_to_head',
    SHOOTER_HISTORY = 'shooter_history',
    EXTERNAL_DIARY = 'external_diary'
}

export interface Settings {
    id?: number;
    micSensitivity: number;
    randomStartMin: number;
    randomStartMax: number;
    autoStopDelay: number;
    language: 'it' | 'en';
}

export interface Shot {
    time: number;
}

export interface Session {
    id: string;
    date: number;
    drillName: string;
    shots: Shot[];
    totalTime: number;
    firstShotTime: number;
    splits: number[];
    shooterId?: string;
    shooterName?: string;
    weaponId?: string;
    pointsDown?: number;
    procedurals?: number;
    hnt?: number;
    updatedAt?: number;
}

export interface ExternalSession {
    id: string;
    date: number;
    drillName: string;
    totalTime: number;
    penalties: number;
    notes?: string;
    updatedAt?: number;
}

export interface Drill {
    id: string;
    name: string;
    description: string;
    isOfficial?: boolean;
    updatedAt?: number;
}

export interface CommunityDrill extends Drill {
    authorId: string;
    authorEmail: string | null;
    downloads: number;
}


export enum UserRole {
    USER = 'USER',
    SO = 'SO',
    MD = 'MD',
}

export interface UserProfile {
    uid: string;
    email: string | null;
    role: UserRole;
    status?: 'active' | 'disabled';
    firstName?: string;
    lastName?: string;
}

export enum IDPADivision {
    SSP = "SSP", // Stock Service Pistol
    ESP = "ESP", // Enhanced Service Pistol
    CDP = "CDP", // Custom Defensive Pistol
    CCP = "CCP", // Compact Carry Pistol
    REV = "REV", // Revolver
    BUG = "BUG", // Back-Up Gun
    PCC = "PCC", // Pistol Caliber Carbine
}

export enum IDPAClassification {
    MASTER = "MASTER",
    EXPERT = "EXPERT",
    SHARPSHOOTER = "SHARPSHOOTER",
    MARKSMAN = "MARKSMAN",
    NOVICE = "NOVICE",
}

export interface Club {
    id: string;
    name: string;
    updatedAt?: number;
}

export interface Shooter {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    clubId: string;
    division: IDPADivision;
    classification: IDPAClassification;
    uid?: string | null; // Link to user account
    updatedAt?: number;
}

export interface Weapon {
    id: string;
    manufacturer: string;
    model: string;
    caliber: string;
    roundCount: number;
    shooterId?: string;
    shooterName?: string;
    updatedAt?: number;
}

export interface MaintenanceLog {
    id: string;
    weaponId: string;
    date: number;
    roundCountAtMaintenance: number;
    notes: string;
    updatedAt?: number;
}


export interface Stage {
    id: string;
    name: string;
}

export interface Squad {
    id: string;
    name: string;
    shooterIds: string[];
    soId?: string;
    soName?: string;
}

export interface Score {
    time: number;
    pointsDown: number;
    procedurals: number;
    h_n_t: number;
    shooterId: string;
    stageId: string;
    updatedAt: number;
}

export interface Match {
    id: string;
    name: string;
    scoreSystem: 'IDPA' | 'Other';
    shooters: Shooter[];
    stages: Stage[];
    squads: Squad[];
    scores: Score[];
    updatedAt?: number;
}

export interface ClassifierStageScore {
    time: number;
    pointsDown: number;
    procedurals: number;
    hnt: number;
}

export interface ClassifierAttempt {
    id: string;
    date: number;
    shooterId: string;
    shooterName: string;
    classifierId: string;
    stageScores: Record<string, ClassifierStageScore>;
    totalTime: number;
    classification: IDPAClassification;
    finalPercent: number; // For future use
    updatedAt?: number;
}


export type P2PMessageType = 'FULL_MATCH_SYNC' | 'SCORE_UPDATE' | 'HEARTBEAT' | 'HEARTBEAT_ACK';

export type P2PMessagePayload = Match | Score | {};

export interface P2PMessage {
    type: P2PMessageType;
    payload: P2PMessagePayload;
    messageId: string;
}