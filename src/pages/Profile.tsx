import { useNavigate } from 'react-router-dom';
import { Bookmark, ChevronRight, Pencil, Settings, Users } from 'lucide-react';
import { Avatar, SectionTitle, TopBar } from '../components/ui';
import { profileById } from '../api/mockApi';
import { useStore } from '../state/store';
import { dayIndex } from '../lib/itinerary';
import { fmtDayMonth, fmtRange, parseISO } from '../lib/dates';

export default function Profile() {
  const nav = useNavigate();
  const { user, activities } = useStore();
  if (!user) return null;
  const profile = profileById(user.traveler_type);
  const it = user.current_itinerary;
  const full = `${user.name} ${user.lastName}`.trim();
  const initials = (user.name.slice(0, 1) + (user.lastName.slice(0, 1) || user.name.slice(1, 2))).toUpperCase();
  const status = it ? (dayIndex(it) >= 0 ? 'En cours' : 'À venir') : '';
  return (
    <>
      <TopBar />
      <div className="flex items-center justify-between px-5 pb-2 pt-2"><h1 className="t-title text-[28px]">Mon profil</h1><button aria-label="Paramètres" data-testid="open-settings" onClick={() => nav('/settings')} className="p-2"><Settings size={22} /></button></div>
      <div className="px-5 pb-6">
        <div className="flex items-center gap-4 rounded-xl bg-brun p-5 text-white">
          <span className="relative"><Avatar initials={initials} size={64} /><button aria-label="Modifier mon profil" onClick={() => nav('/profile/edit')} className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-brun bg-white text-brun"><Pencil size={13} /></button></span>
          <div><div className="t-micro text-white/70">Profil voyageur</div><div data-testid="profile-user" className="t-section text-[24px]">{full}</div><div data-testid="profile-type" className="t-small text-[13px] text-white/90">{profile?.name ?? 'Nouveau voyageur'}</div></div>
        </div>
        <div className="mt-4 grid grid-cols-3 divide-x divide-trait text-center">
          {[[it ? 1 : 0, 'Voyages'], [activities.length, 'Activités'], [0, 'Trophées']].map(([n, l]) => <div key={l as string} className="py-2"><div data-testid={`stat-${l}`} className="text-[28px] font-bold leading-none">{n}</div><div className="t-small mt-1 text-muted">{l}</div></div>)}
        </div>

        <section className="mt-6"><SectionTitle action="Tout voir" onAction={() => nav('/soon?page=trophees')}>Trophées</SectionTitle><p className="t-body text-muted">Aucun trophée débloqué pour le moment.</p></section>

        <section className="mt-6"><SectionTitle action="Tout voir" onAction={() => nav('/trips')}>Mes voyages</SectionTitle>
          {it
            ? <button data-testid="my-trip" onClick={() => nav('/trip')} className="flex w-full items-center justify-between rounded-lg bg-brun p-4 text-left text-white"><span><span className="t-h3 block text-[20px]">{it.destination.split(',')[0]}</span><span className="t-small text-white/85">{fmtRange(parseISO(it.startDate), parseISO(it.endDate))}</span></span><span className="rounded bg-orange px-2.5 py-1 text-[11px] font-bold">{status}</span></button>
            : <p className="t-body text-muted">Aucun voyage enregistré.</p>}
        </section>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button onClick={() => nav('/saved')} className="rounded-lg bg-sable p-3 text-left"><Bookmark size={18} /><div className="t-h3 mt-2 text-[14px]">Mes sauvegardes</div><div data-testid="saved-count" className="t-small text-muted">{user.like.length} élément{user.like.length > 1 ? 's' : ''}</div></button>
          <button onClick={() => nav('/network')} className="rounded-lg bg-sable p-3 text-left"><Users size={18} /><div className="t-h3 mt-2 text-[14px]">Mon réseau</div><div className="t-small text-muted">{user.friends.length} ami{user.friends.length > 1 ? 's' : ''}</div></button>
        </div>
        {activities.length > 0 && <section className="mt-6"><SectionTitle>Mes activités</SectionTitle>
          <ul data-testid="my-activities" className="flex flex-col gap-2">{activities.map((a) => <li key={a.id} className="flex items-center justify-between rounded-lg bg-sable px-4 py-3"><span><span className="t-h3 block text-[14px]">{a.name}</span><span className="t-small text-muted">Proposée par {a.offered_by} · {fmtDayMonth(parseISO(a.date))} · {a.subscriptions} inscrits</span></span><ChevronRight size={16} /></li>)}</ul></section>}
      </div>
    </>
  );
}
