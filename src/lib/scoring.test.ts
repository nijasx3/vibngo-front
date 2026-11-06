import { describe, expect, it } from 'vitest';
import questions from '../mocks/questions.json';
import type { Question } from '../types';
import { ANSWER_VALUES, DIMENSIONS, PROFILES, scoreProfile } from './scoring';
import expected from '../test/expected-256.json';

const Q = questions as Question[];
const KEYS = ['A', 'B', 'C', 'D'];

describe('scoreProfile', () => {
  it('pose bien 4 questions, une par dimension distincte', () => {
    expect(Q).toHaveLength(4);
    expect(new Set(Q.map((q) => q.dimension)).size).toBe(4);
    Q.forEach((q) => expect(DIMENSIONS).toContain(q.dimension));
  });

  it('retrouve chacun des 8 profils à partir de ses réponses "idéales"', () => {
    const snap = (x: number) => KEYS.reduce((b, k) => (Math.abs(ANSWER_VALUES[k] - x) < Math.abs(ANSWER_VALUES[b] - x) ? k : b), 'A');
    for (const p of PROFILES) {
      const answers = Q.map((q) => snap(p.vector[DIMENSIONS.indexOf(q.dimension)]));
      expect(scoreProfile(Q, answers).id).toBe(p.id);
    }
  });

  it('donne le même résultat que la table de référence (Python) pour les 256 combinaisons', () => {
    const table = expected as Record<string, string>;
    let n = 0;
    for (const a of KEYS) for (const b of KEYS) for (const c of KEYS) for (const d of KEYS) {
      expect(scoreProfile(Q, [a, b, c, d]).id).toBe(table[a + b + c + d]);
      n++;
    }
    expect(n).toBe(256);
  });

  it('rejette un nombre de réponses incorrect', () => {
    expect(() => scoreProfile(Q, ['A'])).toThrow();
  });
});
