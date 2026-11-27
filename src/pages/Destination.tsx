import { useNavigate } from 'react-router-dom';
import { Bookmark, Landmark, Utensils, Palette } from 'lucide-react';
import { Button, Header, PhotoCard, Photo, SectionTitle, cx } from '../components/ui';
import { profileById, rome } from '../api/mockApi';
import { useStore } from '../state/store';

const TONES = ['bg-orange text-white', 'bg-[#dd8b8b] text-white', 'bg-sable text-brun'];
const ICONS = [Landmark, Palette, Utensils];

export default function Destination() {
  const nav = useNavigate();
  const { user, toggleLike, showToast } = useStore();
  const liked = !!user?.like.includes('dest-rome');
  const profile = profileById(user?.traveler_type ?? null);
  return (
    <>
      <Header lead="DESTINATION" right={<button aria-label={liked ? 'Retirer des sauvegardes' : 'Sauvegarder'} aria-pressed={liked} onClick={() => { toggleLike('dest-rome'); showToast(liked ? 'Retiré de tes sauvegardes' : 'Ajouté à tes sauvegardes'); }} className="p-2"><Bookmark size={20} className={liked ? 'text-orange' : ''} fill={liked ? 'currentColor' : 'none'} /></button>} />
      <div className="px-5">
        <PhotoCard src={rome.image} title={rome.title} sub={`${rome.weather} · ${rome.note}`} height="h-[150px]" />
        <div className="mt-4 grid grid-cols-3 divide-x divide-trait text-center">
          <button onClick={() => nav('/explore?q=Rome&tab=Activités')} className="py-2"><div className="text-[26px] font-bold">{rome.stats.activites}</div><div className="t-small text-muted">Activités</div></button>
          <button data-testid="hotels-stat" onClick={() => nav('/explore?q=Rome&tab=Lieux&type=Hébergements')} className="py-2"><div className="text-[26px] font-bold">{rome.stats.hotels}</div><div className="t-small text-muted">Hôtels</div></button>
          <div className="py-2"><div className="text-[26px] font-bold">{rome.stats.note} ★</div><div className="t-small text-muted">Note communauté</div></div>
        </div>

        <section className="mt-5"><SectionTitle>Pour ton profil {profile ? profile.name.split(' ')[0] : ''}</SectionTitle>
          <div className="grid grid-cols-3 gap-2">{rome.forProfile.map((c, i) => { const I = ICONS[i]; return (
            <div key={c.label} className={cx('rounded-lg px-3 py-3', TONES[i])}><I size={18} /><div className="mt-3 text-[13px] font-bold">{c.label}</div><div className="text-[10px] opacity-90">{c.count}</div></div>); })}</div></section>

        <section className="mt-6"><SectionTitle>Tendances sur les réseaux</SectionTitle>
          <div className="flex flex-col gap-3">{rome.trends.map((t) => (
            <div key={t.name} className="flex items-center gap-3"><Photo src={t.image} className="h-12 w-14 rounded-md" /><div className="min-w-0 flex-1"><div className="t-h3 text-[15px]">{t.name}</div><div className="t-small text-muted">{t.source}</div></div>
              <button onClick={() => nav(`/place/${t.placeId}`)} className="rounded-md bg-sable px-3 py-2 text-[12px] font-bold">Explorer</button></div>))}</div></section>

        <section className="mt-6"><SectionTitle>Partenaires à Rome</SectionTitle>
          <div className="grid grid-cols-2 gap-2">{rome.partners.map((p) => (
            <div key={p.name} className="rounded-lg bg-sable p-3"><div className="t-h3 text-[14px]">{p.name}</div><div className="t-small text-muted">{p.sub}</div>
              <button onClick={() => (p.placeId ? nav(`/place/${p.placeId}`) : showToast('Réservation non disponible dans le prototype'))} className="mt-3 text-[12px] font-bold">Voir l’offre ↗</button></div>))}</div>
          <p className="t-small mt-3 rounded-lg border-l-[3px] border-orange bg-sable px-3 py-2"><b>Alerte locale</b> &nbsp; {rome.alert}</p></section>
      </div>
      <div className="flex-1" />
      <div className="px-5 pb-4 pt-5"><Button variant="orange" data-testid="create-from-destination" onClick={() => nav('/create')}>Créer un itinéraire</Button></div>
    </>
  );
}
