import { Match, Score, Shooter, IDPADivision } from '../types';

export interface FinalScore {
    shooterId: string;
    shooterName: string;
    division: IDPADivision;
    totalTime: number;
    rankOverall: number;
    rankDivision: number;
    stageScores: { [stageId: string]: number };
}

export const calculateIDPAScore = (score: Score): number => {
    const time = score.time || 0;
    const pointsDown = score.pointsDown || 0;
    const procedurals = score.procedurals || 0;
    const hnt = score.h_n_t || 0;
    return time + (pointsDown * 0.5) + (procedurals * 3) + (hnt * 5);
};

export const calculateMatchResults = (match: Match): FinalScore[] => {
    if (!match || !match.shooters || !match.scores) {
        return [];
    }
    
    const results: Omit<FinalScore, 'rankOverall' | 'rankDivision'>[] = match.shooters.map(shooter => {
        const shooterScores = match.scores.filter(s => s.shooterId === shooter.id);
        
        const stageScores: { [stageId: string]: number } = {};
        let totalTime = 0;

        match.stages.forEach(stage => {
            const stageScore = shooterScores.find(s => s.stageId === stage.id);
            const finalStageTime = stageScore ? calculateIDPAScore(stageScore) : 0;
            stageScores[stage.id] = finalStageTime;
            totalTime += finalStageTime;
        });

        return {
            shooterId: shooter.id,
            shooterName: shooter.name,
            division: shooter.division,
            totalTime,
            stageScores,
        };
    });

    // Sort by total time for overall ranking
    results.sort((a, b) => a.totalTime - b.totalTime);

    // Assign overall rank and prepare for division ranking
    const rankedResults: FinalScore[] = results.map((res, index) => ({
        ...res,
        rankOverall: index + 1,
        rankDivision: 0 // Placeholder
    }));
    
    // Calculate division ranks
    const divisions = [...new Set(rankedResults.map(r => r.division))];
    divisions.forEach(div => {
        const divisionShooters = rankedResults
            .filter(r => r.division === div)
            .sort((a, b) => a.totalTime - b.totalTime);
        
        divisionShooters.forEach((shooter, index) => {
            const shooterInFinalResults = rankedResults.find(r => r.shooterId === shooter.shooterId);
            if (shooterInFinalResults) {
                shooterInFinalResults.rankDivision = index + 1;
            }
        });
    });

    return rankedResults;
};
