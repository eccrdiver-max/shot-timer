import { IDPAClassification, ClassifierStageScore } from '../types';

export interface ClassifierStage {
    id: string;
    nameKey: string; // For i18n
    maxTime: number;
    maxPointsDown: number;
}

export interface ClassifierInfo {
    id: string;
    nameKey: string; // For i18n
    stages: ClassifierStage[];
}

// Data for the IDPA 5x5 Classifier
export const idpa5x5Classifier: ClassifierInfo = {
    id: 'idpa_5x5',
    nameKey: 'classifier_5x5_name',
    stages: [
        { id: 's1', nameKey: 'classifier_5x5_stage1_name', maxTime: 20, maxPointsDown: 25 },
        { id: 's2', nameKey: 'classifier_5x5_stage2_name', maxTime: 20, maxPointsDown: 25 },
        { id: 's3', nameKey: 'classifier_5x5_stage3_name', maxTime: 20, maxPointsDown: 25 },
        { id: 's4', nameKey: 'classifier_5x5_stage4_name', maxTime: 20, maxPointsDown: 25 },
    ],
};

// Data for the official IDPA Classifier (example data, might not be accurate)
export const idpaOfficialClassifier: ClassifierInfo = {
    id: 'idpa_official_2017',
    nameKey: 'classifier_official_name',
    stages: [
        { id: 's1', nameKey: 'classifier_official_stage1_name', maxTime: 18, maxPointsDown: 12 },
        { id: 's2', nameKey: 'classifier_official_stage2_name', maxTime: 25, maxPointsDown: 24 },
        { id: 's3', nameKey: 'classifier_official_stage3_name', maxTime: 40, maxPointsDown: 30 },
    ],
};

export const availableClassifiers: ClassifierInfo[] = [
    idpa5x5Classifier,
    idpaOfficialClassifier,
];

// Calculation logic
export const calculateClassifierScore = (stageScores: Record<string, ClassifierStageScore>): number => {
    let totalTime = 0;
    for (const stageId in stageScores) {
        const score = stageScores[stageId];
        totalTime += (score.time || 0) + (score.pointsDown || 0) * 0.5 + (score.procedurals || 0) * 3 + (score.hnt || 0) * 5;
    }
    return totalTime;
};

// Classification times for a given classifier. This is where the standard times are defined.
// The key is the classifier ID.
const classificationTimeStandards: Record<string, Record<IDPAClassification, number>> = {
    'idpa_5x5': {
        [IDPAClassification.MASTER]: 25.00,
        [IDPAClassification.EXPERT]: 31.25,
        [IDPAClassification.SHARPSHOOTER]: 40.63,
        [IDPAClassification.MARKSMAN]: 56.25,
        [IDPAClassification.NOVICE]: 999, // Anything over marksman
    },
    'idpa_official_2017': {
        [IDPAClassification.MASTER]: 74.00,
        [IDPAClassification.EXPERT]: 93.00,
        [IDPAClassification.SHARPSHOOTER]: 120.00,
        [IDPAClassification.MARKSMAN]: 160.00,
        [IDPAClassification.NOVICE]: 999,
    },
};

export const determineClassification = (classifierId: string, totalTime: number): IDPAClassification => {
    const standards = classificationTimeStandards[classifierId];
    if (!standards) return IDPAClassification.NOVICE;

    if (totalTime <= standards.MASTER) return IDPAClassification.MASTER;
    if (totalTime <= standards.EXPERT) return IDPAClassification.EXPERT;
    if (totalTime <= standards.SHARPSHOOTER) return IDPAClassification.SHARPSHOOTER;
    if (totalTime <= standards.MARKSMAN) return IDPAClassification.MARKSMAN;
    
    return IDPAClassification.NOVICE;
};
