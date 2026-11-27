import { useNavigate } from 'react-router-dom';
import { Button, Empty, Header, PhotoCard, SectionTitle } from '../components/ui';
import { useStore } from '../state/store';
import { dayIndex, tripSub } from '../lib/itinerary';
import { addDays, fmtRange, iso, parseISO } from '../lib/dates';
import { tripTemplate } from '../api/mockApi';

export interface UpcomingTrip { id: string; title: string; image: string; start: string; end: string; detail: boolean }
/** Voyages « À venir » du design (Tokyo, Kyoto, Bali) : données d’exemple, affichées une fois un premier voyage enregistré. */
export function upcomingTrips(startDate: string): UpcomingTrip[] {
  return tripTemplate.upcoming.map((u) => {
    const s = addDays(parseISO(startDate), u.offset);
    return { id: u.id, title: u.title, image: u.image, start: iso(s), end: iso(addDays(s, u.nights)), detail: u.detail };
  });
}

export default function Trips() {
  const nav = useNavigate();
  const it = useStore((s) => s.user!.current_itinerary);
  if (!it) {
    return (
      <>
        <Header title="Mes voyages" back={false} />
        <Empty title="Aucun voyage enregistré" text="Retrouve ici tes séjours et les itinéraires que tu enregistres."><Button onClick={() => nav('/create')}>Créer un itinéraire</Button></Empty>
      </>
    );
  }
  const ongoing = dayIndex(it) >= 0;
  const main = <div data-testid="trip-card"><PhotoCard src="rome.jpg" title={it.destination} sub={tripSub(it)} height="h-[130px]" onClick={() => nav('/trip')} /></div>;
  const upcoming = upcomingTrips(it.startDate);
  return (
    <>
      <Header title="Mes voyages" back={false} />
      <div className="flex flex-col gap-6 px-5 pb-6">
        {ongoing && <section><SectionTitle>En cours</SectionTitle>{main}</section>}
        <section data-testid="upcoming">
          <SectionTitle>À venir</SectionTitle>
          <div className="flex flex-col gap-3">
            {!ongoing && main}
            {upcoming.map((u) => (
              <div key={u.id} data-testid="upcoming-card">
                <PhotoCard src={u.image} title={u.title} sub={fmtRange(parseISO(u.start), parseISO(u.end))} height="h-[84px]" onClick={() => nav(u.detail ? `/upcoming/${u.id}` : `/soon?page=trip`)} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
