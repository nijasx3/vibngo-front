import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, BookOpen, Settings, Trophy } from 'lucide-react';
import { Accordion, Badge, Button, Card, Chip, Visual } from '../components/ui';
import ItemCard from '../components/ItemCard';
import { catalog, community_ } from '../api/mockApi';
import { useStore } from '../state/store';
import { PROFILES } from '../lib/scoring';
import { fmtDay, parseISO } from '../lib/dates';

const FILTERS = [['all', 'Tous'], ['monument', 'Lieux'], ['activity', 'Activités'], ['hotel', 'Hôtels'], ['resto', 'Restaurants']] as const;

export default function Profile() {
  const nav = useNavigate();
  const { user, activities, showToast } = useStore();
  const [f, setF] = useState<(typeof FILTERS)[number][0]>('all');
  if (!user) return null;
  const profile = PROFILES.find((p) => p.id === user.traveler_type);
  const saved = user.like.map((id) => catalog.byId(id)).filter(Boolean).filter((i) => f === 'all' || i!.type === f);
  const it = user.current_itinerary;
  const friends = community_.friends.filter((x) => user.friends.includes(x.id));

  return (
    <div className="fade-up">
      <header className="flex items-center justify-between px-4 pb-2 pt-4">
        <h1 className="t-screen text-brun">Mon profil</h1>
        <button aria-label="Paramètres" onClick={() => nav('/settings')} className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-brun"><Settings size={20} /></button>
      </header>
      <div className="flex flex-col gap-4 px-4 pb-4">
        <div className="flex flex-col items-center gap-2 rounded-3xl bg-white p-5 text-center">
          <Visual tone="orange" className="h-20 w-20 rounded-full" icon={<span className="font-[family-name:var(--font-title)] text-3xl font-bold">{user.name[0].toUpperCase()}</span>} label="Avatar" />
          <p className="t-screen text-brun" data-testid="profile-name">{user.name}</p>
          {profile && <Badge tone="orange" >{profile.name}</Badge>}
          <p className="t-caption text-anthracite/70">Niveau 1 · 120 XP</p>
          <div className="mt-2 grid w-full grid-cols-3 gap-2">
            {[[it ? 1 : 0, 'Voyages'], [activities.length, 'Activités'], [user.like.length, 'Favoris']].map(([n, l]) => (
              <div key={l as string}><p className="t-number text-brun">{n}</p><p className="t-caption text-anthracite/70">{l}</p></div>
            ))}
          </div>
        </div>

        <Accordion title="Mes itinéraires" defaultOpen right={<Badge>{it ? 1 : 0}</Badge>}>
          {it ? (
            <Card className="flex items-center justify-between gap-2 !border-orange/40" onClick={() => nav('/itinerary')}>
              <span><span className="t-card block text-brun">{it.title} · {it.destination}</span><span className="t-caption text-anthracite/70">{fmtDay(parseISO(it.startDate))} → {fmtDay(parseISO(it.endDate))}</span></span>
              <Badge tone="orange">En cours</Badge>
            </Card>
          ) : (
            <div className="flex flex-col items-start gap-2"><p className="t-body text-anthracite/80">Vous n'avez pas encore d'itinéraire.</p><Button onClick={() => nav('/create')}>Créer un itinéraire</Button></div>
          )}
          {it && <Button variant="outline" className="mt-2 !min-h-9" onClick={() => nav('/notebook')}><BookOpen size={16} />Carnet de voyage</Button>}
        </Accordion>

        <Accordion title="Mes sauvegardes" id="saved" right={<Badge tone="orange">{user.like.length}</Badge>}>
          <div className="scroll-area mb-3 flex gap-2 overflow-x-auto">{FILTERS.map(([k, l]) => <Chip key={k} active={f === k} onClick={() => setF(k)} className="!py-1">{l}</Chip>)}</div>
          <div className="flex flex-col gap-2.5">
            {saved.map((i) => <ItemCard key={i!.id} item={i!} />)}
            {saved.length === 0 && <p className="t-body text-anthracite/70">Aucune sauvegarde pour le moment. Touchez le cœur sur une fiche pour l'ajouter.</p>}
          </div>
        </Accordion>

        <Accordion title="Mes activités inscrites" right={<Badge>{activities.length}</Badge>}>
          {activities.length === 0 ? <p className="t-body text-anthracite/70">Aucune inscription. Retrouvez les invitations de vos amis dans Communauté.</p> : (
            <ul className="flex flex-col gap-2">{activities.map((a) => <li key={a.id}><p className="t-card text-brun">{a.name}</p><p className="t-caption text-anthracite/70">Proposée par {a.offered_by} · {fmtDay(parseISO(a.date))} · {a.subscriptions} inscrits</p></li>)}</ul>
          )}
        </Accordion>

        <Accordion title="Trophées et récompenses">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange/10 text-orange"><Trophy size={18} /></span><div><p className="t-card text-brun">Bienvenue à bord</p><p className="t-caption text-anthracite/70">Profil voyageur complété</p></div></div>
            <div className="flex items-center gap-3 opacity-50"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-line text-anthracite"><Award size={18} /></span><div><p className="t-card text-brun">Premier itinéraire</p><p className="t-caption text-anthracite/70">Verrouillé</p></div></div>
          </div>
        </Accordion>

        <Accordion title="Mon réseau" right={<Badge>{friends.length} amis</Badge>}>
          <ul className="flex flex-col gap-2.5">
            {friends.map((x) => <li key={x.id} className="flex items-center gap-3"><span className="t-card flex h-8 w-8 items-center justify-center rounded-full bg-rose text-white">{x.name[0]}</span><span className="t-body-m flex-1 text-brun">{x.name}</span><span className="t-caption text-anthracite/60">{x.status}</span></li>)}
          </ul>
          <Button variant="outline" className="mt-3 !min-h-9" onClick={() => showToast('Gestion des collaborations : fonctionnalité simulée')}>Gérer les collaborations</Button>
        </Accordion>
      </div>
    </div>
  );
}
