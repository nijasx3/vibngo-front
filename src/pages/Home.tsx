import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, ChevronRight, FileText, HeartPulse, Luggage, MapPin, Smartphone, Sun, Users } from 'lucide-react';
import TopBar from '../components/TopBar';
import ItemRow from '../components/ItemRow';
import { Accordion, Badge, Button, Card, Chip, SectionTitle, Visual, cx } from '../components/ui';
import { catalog, community_, itineraryTemplate } from '../api/mockApi';
import { useStore } from '../state/store';
import { addDays, diffDays, fmtLong, fmtShort, iso, parseISO, today } from '../lib/dates';
import { delayItem, postponeItem, replaceItem } from '../lib/itinerary';
import { PROFILES } from '../lib/scoring';

const TIP_ICONS = [FileText, HeartPulse, Smartphone, Luggage];

function Tips({ title }: { title: string }) {
  return (
    <Accordion title={title}>
      <ul className="flex flex-col gap-3">
        {itineraryTemplate.tips.map(([k, v], i) => {
          const Icon = TIP_ICONS[i] ?? FileText;
          return (
            <li key={k} className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange/10 text-orange"><Icon size={18} /></span>
              <div><p className="t-card text-brun">{k}</p><p className="t-body text-anthracite/80">{v}</p></div>
            </li>
          );
        })}
      </ul>
    </Accordion>
  );
}

