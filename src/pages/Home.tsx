import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, GripVertical } from 'lucide-react';
import { Button, Photo, SectionTitle, StepBadge, TopBar, cx } from '../components/ui';
import MiniMap from '../components/MiniMap';
import { DESTINATIONS, communityData, profileById, rome, tripTemplate } from '../api/mockApi';
import { useStore } from '../state/store';
import { dayIndex, delayStop, postponeStop, replaceStop } from '../lib/itinerary';
import { diffDays, fmtDayMonth, fmtLong, fmtRange, parseISO, addDays, today } from '../lib/dates';
import type { Itinerary } from '../types';

function DestinationCards({ ids }: { ids: string[] }) {
  const nav = useNavigate();
  const showToast = useStore((s) => s.showToast);
  return (
    <div className="grid grid-cols-3 gap-2">
      {ids.map((id) => {
        const d = DESTINATIONS.find((x) => x.id === id)!;
        return (
          <button key={id} data-testid={`home-dest-${id}`} onClick={() => (d.available ? nav('/destination/rome') : showToast(`${d.name} arrive bientôt : le prototype ne propose que Rome.`))}
            className="overflow-hidden rounded-lg bg-white text-left shadow-[0_1px_0_rgba(90,46,31,.08)]">
            <Photo src={d.image} alt={d.name} className="h-[62px] w-full" />
            <span className="block px-2 py-1.5"><span className="t-h3 block text-[14px]">{d.name}</span><span className="t-small block text-[10px] text-muted">{d.country}</span><span className="block text-[10px] font-bold">{d.theme}</span></span>
          </button>
        );
      })}
    </div>
  );
}

function CreateCard() {
  const nav = useNavigate();
  return (
    <button onClick={() => nav('/create')} className="flex w-full items-center justify-between rounded-lg border-l-[3px] border-orange bg-sable px-4 py-3.5 text-left">
      <span><span className="t-h3 block">Créer un itinéraire</span><span className="t-small block text-muted">Prépare ton prochain voyage avec Vibi.</span></span>
      <ChevronRight size={20} />
    </button>
  );
}

function Greeting({ name, title }: { name: string; title: string }) {
  return <div className="px-5 pt-1"><p className="t-small text-[13px] text-muted">Bonjour, {name}</p><h1 className="t-hero mt-0.5 text-[30px]">{title}</h1></div>;
}

/** Aucun voyage enregistré. */
function EmptyHome({ name, ids }: { name: string; ids: string[] }) {
  const nav = useNavigate();
  return (
    <>
      <Greeting name={name} title="Prêt pour l’aventure ?" />
      <div className="mt-4 flex flex-col gap-6 px-5 pb-6">
        <button onClick={() => nav('/explore')} className="rounded-lg bg-sable px-4 py-4 text-left"><span className="t-h3 block">Où veux-tu partir ?</span><span className="t-small mt-1 block text-muted">Des idées pour ton prochain voyage.</span></button>
        <section><SectionTitle action="Tout voir" onAction={() => nav('/explore')} sub="Des destinations à explorer">Destinations à découvrir</SectionTitle><DestinationCards ids={ids} /></section>
        <CreateCard />
        <Button variant="light" onClick={() => nav('/discover')} className="border-l-[3px] border-orange">Découvrir Vibngo</Button>
      </div>
    </>
  );
}

/** Voyage enregistré qui n'a pas encore commencé. */
function BeforeHome({ name, it, ids, profileName }: { name: string; it: Itinerary; ids: string[]; profileName?: string }) {
  const nav = useNavigate();
  const days = diffDays(parseISO(it.startDate), today());
  const nDays = it.days.length;
  const c = communityData.liked;
  return (
    <>
      <Greeting name={name} title="Prêt pour l’aventure ?" />
      <div className="mt-4 flex flex-col gap-6 px-5 pb-6">
        <button data-testid="next-trip" onClick={() => nav('/trip')} className="rounded-xl border-t-[3px] border-orange bg-brun p-5 text-left text-white">
          <div className="t-micro text-white/70">Prochain départ</div>
          <div className="t-hero mt-1">{it.destination.replace(', ', ', ')}</div>
          <div className="t-small mt-1 text-white/90">{fmtRange(parseISO(it.startDate), parseISO(it.endDate))} · {nDays} jours</div>
          <div className="mt-4 flex items-end justify-between border-t border-white/20 pt-3"><span className="t-micro text-white/70">Compte à rebours</span><span data-testid="countdown" className="text-[26px] font-bold">J−{days}</span></div>
        </button>
        <section>
          <SectionTitle action="Tout voir" onAction={() => nav('/trip')}>Avant le départ</SectionTitle>
          <ul>{tripTemplate.before.map(([a, b]) => (
            <li key={a} className="flex items-center justify-between border-t border-trait py-3 text-[14px]"><span className="font-bold">{a}</span><span className="t-small flex items-center gap-1 text-muted">{b}<ChevronRight size={14} /></span></li>
          ))}</ul>
        </section>
        <section><SectionTitle action="Tout voir" onAction={() => nav('/explore')} sub={profileName ? `Selon ton profil ${profileName}` : undefined}>Tendances pour vous</SectionTitle><DestinationCards ids={ids} /></section>
        <section>
          <SectionTitle>Aimé par des voyageurs comme toi</SectionTitle>
          <div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-sable text-[11px] font-medium">ML</span><div className="flex-1"><div className="t-small font-bold">{c.author} · {c.role}</div><div className="t-small text-[10px] text-muted">{c.place} · « {c.quote} »</div><div className="t-small text-[10px] text-muted">{c.likes} j’aime · {c.comments} commentaires</div></div></div>
        </section>
        <CreateCard />
      </div>
    </>
  );
}

