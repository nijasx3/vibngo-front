import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Search, SlidersHorizontal, X } from 'lucide-react';
import { Button, Chip, Empty, Header, ListRow, Photo, SectionTitle, Sheet, Tabs, TopBar, Avatar, PhotoCard, cx } from '../components/ui';
import { ACTIVITIES, DESTINATIONS, EVENTS, PLACES, VIBERS, norm, rome } from '../api/mockApi';
import { useStore } from '../state/store';
import { addDays, monthAbbr, today } from '../lib/dates';

const TABS = ['Lieux', 'Activités', 'Utilisateurs', 'Événements'];
const TYPES = ['Tous', 'Destinations', 'Monuments', 'Musées', 'Points de vue', 'Parcs', 'Restaurants', 'Hébergements'];
const PLACEHOLDER: Record<string, string> = { Lieux: 'Lieux, activités, voyageurs…', Activités: 'Rechercher une activité…', Utilisateurs: 'Rechercher un utilisateur…', 'Événements': 'Rechercher un événement…' };

interface Filters { type: string; note: number; free: boolean; acc: boolean; min: string; max: string }

function FilterSheet({ open, onClose, q, value, onApply }: { open: boolean; onClose: () => void; q: string; value: Filters; onApply: (f: Filters) => void }) {
  const [f, setF] = useState(value);
  const set = (p: Partial<Filters>) => setF((x) => ({ ...x, ...p }));
  const reset = { type: 'Tous', note: 0, free: false, acc: false, min: '', max: '' };
  return (
    <Sheet open={open} onClose={onClose} title="Filtres">
      <p className="t-small -mt-2 mb-3 text-muted">Affiner les résultats pour « {q} »</p>
      <h3 className="t-label mb-2">Type de lieu</h3>
      <div className="flex flex-wrap gap-2">{TYPES.map((t) => <Chip key={t} active={f.type === t} onClick={() => set({ type: t })}>{t}</Chip>)}</div>
      <h3 className="t-label mb-2 mt-4">Note minimale</h3>
      <div className="flex gap-2">{[[0, 'Toutes'], [4, '4 et +'], [4.5, '4,5 et +']].map(([v, l]) => <Chip key={l as string} active={f.note === v} onClick={() => set({ note: v as number })}>{l}</Chip>)}</div>
      <h3 className="t-label mb-2 mt-4">Accessibilité</h3>
      <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={f.acc} onChange={(e) => set({ acc: e.target.checked })} className="h-4 w-4 accent-orange" />Accès en fauteuil roulant</label>
      <h3 className="t-label mb-2 mt-4">Prix</h3>
      <div className="grid grid-cols-2 gap-2">
        <label className="rounded-lg bg-sable px-3 py-2"><span className="t-small block">Min. (€)</span><input inputMode="numeric" value={f.min} onChange={(e) => set({ min: e.target.value.replace(/\D/g, '') })} placeholder="10" aria-label="Prix minimum" className="w-full bg-transparent text-[14px] focus:outline-none" /></label>
        <label className="rounded-lg bg-sable px-3 py-2"><span className="t-small block">Max. (€)</span><input inputMode="numeric" value={f.max} onChange={(e) => set({ max: e.target.value.replace(/\D/g, '') })} placeholder="75" aria-label="Prix maximum" className="w-full bg-transparent text-[14px] focus:outline-none" /></label>
      </div>
      <label className="mt-3 flex items-center gap-2 text-[13px]"><input type="checkbox" checked={f.free} onChange={(e) => set({ free: e.target.checked })} className="h-4 w-4 accent-orange" />Gratuit uniquement</label>
      <div className="mt-5 flex flex-col gap-2">
        <Button onClick={() => { onApply(f); onClose(); }}>Voir les résultats</Button>
        <Button variant="light" stripe={false} onClick={() => setF(reset)}>Réinitialiser</Button>
      </div>
    </Sheet>
  );
}

function matchesType(p: (typeof PLACES)[number], type: string) {
  if (type === 'Tous') return true;
  if (type === 'Destinations') return false;
  return p.cat === type;
}

