import { useNavigate } from 'react-router-dom';
import { Button, Empty, Header, PhotoCard, SectionTitle } from '../components/ui';
import { useStore } from '../state/store';
import { dayIndex } from '../lib/itinerary';
import { fmtRange, parseISO } from '../lib/dates';

export default function Trips() {
  const nav = useNavigate();
  const it = useStore((s) => s.user!.current_itinerary);
  return (
    <>
      <Header title="Mes voyages" subtitle={it ? 'Retrouve tes itinéraires et tes carnets.' : undefined} />
      {!it
        ? <Empty title="Aucun voyage enregistré" text="Retrouve ici tes séjours et les itinéraires que tu enregistres."><Button onClick={() => nav('/create')}>Créer un itinéraire</Button></Empty>
        : <div className="px-5 pb-6"><SectionTitle>{dayIndex(it) >= 0 ? 'En cours' : 'À venir'}</SectionTitle>
            <div data-testid="trip-card"><PhotoCard src="rome.jpg" title={it.destination} sub={`${fmtRange(parseISO(it.startDate), parseISO(it.endDate))} · ${it.days.length} jours · ${it.travelers} voyageurs`} onClick={() => nav('/trip')} /></div></div>}
    </>
  );
}