/** Voyage en cours : programme du jour, actions rapides, Vibi. */
function OngoingHome({ name, it }: { name: string; it: Itinerary }) {
  const nav = useNavigate();
  const { updateItinerary } = useStore();
  const di = Math.min(Math.max(dayIndex(it), 0), it.days.length - 1);
  const stops = it.days[di];
  const [sel, setSel] = useState<string | null>(null);
  const selected = stops.find((s) => s.id === sel)?.id ?? stops[0]?.id;
  const date = addDays(parseISO(it.startDate), di);
  const act = (fn: (x: Itinerary, id: string) => Itinerary | null, ok: string, err?: string) => {
    if (!selected) return;
    updateItinerary((x) => fn(x, selected), err);
    useStore.getState().showToast(ok);
    setSel(null);
  };
  return (
    <>
      <div className="px-5 pt-1"><p className="t-small text-[13px] text-muted">Bonjour, {name}</p><h1 className="t-hero mt-0.5 text-[30px]">Voyage à {it.destination.split(',')[0]}</h1></div>
      <div className="mt-3 flex flex-col gap-4 px-5 pb-6">
        <MiniMap stops={stops.length} temp={rome.weather} friends={3} />
        <section>
          <div className="flex items-center justify-between"><span className="t-micro text-muted">Le programme</span><span className="t-small text-muted">Touche une étape pour la modifier</span></div>
          <div className="flex items-baseline justify-between"><h2 data-testid="today" className="t-section mt-1">{fmtLong(date)}</h2><button onClick={() => nav('/trip')} className="text-[12px] font-bold">Tout voir</button></div>
          {stops.length === 0 && <p className="t-body mt-3 text-muted">Aucune activité prévue pour cette journée.</p>}
          <ul className="mt-2">
            {stops.slice(0, 3).map((s, i) => (
              <li key={s.id}>
                <button onClick={() => setSel(s.id)} aria-pressed={selected === s.id} data-testid={`stop-${i}`}
                  className={cx('flex w-full items-center gap-3 border-t border-trait py-3.5 text-left', selected === s.id && 'bg-sable/60')}>
                  <StepBadge n={i + 1} /><span className="w-11 text-[13px] font-bold">{s.time}</span>
                  <span className="min-w-0 flex-1"><span className="t-h3 block truncate text-[15px]">{s.title}</span><span className="t-small block truncate text-muted">{s.sub}</span></span>
                  {s.tag && <span className="rounded bg-vert px-2 py-0.5 text-[10px] font-bold">{s.tag}</span>}
                  <GripVertical size={16} className="text-muted" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="t-label mb-2 text-[12px]">Modifier une activité</h3>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="light" stripe={false} className="min-h-11 text-[13px]" onClick={() => act((x, id) => delayStop(x, di, id), 'Activité retardée d’une heure')}>Retarder</Button>
            <Button variant="light" stripe={false} className="min-h-11 text-[13px]" onClick={() => act((x, id) => postponeStop(x, di, id), 'Activité reportée à demain', 'Impossible de reporter : c’est le dernier jour du voyage.')}>Reporter</Button>
            <Button variant="orange" className="min-h-11 text-[13px]" onClick={() => act((x, id) => replaceStop(x, di, id), 'Activité remplacée', 'Aucune alternative disponible.')}>Changer</Button>
          </div>
        </section>
        <button onClick={() => nav('/vibi')} className="flex items-center gap-3 rounded-lg bg-brun p-4 text-left text-white">
          <span className="flex-1"><span className="t-micro block text-white/70">Vibi / Ton assistant de voyage</span><span className="t-h3 mt-1 block text-[16px]">La météo change ce soir.</span><span className="t-small block text-white/85">Adapter votre planning ?</span></span><ChevronRight />
        </button>
        <p className="t-small rounded-lg bg-sable px-3 py-2 text-muted">Vol AF1234 · Hôtel Colosseum Palace · Musées Vatican</p>
        <button onClick={() => nav('/trip')} className="t-small text-left font-bold underline">Voir tout le voyage ({fmtDayMonth(parseISO(it.startDate))} → {fmtDayMonth(parseISO(it.endDate))})</button>
      </div>
    </>
  );
}

export default function Home() {
  const user = useStore((s) => s.user)!;
  const it = user.current_itinerary;
  const profile = profileById(user.traveler_type);
  const ids = profile?.destinations.slice(0, 3) ?? ['rome', 'kyoto', 'patagonie'];
  return (
    <>
      <TopBar />
      {!it && <EmptyHome name={user.name} ids={ids} />}
      {it && dayIndex(it) < 0 && <BeforeHome name={user.name} it={it} ids={ids} profileName={profile?.name} />}
      {it && dayIndex(it) >= 0 && <OngoingHome name={user.name} it={it} />}
    </>
  );
}
