import type { Profile, Question } from '../types';
import profilesData from '../mocks/profiles.json';

export const DIMENSIONS: string[] = profilesData.dimensions;
export const PROFILES: Profile[] = profilesData.profiles;
export const ANSWER_VALUES = profilesData.answerValues as Record<string, number>;

/**
 * Règle de scoring (déduite des vecteurs du back, à confirmer avec l'équipe back) :
 *  - réponse A = +1, B = +0.33, C = -0.33, D = -1
 *  - on compare les valeurs aux seules dimensions réellement posées (ici 4 sur 6)
 *  - profil retenu = vecteur le plus proche (distance euclidienne au carré)
 *  - égalité : le premier profil dans l'ordre de profiles.json l'emporte (déterministe)
 */
export function scoreProfile(questions: Question[], answers: string[], profiles: Profile[] = PROFILES): Profile {
  if (answers.length !== questions.length) throw new Error('Nombre de réponses invalide');
  const dimIdx = questions.map((q) => DIMENSIONS.indexOf(q.dimension));
  const values = answers.map((a) => {
    const v = ANSWER_VALUES[a];
    if (v === undefined) throw new Error(`Réponse inconnue : ${a}`);
    return v;
  });
  let best = profiles[0];
  let bestD = Infinity;
  for (const p of profiles) {
    const d = values.reduce((acc, v, k) => acc + (p.vector[dimIdx[k]] - v) ** 2, 0);
    if (d < bestD - 1e-9) { best = p; bestD = d; }
  }
  return best;
}
