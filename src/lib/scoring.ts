import type { Profile, Question } from '../types';
import profilesData from '../mocks/profiles.json';

export const DIMENSIONS: string[] = profilesData.dimensions;
export const PROFILES: Profile[] = profilesData.profiles as Profile[];
export const ANSWER_VALUES = profilesData.answerValues as Record<string, number>;

/**
 * Règle de scoring (déduite des vecteurs du back, à confirmer avec l'équipe back) :
 *  - réponse A = +1, B = +0.33, C = -0.33, D = -1
 *  - 12 questions = 2 par dimension : la valeur d'une dimension est la moyenne de ses réponses
 *    (c'est ce qui explique les valeurs ±0.66 des vecteurs de profils)
 *  - profil retenu = vecteur le plus proche (distance euclidienne au carré) sur les dimensions posées
 *  - égalité : le premier profil dans l'ordre de profiles.json l'emporte (déterministe)
 */
export function dimensionValues(questions: Question[], answers: string[]): (number | null)[] {
  if (answers.length !== questions.length) throw new Error('Nombre de réponses invalide');
  const sums = DIMENSIONS.map(() => ({ s: 0, n: 0 }));
  questions.forEach((q, i) => {
    const v = ANSWER_VALUES[answers[i]];
    if (v === undefined) throw new Error(`Réponse inconnue : ${answers[i]}`);
    const d = DIMENSIONS.indexOf(q.dimension);
    if (d < 0) throw new Error(`Dimension inconnue : ${q.dimension}`);
    sums[d].s += v;
    sums[d].n += 1;
  });
  return sums.map(({ s, n }) => (n ? s / n : null));
}

export function scoreProfile(questions: Question[], answers: string[], profiles: Profile[] = PROFILES): Profile {
  const values = dimensionValues(questions, answers);
  let best = profiles[0];
  let bestD = Infinity;
  for (const p of profiles) {
    const d = values.reduce<number>((acc, v, k) => (v === null ? acc : acc + (p.vector[k] - v) ** 2), 0);
    if (d < bestD - 1e-9) { best = p; bestD = d; }
  }
  return best;
}
