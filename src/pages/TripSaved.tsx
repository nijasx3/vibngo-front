import { useNavigate } from 'react-router-dom';
import { Button, Header, PhotoCard } from '../components/ui';
import { useStore } from '../state/store';
import { fmtRange, parseISO } from '../lib/dates';

export default function TripSaved() {
  const nav = useNavigate();
  const it = useStore((s) => s.user!.current_itinerary);
  return (
    <>
      <Header title="Mes voyages" subtitle="Retrouve tes itinéraires et tes carnets." onBack={() => nav('/home')} />
      <div className="px-5">
        <h2 data-testid="saved-title" className="t-section mt-2">Voyage enregistré</h2>
        <p className="t-small mb-4 mt-1 text-muted">Ton voyage est maintenant dans Mes voyages.</p>
        {it && <PhotoCard src="rome.jpg" title={it.destination} sub={`${fmtRange(parseISO(it.startDate), parseISO(it.endDate))} · ${it.travelers} voyageurs`} />}
      </div>
      <div className="flex-1" />
      <div className="px-5 pb-4 pt-6"><Button onClick={() => nav('/trips')}>Voir mes voyages</Button></div>
    </>
  );
}
