export type Tone = 'orange' | 'rose' | 'brun';

export interface Option { key: 'A' | 'B' | 'C' | 'D'; label: string }
export interface Question { id: string; dimension: string; text: string; options: Option[] }
export interface Profile { id: string; name: string; description: string; vector: number[] }

export type ItemType = 'monument' | 'activity' | 'hotel' | 'resto';
export interface Item {
  id: string;
  type: ItemType;
  name: string;
  tagline: string;
  description: string;
  tone: Tone;
  rating?: number;
  reviews?: number;
  price?: string;
  stars?: number;
  duration?: string;
  category?: string;
  details?: [string, string][];
  address?: string;
  tags?: string[];
}
export interface City {
  ville: string;
  description: string;
  stats: { activites: number; hotels: number; note: number };
  activites: Item[];
  hotels: Item[];
  resto: Item[];
}
export interface Country { nom: string; villes: City[]; point_d_interet: Item[] }

export interface Friend { id: string; name: string; status: string }
export interface OfferedActivity {
  id: string; name: string; offered_by: string; subscriptions: number;
  dayOffset: number; time: string; place: string; message: string; ref: string;
}
/** Activité à laquelle l'utilisateur est inscrit (forme du Word : name, offered_by, subscriptions, date). */
export interface UserActivity { id: string; name: string; offered_by: string; subscriptions: number; date: string }

export interface ItineraryItem { id: string; time: string; ref: string; kind: 'poi' | 'activity' | 'resto'; paid?: boolean }
export interface ItineraryDay { label: string; items: ItineraryItem[] }
export interface Itinerary {
  id: string;
  title: string;
  destination: string;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string;
  travelers: number;
  days: ItineraryDay[];
  validated: boolean;
}
export interface Draft {
  destination: string; startDate: string; endDate: string; budget: string; constraints: string;
  transportOut: string; transportBack: string; lodging: string; travelers: number;
  interests: string[]; invited: string[];
}
export interface Parameters { geo: boolean; notif: boolean; sharePosition: boolean; profileVisible: boolean; reminders: boolean; friendMessages: boolean }
