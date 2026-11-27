import { describe, expect, it } from 'vitest';
import questions from '../mocks/questions.json';
import { ANSWER_VALUES, DIMENSIONS, PROFILES, dimensionValues, scoreProfile } from './scoring';
import type { Question } from '../types';

const Q = questions as Question[];
const KEYS = ['A', 'B', 'C', 'D'];

describe('questionnaire', () => {
  it('contient 12 questions, 2 par dimension, 4 réponses A–D', () => {
    expect(Q).toHaveLength(12);
    for (const d of DIMENSIONS) expect(Q.filter((q) => q.dimension === d)).toHaveLength(2);
    for (const q of Q) expect(q.options.map((o) => o.key)).toEqual(KEYS);
  });
});

describe('scoreProfile (12 questions)', () => {
  it('rejette un nombre de réponses ou une réponse invalide', () => {
    expect(() => scoreProfile(Q, ['A'])).toThrow();
    expect(() => scoreProfile(Q, Array(12).fill('Z'))).toThrow();
  });

  it('calcule la moyenne des deux réponses de chaque dimension', () => {
    const answers = ['A', 'B', 'C', 'D', 'A', 'A', 'D', 'D', 'B', 'B', 'C', 'C'];
    const v = dimensionValues(Q, answers) as number[];
    expect(v[0]).toBeCloseTo((1 + 0.33) / 2);
    expect(v[1]).toBeCloseTo((-0.33 - 1) / 2);
    expect(v[2]).toBeCloseTo(1);
    expect(v[3]).toBeCloseTo(-1);
  });

  it('retrouve chaque profil à partir de réponses qui reproduisent exactement son vecteur', () => {
    // pour chaque dimension, on cherche deux réponses dont la moyenne vaut la valeur du vecteur
    for (const p of PROFILES) {
      const answers: string[] = [];
      DIMENSIONS.forEach((_, di) => {
        const target = p.vector[di];
        let found: [string, string] | null = null;
        for (const a of KEYS) for (const b of KEYS) {
          if (!found && Math.abs((ANSWER_VALUES[a] + ANSWER_VALUES[b]) / 2 - target) < 0.01) found = [a, b];
        }
        expect(found, `${p.id} dimension ${di}`).not.toBeNull();
        answers.push(...found!);
      });
      expect(scoreProfile(Q, answers).id).toBe(p.id);
    }
  });

  it("ne dépend pas de l'ordre des deux réponses d'une même dimension", () => {
    const base = ['A', 'D', 'B', 'C', 'A', 'B', 'C', 'D', 'B', 'A', 'D', 'C'];
    const swapped = ['D', 'A', 'C', 'B', 'B', 'A', 'D', 'C', 'A', 'B', 'C', 'D'];
    expect(scoreProfile(Q, swapped).id).toBe(scoreProfile(Q, base).id);
  });

  it('est déterministe et renvoie toujours un profil connu (échantillon de 5 000 combinaisons)', () => {
    let seed = 42;
    const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
    const ids = new Set(PROFILES.map((p) => p.id));
    for (let i = 0; i < 5000; i++) {
      const a = Q.map(() => KEYS[Math.floor(rnd() * 4)]);
      const p = scoreProfile(Q, a);
      expect(ids.has(p.id)).toBe(true);
      expect(scoreProfile(Q, a).id).toBe(p.id);
    }
  });

  it("tout A, tout D : cas limites stables", () => {
    expect(scoreProfile(Q, Array(12).fill('A')).id).toBeTruthy();
    expect(scoreProfile(Q, Array(12).fill('D')).id).toBeTruthy();
  });
});
