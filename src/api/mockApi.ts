// Couche d'accès aux données : les écrans passent uniquement par ici.
// Aujourd'hui elle lit des JSON locaux (src/mocks) ; demain on remplacera par des appels HTTP
// vers le back sans toucher aux écrans.
import questions from '../mocks/questions.json';
import rome from '../mocks/rome.json';
import community from '../mocks/community.json';
import itineraryTpl from '../mocks/itinerary.json';
import chatbot from '../mocks/chatbot.json';
import type { Country, Item, Question } from '../types';
import { scoreProfile } from '../lib/scoring';

const wait = <T,>(v: T, ms = 250) => new Promise<T>((res) => setTimeout(() => res(v), ms));

const country = rome.pays as unknown as Country;
const city = country.villes[0];

export const catalog = {
  country,
  city,
  all: (): Item[] => [...country.point_d_interet, ...city.activites, ...city.hotels, ...city.resto],
  byId: (id: string): Item | undefined => catalog.all().find((i) => i.id === id),
};

export const community_ = community;
export const itineraryTemplate = itineraryTpl;
export const chatbotScript = chatbot;
export const getQuestions = () => wait(questions as Question[], 0);
export const computeProfile = (answers: string[]) => wait(scoreProfile(questions as Question[], answers), 900);
export const generateItinerary = () => wait(itineraryTpl, 2400);
export const search = (q: string) => wait(q, 200);
