import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Badge, Button, Card, Chip, Header } from '../components/ui';
import ItemRow from '../components/ItemRow';
import { useStore } from '../state/store';
import { addDays, diffDays, fmtLong, fmtShort, parseISO, today } from '../lib/dates';
import { delayItem, postponeItem, removeItem, replaceItem } from '../lib/itinerary';
import { PROFILES } from '../lib/scoring';

export default function Itinerary() {
  const nav = useNavigate();
  const { user, updateItinerary } = useStore();
  const it = user?.current_itinerary;
  const [sel, setSel] = useState(() => (it ? Math.min(Math.max(diffDays(today(), parseISO(it.startDate)), 0), it.days.length - 1) : 0));
  const profile = PROFILES.find((p) => p.id === user?.traveler_type);

  if (!it) {
    return (
      <div className="fade-up">
        <Header title="Mon itinéraire" back />
        <div className="flex flex-col items-center gap-3 px-6 pt-16 text-center">
          <p className="t-screen text-brun">Pas encore d'itinéraire</p>
          <p className="t-body text-anthracite/80">Créez votre premier itinéraire pour le retrouver ici.</p>
          <Button onClick={() => nav('/create')}>Créer un itinéraire</Button>
        </div>
      </div>
    );
  }
  const start = parseISO(it.startDate);
  return (
    <div className="fade-up pb-4">
      <Header title="Mon itinéraire" back />
      <div className="flex flex-col gap-4 px-4">
        <Card className="!bg-brun !border-brun text-white" >
          <div className="flex items-start justify-between gap-2"><p className="t-hero" data-testid="itinerary-title">{it.title} · {it.destination}</p><Badge>En cours</Badge></div>
          <p className="t-body mt-1 text-white/85">{fmtLong(start)} → {fmtLong(parseISO(it.endDate))} · {it.travelers} voyageur{it.travelers > 1 ? 's' : ''}</p>
          {profile && <p className="t-caption mt-2 text-white/85">Adapté à votre profil : {profile.name}</p>}
        </Card>
        <div className="scroll-area flex gap-2 overflow-x-auto">
          {it.days.map((d, i) => <Chip key={d.label} active={sel === i} onClick={() => setSel(i)}>J{i + 1} · {fmtShort(addDays(start, i))}</Chip>)}
        </div>
        <section className="flex flex-col gap-2">
          <h2 className="t-section text-brun">{it.days[sel].label}</h2>
          {it.days[sel].items.map((item) => (
            <ItemRow key={item.id} item={item} showStatus actions={{
              onDelay: () => updateItinerary((x) => delayItem(x, item.id)),
              onPostpone: () => updateItinerary((x) => postponeItem(x, item.id), "C'est le dernier jour : impossible de reporter."),
              onReplace: () => updateItinerary((x) => replaceItem(x, item.id), 'Aucune alternative disponible pour cette activité.'),
              onDelete: () => updateItinerary((x) => removeItem(x, item.id)),
            }} />
          ))}
          {it.days[sel].items.length === 0 && <p className="t-body text-anthracite/70">Journée libre.</p>}
        </section>
        <Button full variant="outline" onClick={() => nav('/notebook')}><BookOpen size={18} />Carnet de voyage</Button>
      </div>
    </div>
  );
}
