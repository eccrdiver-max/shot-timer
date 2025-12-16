import { describe, it, expect } from 'vitest';
import { calculateIDPAScore } from './scoring';
import { Score } from '../types';

describe('Scoring Utilities', () => {

  describe('calculateIDPAScore', () => {

    it('should calculate the final score correctly with zero penalties', () => {
      const score: Score = {
        time: 15.50,
        pointsDown: 0,
        procedurals: 0,
        h_n_t: 0,
        shooterId: 'shooter1',
        stageId: 'stage1',
        updatedAt: Date.now(),
      };
      expect(calculateIDPAScore(score)).toBe(15.50);
    });

    it('should correctly add penalties for points down', () => {
      const score: Score = {
        time: 20.00,
        pointsDown: 5, // 5 * 0.5 = 2.5s
        procedurals: 0,
        h_n_t: 0,
        shooterId: 'shooter1',
        stageId: 'stage1',
        updatedAt: Date.now(),
      };
      expect(calculateIDPAScore(score)).toBe(22.50);
    });

    it('should correctly add penalties for procedurals', () => {
      const score: Score = {
        time: 18.25,
        pointsDown: 0,
        procedurals: 2, // 2 * 3 = 6s
        h_n_t: 0,
        shooterId: 'shooter1',
        stageId: 'stage1',
        updatedAt: Date.now(),
      };
      expect(calculateIDPAScore(score)).toBe(24.25);
    });

    it('should correctly add penalties for hits on non-threat', () => {
      const score: Score = {
        time: 25.00,
        pointsDown: 0,
        procedurals: 0,
        h_n_t: 1, // 1 * 5 = 5s
        shooterId: 'shooter1',
        stageId: 'stage1',
        updatedAt: Date.now(),
      };
      expect(calculateIDPAScore(score)).toBe(30.00);
    });

    it('should calculate the final score correctly with all types of penalties', () => {
      const score: Score = {
        time: 30.10,
        pointsDown: 3,     // 3 * 0.5 = 1.5s
        procedurals: 1,    // 1 * 3   = 3.0s
        h_n_t: 1,          // 1 * 5   = 5.0s
        shooterId: 'shooter1',
        stageId: 'stage1',
        updatedAt: Date.now(),
      };
      // 30.10 + 1.5 + 3.0 + 5.0 = 39.60
      expect(calculateIDPAScore(score)).toBeCloseTo(39.60);
    });

    it('should handle undefined or missing penalty values as zero', () => {
      const score = {
        time: 10.00,
        shooterId: 'shooter1',
        stageId: 'stage1',
        updatedAt: Date.now(),
      } as Score;
      expect(calculateIDPAScore(score)).toBe(10.00);
    });

  });

});