function PlacesResults({ q, f }: { q: string; f: Filters }) {
  const nav = useNavigate();
  const nq = norm(q.trim());
  const setP = useSearchParams()[1];
  const destMatch = (norm(rome.name).includes(nq) || norm(rome.country).includes(nq)) && (f.type === 'Tous' || f.type === 'Destinations');
  const places = PLACES.filter((p) => {
    const hay = norm(`${p.name} ${p.typeLabel} ${p.cat} Rome ${p.kind === 'hotel' ? 'hotel hebergement' : ''}`);
    return hay.includes(nq) && matchesType(p, f.type) && p.rating >= f.note && (!f.acc || p.accessible) && (!f.free || p.free)
      && (!f.min || p.price >= Number(f.min)) && (!f.max || p.price <= Number(f.max));
  });
  if (!destMatch && places.length === 0) {
    return <Empty title={`Aucun résultat pour « ${q} »`} text="Vérifie l’orthographe ou essaie un autre mot-clé."><Button variant="secondary" onClick={() => setP({ tab: 'Lieux' }, { replace: true })}>Effacer la recherche</Button></Empty>;
  }
  return (
    <div className="px-5 pb-6">
      <h2 className="t-section">Résultats pour « {q} »</h2>
      <p className="t-small mt-1 text-muted" data-testid="count">{destMatch ? '1 destination · ' : ''}{places.length} lieu{places.length > 1 ? 'x' : ''}</p>
      {destMatch && (
        <div className="mt-4"><PhotoCard src={rome.image} title={rome.title} label="Destination" height="h-40" onClick={() => nav('/destination/rome')} /></div>
      )}
      {places.length > 0 && <>
        <h2 className="t-section mt-6">Lieux à découvrir</h2>
        <div className="mt-3 flex flex-col gap-2">{places.map((p) => (
          <ListRow key={p.id} testId={`place-${p.id}`} src={p.image} title={p.name} sub={`${p.typeLabel} · Rome${p.kind === 'hotel' ? ` · ${p.priceLabel}` : ''}`} onClick={() => nav(`/place/${p.id}`)} />
        ))}</div>
      </>}
    </div>
  );
}

