// Couche d'accès aux données : les écrans passent uniquement par ici.
// Aujourd'hui elle lit des JSON locaux (src/mocks) ; demain on remplacera par des appels HTTP
// vers le back sans toucher aux écrans.
import questions from '../mocks/questions.json';
import placesData from '../mocks/places.json';
import destinationsData from '../mocks/destinations.json';
import explore from '../mocks/explore.json';
import trip from '../mocks/trip.json';
import community from '../mocks/community.json';
import chatbot from '../mocks/chatbot.json';
import user from '../mocks/user.json';
import type { Activity, Destination, EventItem, Place, Question, Viber } from '../types';
import { PROFILES, scoreProfile } from '../lib/scoring';

const wait = <T,>(v: T, ms = 250) => new Promise<T>((res) => setTimeout(() => res(v), ms));

export const QUESTIONS = questions as Question[];
export const rome = placesData.destination;
export const PLACES = placesData.places as unknown as Place[];
export const DESTINATIONS = destinationsData as Destination[];
export const ACTIVITIES = explore.activities as Activity[];
export const VIBERS = explore.users as Viber[];
export const EVENTS = explore.events as EventItem[];
export const tripTemplate = trip;
export const communityData = community;
export const chatbotScript = chatbot;
export const userSeed = user;

export const placeById = (id: string) => PLACES.find((p) => p.id === id);
export const profileById = (id: string | null) => PROFILES.find((p) => p.id === id);
export const eventById = (id: string) => EVENTS.find((e) => e.id === id);

export const computeProfile = (answers: string[]) => wait(scoreProfile(QUESTIONS, answers), 1200);
export const prepareItinerary = () => wait(true, 2200);
export const askVibi = () => wait(true, 1100);

/** Normalise pour la recherche : minuscules, sans accents. */
export const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
