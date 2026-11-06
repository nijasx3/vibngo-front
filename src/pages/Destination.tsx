import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Accordion, Badge, Button, Card, Chip, SectionTitle, Visual } from '../components/ui';
import ItemCard from '../components/ItemCard';
import { catalog } from '../api/mockApi';
import { useStore } from '../state/store';
import { PROFILES } from '../lib/scoring';
import { useState } from 'react';

export default function Destination() {
  const nav = useNavigate();
  const { user, resetDraft } = useStore();
  const city = catalog.city;
  const profile = PROFILES.find((p) => p.id === user?.traveler_type);
  const [cat, setCat] = useState<string>('Tous');
  const cats = ['Tous', ...Array.from(new Set(city.activites.map((a) => a.category!)))];
  const acts = city.activites.filter((a) => cat === 'Tous' || a.category === cat);

  return (
    <div className="fade-up pb-4">
      <Visual tone="orange" className="h-56 !items-end !justify-center p-4" icon={<MapPin size={64} />} label="Rome">
        <button aria-label="Retour" onClick={() => nav(-1)} className="absolute left-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-brun shadow"><ArrowLeft size={22} /></button>
        <div className="relative z-10 text-center text-white"><h1 className="t-hero" style={{ fontSize: 24 }}>Rome, Italie</h1><p className="t-body px-4">{city.description}</p></div>
      </Visual>
      <div className="flex flex-col gap-4 px-4 pt-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          {[[String(city.stats.activites), 'Activités'], [String(city.stats.hotels), 'Hôtels'], [String(city.stats.note), 'Note communauté']].map(([n, l]) => (
            <div key={l}><p className="t-number text-brun">{n}</p><p className="t-caption text-anthracite/70">{l}</p></div>
          ))}
        </div>
        <Button full onClick={() => { resetDraft('Rome'); nav('/create'); }}>Créer un itinéraire pour Rome</Button>

        <section className="flex flex-col gap-2">
          <SectionTitle>Activités par profil voyageur</SectionTitle>
          <div className="scroll-area flex gap-2 overflow-x-auto">
            {cats.map((c) => <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}
          </div>
          {profile && <p className="t-caption text-anthracite/70">Votre profil : <Badge tone="rose">{profile.name}</Badge></p>}
          <div className="flex flex-col gap-2.5">{acts.slice(0, 4).map((a) => <ItemCard key={a.id} item={a} />)}</div>
        </section>

        <section className="flex flex-col gap-2">
          <SectionTitle action="Voir les hôtels" onAction={() => nav('/explore')}>Hôtels à Rome</SectionTitle>
          <div className="flex flex-col gap-2.5">{city.hotels.slice(0, 2).map((h) => <ItemCard key={h.id} item={h} />)}</div>
        </section>

        <section className="flex flex-col gap-2">
          <SectionTitle>Lieux incontournables</SectionTitle>
          <div className="flex flex-col gap-2.5">{catalog.country.point_d_interet.slice(0, 3).map((p) => <ItemCard key={p.id} item={p} />)}</div>
        </section>

        <Accordion title="Notes et revues de la communauté">
          <p className="t-body text-anthracite/90">Note moyenne {city.stats.note}/5. « Une ville qui se découvre à pied, avec une pause gelato entre deux monuments. » — Marie</p>
        </Accordion>
        <Accordion title="Partenaires à Rome">
          <div className="flex flex-col gap-2">
            {['Offre hébergement partenaire', 'Offre visites guidées'].map((o) => <Card key={o} className="flex items-center justify-between gap-2"><span className="t-card text-brun">{o}</span><Button variant="outline" className="!min-h-9 !px-3">Voir</Button></Card>)}
          </div>
        </Accordion>
        <Accordion title="Alertes locales">
          <p className="t-body text-anthracite/90">Aucune alerte en cours à Rome. Pensez à surveiller les horaires des transports les jours de grève.</p>
        </Accordion>
      </div>
    </div>
  );
}