function ActivitiesTab({ q }: { q: string }) {
  const { activities, toggleActivity } = useStore();
  const [cat, setCat] = useState('Toutes');
  const nq = norm(q);
  const list = ACTIVITIES.filter((a) => norm(`${a.name} ${a.meta} ${a.city}`).includes(nq) && (cat === 'Toutes' || a.category === cat));
  const trending = ACTIVITIES.slice(0, 3);
  return (
    <div className="px-5 pb-6">
      {!q && <>
        <SectionTitle>Activités tendances</SectionTitle>
        <div className="scroll-area -mx-5 flex shrink-0 gap-3 overflow-x-auto px-5 pb-2">{trending.map((a) => (
          <div key={a.id} className="w-[132px] shrink-0 overflow-hidden rounded-lg bg-white"><Photo src={a.image} className="h-[80px] w-full" /><div className="t-small px-2 py-2 font-bold">{a.name}</div></div>
        ))}</div>
      </>}
      <div className="scroll-area mt-3 flex shrink-0 gap-2 overflow-x-auto">{['Toutes', 'Plein air', 'Sport', 'Culture', 'Patrimoine'].map((c) => <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}</div>
      <h2 className="t-section mt-5">{q ? `Résultats pour « ${q} »` : 'Toutes les activités'}</h2>
      {list.length === 0 && <Empty title={`Aucun résultat${q ? ` pour « ${q} »` : ''}`} text="Vérifie l’orthographe ou essaie un autre mot-clé." />}
      <div className="mt-3 flex flex-col gap-2">{list.map((a) => {
        const on = activities.some((x) => x.id === a.id);
        const n = a.interested !== null ? `${a.interested + (on ? 1 : 0)} personnes intéressées` : a.sub;
        return (
          <div key={a.id} data-testid={`activity-${a.id}`} className="flex items-center gap-3 rounded-lg bg-white p-2">
            <Photo src={a.image} className="h-14 w-14 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1"><div className="t-h3 truncate text-[15px]">{a.name}</div><div className="t-small text-muted">{a.meta}</div><div className="t-small text-[10px] text-muted">{n}</div></div>
            <button onClick={() => toggleActivity(a.id)} aria-pressed={on} className={cx('flex min-h-9 items-center gap-1 rounded-md px-3 text-[12px] font-bold', on ? 'border border-brun text-brun' : 'bg-orange text-white')}>{on && <Check size={12} />}{on ? 'Inscrit' : 'S’inscrire'}</button>
          </div>
        );
      })}</div>
    </div>
  );
}

function UsersTab({ q }: { q: string }) {
  const { requested, requestViber, user } = useStore();
  const list = VIBERS.filter((v) => norm(`${v.name} ${v.sub}`).includes(norm(q)));
  return (
    <div className="px-5 pb-6">
      <h2 className="t-section">Vibers à découvrir</h2>
      <p className="t-small mt-0.5 text-muted">Ajoute des vibers pour échanger avec eux.</p>
      {list.length === 0 && <Empty title={`Aucun résultat pour « ${q} »`} text="Vérifie l’orthographe ou essaie un autre mot-clé." />}
      <ul className="mt-3 flex flex-col gap-2">{list.map((v) => {
        const friend = user?.friends.includes(v.id);
        const pending = requested.includes(v.id);
        return (
          <li key={v.id} className="flex items-center gap-3 rounded-lg bg-white p-3">
            <Avatar initials={v.initials} size={40} />
            <div className="min-w-0 flex-1"><div className="t-h3 text-[15px]">{v.name}</div><div className="t-small text-muted">{v.sub}</div></div>
            {friend ? <span className="t-small font-bold text-muted">Ami</span>
              : pending ? <span className="rounded-md bg-sable px-3 py-2 text-[12px] font-bold text-muted">En attente</span>
              : <button onClick={() => requestViber(v.id)} className="rounded-md bg-orange px-3 py-2 text-[12px] font-bold text-white">Ajouter</button>}
          </li>
        );
      })}</ul>
    </div>
  );
}

function EventsTab({ q }: { q: string }) {
  const nav = useNavigate();
  const { eventsJoined, toggleEvent } = useStore();
  const list = EVENTS.filter((e) => norm(`${e.title} ${e.city}`).includes(norm(q)));
  return (
    <div className="px-5 pb-6">
      <h2 className="t-section">Événements à venir</h2>
      <p className="t-small mt-0.5 text-muted">Des sorties à partager avec d’autres voyageurs.</p>
      {list.length === 0 && <Empty title={`Aucun résultat pour « ${q} »`} text="Vérifie l’orthographe ou essaie un autre mot-clé." />}
      <ul className="mt-3 flex flex-col gap-2">{list.map((e) => {
        const d = addDays(today(), e.dayOffset);
        const on = eventsJoined.includes(e.id);
        return (
          <li key={e.id} data-testid={`event-${e.id}`} className="flex items-center gap-3 rounded-lg bg-white p-3">
            <button onClick={() => nav(`/event/${e.id}`)} className="flex flex-1 items-center gap-3 text-left">
              <span className="flex w-11 flex-col items-center rounded-md bg-sable py-1.5"><span className="text-[17px] font-bold leading-none">{String(d.getDate()).padStart(2, '0')}</span><span className="text-[9px] font-bold text-orange">{monthAbbr(d)}</span></span>
              <span className="min-w-0 flex-1"><span className="t-h3 block text-[15px] leading-tight">{e.title}</span><span className="t-small block text-muted">{e.city} · {e.hour}</span></span>
            </button>
            <button onClick={() => toggleEvent(e.id)} aria-pressed={on} className={cx('flex min-h-9 items-center gap-1 rounded-md px-3 text-[12px] font-bold', on ? 'border border-brun' : 'bg-orange text-white')}>{on && <Check size={12} />}{on ? 'Inscrit' : 'Inscription'}</button>
          </li>
        );
      })}</ul>
    </div>
  );
}

/** Destinations populaires + liste alphabétique (état sans recherche). */
function Destinations() {
  const nav = useNavigate();
  const showToast = useStore((s) => s.showToast);
  const open = (id: string, name: string) => (id === 'rome' ? nav('/destination/rome') : showToast(`${name} arrive bientôt : le prototype ne propose que Rome.`));
  const popular = DESTINATIONS.slice(0, 3);
  const alpha = DESTINATIONS.slice().sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  let last = '';
  return (
    <div className="px-5 pb-6">
      <SectionTitle>Destinations populaires</SectionTitle>
      <div className="grid grid-cols-3 gap-2">{popular.map((d) => (
        <button key={d.id} onClick={() => open(d.id, d.name)} data-testid={`pop-${d.id}`} className="overflow-hidden rounded-lg bg-white text-left">
          <Photo src={d.image} alt={d.name} className="h-[70px] w-full" /><span className="block px-2 py-1.5"><span className="t-h3 block text-[14px]">{d.name}</span><span className="t-small block text-[10px] text-muted">{d.country} {d.rating} ★</span></span>
        </button>
      ))}</div>
      <h2 className="t-section mt-6">Toutes les destinations</h2>
      <ul className="mt-2">{alpha.map((d) => {
        const letter = d.name[0].normalize('NFD')[0].toUpperCase();
        const head = letter !== last ? letter : null; last = letter;
        return (
          <li key={d.id}>
            {head && <div className="t-label mt-3 text-muted">{head}</div>}
            <button onClick={() => open(d.id, d.name)} className="flex w-full items-baseline justify-between border-b border-trait py-3 text-left"><span className="t-h3 text-[16px]">{d.name}</span><span className="t-small text-muted">{d.country}</span></button>
          </li>
        );
      })}</ul>
    </div>
  );
}

export default function Explore() {
  const [sp, setSp] = useSearchParams();
  const [filters, setFiltersOpen] = useState(false);
  const q = sp.get('q') ?? '';
  const tab = TABS.includes(sp.get('tab') ?? '') ? sp.get('tab')! : 'Lieux';
  const f: Filters = { type: sp.get('type') ?? 'Tous', note: Number(sp.get('note') ?? 0), free: sp.get('free') === '1', acc: sp.get('acc') === '1', min: sp.get('min') ?? '', max: sp.get('max') ?? '' };
  const active = f.type !== 'Tous' || f.note > 0 || f.free || f.acc || !!f.min || !!f.max;
  const update = (patch: Record<string, string | null>) => {
    const n = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => (v === null || v === '' ? n.delete(k) : n.set(k, v)));
    setSp(n, { replace: true });
  };
  const apply = (x: Filters) => update({ type: x.type === 'Tous' ? null : x.type, note: x.note ? String(x.note) : null, free: x.free ? '1' : null, acc: x.acc ? '1' : null, min: x.min, max: x.max });
  const searching = q.trim().length > 0;

  return (
    <>
      {searching ? <Header title="Recherche" onBack={() => update({ q: null, type: null, note: null, free: null, acc: null, min: null, max: null })} /> : <><TopBar /><div className="px-5 pb-2 pt-2"><h1 className="t-title text-[28px]">Explorer</h1></div></>}
      <div className="flex items-center gap-2 px-5 pb-3">
        <label className="flex min-h-11 flex-1 items-center gap-2 rounded-lg bg-sable px-3">
          <Search size={18} />
          <input type="search" value={q} onChange={(e) => update({ q: e.target.value })} placeholder={PLACEHOLDER[tab]} aria-label="Rechercher" className="t-body min-w-0 flex-1 bg-transparent text-[15px] focus:outline-none" />
          {searching && <button aria-label="Effacer la recherche" onClick={() => update({ q: null })}><X size={16} /></button>}
        </label>
        {searching && tab === 'Lieux' && <button aria-label="Filtres" onClick={() => setFiltersOpen(true)} className="relative flex h-11 w-11 items-center justify-center rounded-lg bg-orange text-white"><SlidersHorizontal size={18} />{active && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-fond bg-brun" />}</button>}
      </div>
      <Tabs items={TABS} value={tab} onChange={(t) => update({ tab: t })} />
      <div className="pt-4">
        {tab === 'Lieux' && (searching ? <PlacesResults q={q} f={f} /> : <Destinations />)}
        {tab === 'Activités' && <ActivitiesTab q={q} />}
        {tab === 'Utilisateurs' && <UsersTab q={q} />}
        {tab === 'Événements' && <EventsTab q={q} />}
      </div>
      {filters && <FilterSheet key={JSON.stringify(f)} open onClose={() => setFiltersOpen(false)} q={q} value={f} onApply={apply} />}
    </>
  );
}
