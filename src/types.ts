export interface Option { key: 'A' | 'B' | 'C' | 'D'; label: string }
export interface Question { id: string; dimension: string; text: string; options: Option[] }
export interface Profile { id: string; name: string; description: string; vector: number[]; image: string; destinations: string[] }

export interface Review { who: string; role: string; stars: number; text: string }
export interface Place {
  id: string; kind: 'monument' | 'hotel' | 'resto'; cat: string; typeLabel: string; name: string; address: string;
  rating: number; reviews: number; image: string | null; hero: string | null; photos: string[];
  recommended?: boolean; accessible: boolean; price: number; free?: boolean; stars?: number; priceLabel?: string; partner?: string;
  infos: string[]; google?: { rating: string; count: string; quote: string }; reviewsList: Review[]; eventIds: string[];
}
export interface Destination {
  id: string; name: string; country: string; rating: string; image: string | null; theme?: string; available: boolean; blurb?: string;
}
export interface Activity { id: string; name: string; meta: string; interested: number | null; sub?: string; image: string; category: string; city: string }
export interface Viber { id: string; name: string; sub: string; initials: string }
export interface EventItem {
  id: string; title: string; dayOffset: number; city: string; hour: string;
  category?: string; image?: string; credit?: string; organizer?: string; seats?: number; about?: string;
  meeting?: string; meetingAddress?: string; meetingNote?: string; practical?: string;
}

export interface Stop { id: string; time: string; title: string; sub: string; tag?: string }
export type LegMode = 'walk' | 'bus' | 'taxi';
export interface Itinerary {
  id: string; title: string; destination: string; startDate: string; endDate: string; travelers: number;
  budget: string; transportOut: string; transportBack: string; lodging: string;
  days: Stop[][]; saved: boolean; source: 'vibi' | 'manual';
  /** mode de déplacement choisi par trajet (clé « départ|arrivée »), « À pied » par défaut */
  legModes: Record<string, LegMode>;
  interests?: string[];
}
export interface Draft {
  destination: string; startDate: string; endDate: string; budget: string;
  transportOut: string; transportBack: string; lodging: string; days: Stop[][];
}

/** Paramètres : `geo` et `notif` sont ceux du modèle de test ; les autres reprennent les réglages du design. */
export interface Parameters {
  geo: boolean; visibility: boolean; dataSharing: boolean;
  notif: boolean; itineraryChanges: boolean; friendActivity: boolean;
}
/** Activité à laquelle l'utilisateur est inscrit (forme du Word : name, offered_by, subscriptions, date). */
export interface Souvenir { id: string; date: string; title: string; text: string; feeling: string; photos: string[] }
export interface Reminder { id: string; title: string; date: string; time: string }
export interface Collab { friendId: string; name: string; access: 'edit' | 'view'; status: 'pending' | 'accepted' }
export interface UserActivity { id: string; name: string; offered_by: string; subscriptions: number; date: string }
