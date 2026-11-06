import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, X } from 'lucide-react';
import TopBar from '../components/TopBar';
import ItemCard from '../components/ItemCard';
import { Button, Card, Chip, SectionTitle, Visual } from '../components/ui';
import { catalog, community_ } from '../api/mockApi';
import { addDays, fmtLong, today } from '../lib/dates';
import type { Item } from '../types';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const TYPE_WORDS: Record<string, string> = { monument: 'monument lieu', activity: 'activite', hotel: 'hotel hotels hebergement', resto: 'restaurant restaurants resto manger' };
const haystack = (i: Item) => norm([i.name, i.tagline, i.description, i.address, ...(i.tags ?? []), TYPE_WORDS[i.type], 'rome italie'].join(' '));

const TABS = ['Lieux', 'Activités', 'Utilisateurs', 'Événements'] as const;
type Tab = (typeof TABS)[number];
const KINDS = [['all', 'Tous'], ['monument', 'Monuments'], ['hotel', 'Hôtels'], ['resto', 'Restaurants']] as const;

export default function Explore() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<Tab>('Lieux');
  const [kind, setKind] = useState<(typeof KINDS)[number][0]>('all');
  const query = norm(q.trim());
  const tokens = query.split(/\s+/).filter(Boolean);
  const match = (h: string) => tokens.every((t) => h.includes(t) || h.includes(t.replace(/s$/, '')));

  const places = useMemo(() => [...catalog.country.point_d_interet, ...catalog.city.hotels, ...catalog.city.resto].filter((i) => (kind === 'all' || i.type === kind) && match(haystack(i))), [q, kind]); // eslint-disable-line react-hooks/exhaustive-deps
  const acts = useMemo(() => catalog.city.activites.filter((i) => match(haystack(i))), [q]); // eslint-disable-line react-hooks/exhaustive-deps
  const users = community_.users.filter((u) => match(norm(`${u.name} ${u.profile} ${u.trip} utilisateur voyageur`)));
  const events = community_.events.filter((e) => match(norm(`${e.title} ${e.where} evenement rome`)));
  const counts: Record<Tab, number> = { Lieux: places.length, 'Activités': acts.length, Utilisateurs: users.length, 'Événements': events.length };
  const showRome = tokens.length > 0 && match(norm('rome italie destination ville'));
  const total = counts.Lieux + counts['Activités'] + counts.Utilisateurs + counts['Événements'];

  return (
    <div className="fade-up">
      <TopBar title="Explorer" />
      <div className="flex flex-col gap-4 px-4 pb-4">
        <div className="flex items-center gap-2 rounded-full border border-line bg-white px-4 focus-within:border-orange">
          <Search size={18} className="shrink-0 text-anthracite/50" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Lieux, activités, hôtels, utilisateurs…" aria-label="Rechercher" type="search"
            className="t-body-m min-h-11 flex-1 bg-transparent text-anthracite placeholder:text-anthracite/40 focus:!outline-none focus-visible:!outline-none" />
          {q && <button aria-label="Effacer la recherche" onClick={() => setQ('')} className="flex h-8 w-8 items-center justify-center text-anthracite/60"><X size={16} /></button>}
        </div>

        <div className="scroll-area flex gap-2 overflow-x-auto" role="tablist">
          {TABS.map((t) => (
            <Chip key={t} active={tab === t} onClick={() => setTab(t)}>{t}{tokens.length > 0 && <span className="opacity-70">({counts[t]})</span>}</Chip>
          ))}
        </div>

        {showRome && (
          <Card onClick={() => nav('/destination/rome')} className="flex items-center gap-3">
            <Visual tone="orange" className="h-14 w-14 shrink-0 rounded-xl" icon={<MapPin size={24} />} label="Rome" />
            <div className="min-w-0 flex-1"><p className="t-card text-brun">Rome, Italie</p><p className="t-caption text-anthracite/70">Destination · {catalog.city.stats.activites} activités · {catalog.city.stats.hotels} hôtels</p></div>
          </Card>
        )}

        {tab === 'Lieux' && (
          <div className="scroll-area flex gap-2 overflow-x-auto" aria-label="Filtrer par type">
            {KINDS.map(([k, label]) => <Chip key={k} active={kind === k} onClick={() => setKind(k)} className="!py-1">{label}</Chip>)}
          </div>
        )}

        {tokens.length === 0 && tab === 'Lieux' && kind === 'all' && (
          <section className="flex flex-col gap-2">
            <SectionTitle>Destination populaire</SectionTitle>
            <button onClick={() => nav('/destination/rome')} className="text-left">
              <Visual tone="orange" className="h-36 rounded-3xl !items-end !justify-start p-4" label="Rome">
                <div className="relative text-white"><p className="t-hero">Rome</p><p className="t-body">Italie · la Ville éternelle</p></div>
              </Visual>
            </button>
            <SectionTitle>Lieux à découvrir</SectionTitle>
          </section>
        )}

        <div className="flex flex-col gap-2.5" role="tabpanel">
          {tab === 'Lieux' && places.map((i) => <ItemCard key={i.id} item={i} />)}
          {tab === 'Activités' && acts.map((i) => <ItemCard key={i.id} item={i} />)}
          {tab === 'Utilisateurs' && users.map((u) => (
            <Card key={u.id} className="flex items-center gap-3">
              <span className="t-card flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose text-white">{u.name[0]}</span>
              <div className="min-w-0 flex-1"><p className="t-card text-brun">{u.name}</p><p className="t-caption text-anthracite/70">{u.profile} · voyage à {u.trip}</p></div>
              <Button variant="outline" className="!min-h-9 !px-3" onClick={() => nav('/community')}>Message</Button>
            </Card>
          ))}
          {tab === 'Événements' && events.map((e) => (
            <Card key={e.id}><p className="t-card text-brun">{e.title}</p><p className="t-caption text-anthracite/70">{fmtLong(addDays(today(), e.dayOffset))} · {e.where}</p></Card>
          ))}
          {counts[tab] === 0 && (
            <div className="rounded-2xl bg-white p-4 text-center" data-testid="no-result">
              <p className="t-card text-brun">Aucun résultat{q ? ` pour « ${q} »` : ''}</p>
              <p className="t-body mt-1 text-anthracite/70">{total > 0 ? 'Essayez un autre onglet : des résultats y sont disponibles.' : 'Ce prototype couvre uniquement Rome. Essayez « Rome », « hôtel » ou « Colisée ».'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