function OngoingHome() {
  const nav = useNavigate();
  const { user, activities, updateItinerary } = useStore();
  const it = user!.current_itinerary!;
  const start = parseISO(it.startDate);
  const nDays = it.days.length;
  const idx = Math.min(Math.max(diffDays(today(), start), 0), nDays - 1);
  const [sel, setSel] = useState(idx);
  const date = addDays(start, sel);
  const geo = user!.parameters.geo;
  const friendsActs = activities.filter((a) => a.date === iso(date));
  const offered = community_.offeredActivities;

  return (
    <>
      <TopBar greeting={`Bonjour, ${user!.name}`} title={`Voyage à ${it.destination}`} />
      <div className="flex flex-col gap-4 px-4 pb-4">
        <Visual tone="brun" className="h-44 rounded-3xl" icon={<MapPin size={44} />} label="Carte du voyage">
          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            <Chip className="!bg-white/95"><Sun size={12} className="text-orange" />Rome</Chip>
            {geo ? <Chip className="!bg-white/95"><Users size={12} className="text-orange" />Paul est à proximité</Chip> : <Chip className="!bg-white/95">Géolocalisation désactivée</Chip>}
          </div>
        </Visual>

        <section className="flex flex-col gap-3">
          <SectionTitle action="Mon itinéraire" onAction={() => nav('/itinerary')}>{sel === idx ? "Aujourd'hui" : 'Programme'} · {fmtLong(date)}</SectionTitle>
          <div className="scroll-area flex gap-2 overflow-x-auto" role="tablist">
            {it.days.map((_, i) => (
              <Chip key={i} active={sel === i} onClick={() => setSel(i)}>{i === idx ? "Aujourd'hui" : fmtShort(addDays(start, i))}</Chip>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {[
              ...it.days[sel].items.map((item) => ({ time: item.time, node: (
                <ItemRow key={item.id} item={item} showStatus
                  actions={{
                    onDelay: () => updateItinerary((x) => delayItem(x, item.id)),
                    onPostpone: () => updateItinerary((x) => postponeItem(x, item.id), "C'est le dernier jour : impossible de reporter."),
                    onReplace: () => updateItinerary((x) => replaceItem(x, item.id), "Aucune alternative disponible pour cette activité."),
                  }} />
              ) })),
              ...friendsActs.map((a) => {
                const o = offered.find((x) => x.id === a.id);
                return { time: o?.time ?? '99:99', node: (
                  <Card key={a.id} className="flex items-center gap-3 !border-orange/40">
                    <div className="flex w-11 shrink-0 flex-col items-center"><span className="t-body-s text-brun">{o?.time}</span></div>
                    <div className="min-w-0 flex-1"><p className="t-card truncate text-brun">{a.name}</p><p className="t-caption text-anthracite/70">Proposée par {a.offered_by} · {a.subscriptions} inscrits</p></div>
                    <Badge tone="orange">Inscrit</Badge>
                  </Card>
                ) };
              }),
            ].sort((a, b) => a.time.localeCompare(b.time)).map((e) => e.node)}
            {it.days[sel].items.length === 0 && friendsActs.length === 0 && <p className="t-body text-anthracite/70">Journée libre : profitez-en pour flâner.</p>}
          </div>
        </section>

        <button onClick={() => nav('/chat')} className="flex items-center gap-3 rounded-2xl bg-brun p-3 text-left text-white">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15"><Bot size={22} /></span>
          <span className="flex-1"><span className="t-card block">Assistant IA · Optimisation</span><span className="t-caption block text-white/80">Adaptez votre journée en quelques mots</span></span>
          <ChevronRight size={18} />
        </button>

        {geo && (
          <Accordion title="À proximité de vous">
            <div className="flex flex-col gap-3">
              {[catalog.byId('pantheon')!, catalog.byId('trevi')!].map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0"><p className="t-card truncate text-brun">{p.name}</p><p className="t-caption text-anthracite/70">Point d'intérêt à proximité</p></div>
                  <Button variant="outline" className="!min-h-9 !px-3" onClick={() => nav(`/place/${p.id}`)}>Voir</Button>
                </div>
              ))}
            </div>
          </Accordion>
        )}
        <Tips title="Conseils" />
        <Accordion title="Réservations">
          <ul className="flex flex-col gap-2.5">
            {it.days.flatMap((d) => d.items).filter((x) => x.paid || x.kind !== 'resto').slice(0, 3).map((x) => (
              <li key={x.id} className="flex items-center justify-between gap-2"><span className="t-body-m truncate text-brun">{catalog.byId(x.ref)?.name}</span>{x.paid ? <Badge tone="orange">Confirmé</Badge> : <Badge>À réserver</Badge>}</li>
            ))}
          </ul>
        </Accordion>
      </div>
    </>
  );
}

function BeforeHome() {
  const nav = useNavigate();
  const { user } = useStore();
  const it = user!.current_itinerary;
  const profile = PROFILES.find((p) => p.id === user!.traveler_type);
  const j = it ? diffDays(parseISO(it.startDate), today()) : null;
  const trending = useMemo(() => [catalog.byId('colisee')!, catalog.byId('trastevere')!, catalog.byId('vatican')!], []);
  return (
    <>
      <TopBar greeting={`Bonjour, ${user!.name}`} title="Prêt pour l'aventure ?" />
      <div className="flex flex-col gap-4 px-4 pb-4">
        {it ? (
          <Visual tone="orange" className="h-40 rounded-3xl !items-end !justify-start p-4" label="Prochain départ">
            <div className="absolute left-4 top-4"><Chip className="!bg-white/95">Prochain départ</Chip></div>
            <div className="relative z-10 flex w-full items-end justify-between text-left text-white">
              <div><p className="t-hero">{it.destination}, Italie</p><p className="t-body">{fmtLong(parseISO(it.startDate))}</p></div>
              <Chip className="!bg-white/95">J-{j}</Chip>
            </div>
          </Visual>
        ) : (
          <Visual tone="orange" className="h-40 rounded-3xl !items-end !justify-start p-4" label="Créer un itinéraire">
            <div className="relative z-10 flex w-full items-end justify-between gap-3 text-left text-white">
              <div><p className="t-hero">Où partez-vous ?</p><p className="t-body">Créez un itinéraire sur mesure en quelques étapes.</p></div>
              <Button variant="dark" className="shrink-0" onClick={() => nav('/create')}>Créer</Button>
            </div>
          </Visual>
        )}
        <Tips title="Conseils d'avant-départ" />
        <section className="flex flex-col gap-2">
          <SectionTitle action="Voir tout" onAction={() => nav('/explore')}>Tendances pour vous</SectionTitle>
          <p className="t-caption text-anthracite/60">Guides de voyage · Réseaux sociaux · Favoris de profils similaires</p>
          <div className="scroll-area -mx-4 flex gap-3 overflow-x-auto px-4">
            {trending.map((p) => (
              <button key={p.id} onClick={() => nav(`/place/${p.id}`)} className="w-36 shrink-0 text-left">
                <Visual tone={p.tone} className="h-32 rounded-2xl" label={p.name} />
                <p className="t-card mt-1.5 truncate text-brun">{p.name}</p>
                <p className="t-caption truncate text-anthracite/70">{p.tagline}</p>
              </button>
            ))}
          </div>
        </section>
        <section className="flex flex-col gap-2">
          <SectionTitle>Voyageurs similaires ont aimé</SectionTitle>
          <Card className="flex items-center gap-3">
            <span className="t-card flex h-10 w-10 items-center justify-center rounded-full bg-rose text-white">C</span>
            <div className="min-w-0 flex-1"><p className="t-card text-brun">Clara · {profile?.name}</p><p className="t-body text-anthracite/80">« Le Forum romain au lever du jour, un moment hors du temps. »</p></div>
          </Card>
        </section>
        {!it && (
          <Card onClick={() => nav('/create')} className="flex items-center justify-between gap-2">
            <span><span className="t-card block text-brun">Créer un itinéraire</span><span className="t-caption text-anthracite/70">Générez un programme adapté à votre profil</span></span>
            <ChevronRight size={18} className="text-orange" />
          </Card>
        )}
        {it && <Card onClick={() => nav('/itinerary')} className="flex items-center justify-between gap-2"><span><span className="t-card block text-brun">Mon itinéraire à {it.destination}</span><span className="t-caption text-anthracite/70">Consulter le programme jour par jour</span></span><ChevronRight size={18} className="text-orange" /></Card>}
      </div>
    </>
  );
}

export default function Home() {
  const it = useStore((s) => s.user?.current_itinerary);
  const ongoing = !!it && diffDays(today(), parseISO(it.startDate)) >= 0;
  return <div className={cx('fade-up')}>{ongoing ? <OngoingHome /> : <BeforeHome />}</div>;
}

