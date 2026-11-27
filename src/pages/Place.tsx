import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Bookmark, Share2, Star } from 'lucide-react';
import { Avatar, Button, Header, Photo, SectionTitle, Sheet, Stars, Tabs, cx } from '../components/ui';
import { eventById, placeById, profileById } from '../api/mockApi';
import { useStore } from '../state/store';
import { addDays, monthAbbr, today } from '../lib/dates';
import { addStop, dayIndex, uid } from '../lib/itinerary';

const TABS = ['Infos', 'Photos', 'Avis', 'Événements'];
const fmtN = (n: number) => n.toLocaleString('fr-FR').replace(/ /g, ' ');

export default function Place() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const place = placeById(id);
  const { user, toggleLike, reviews, addReview, showToast, updateItinerary } = useStore();
  const [tab, setTab] = useState('Infos');
  const [writing, setWriting] = useState(false);
  const [stars, setStars] = useState(5);
  const [text, setText] = useState('');
  if (!place) return <Navigate to="/explore" replace />;
  const liked = !!user?.like.includes(place.id);
  const mine = reviews[place.id] ?? [];
  const all = [...mine, ...place.reviewsList];
  const hotel = place.kind === 'hotel';
  const profile = profileById(user?.traveler_type ?? null);

  const addToTrip = () => {
    const it = user?.current_itinerary;
    if (!it) return showToast('Crée d’abord un voyage pour y ajouter ce lieu.');
    const di = Math.min(Math.max(dayIndex(it), 0), it.days.length - 1);
    updateItinerary((x) => addStop(x, di, { id: uid(), time: '17:00', title: place.name, sub: `${place.typeLabel} · Rome` }));
    showToast(`${place.name} ajouté à ton programme`);
  };
  const publish = () => {
    if (!text.trim()) return;
    addReview(place.id, { who: user?.name ?? 'Moi', role: profile?.name.split(' ')[0] ?? 'Voyageur', stars, text: text.trim() });
    setText(''); setStars(5); setWriting(false); setTab('Avis');
    showToast('Ton avis est publié');
  };

  return (
    <>
      <Header lead={hotel ? 'HÉBERGEMENT' : 'LIEU À EXPLORER'} right={<div className="flex gap-1">
        <button aria-label="Partager" onClick={() => showToast('Lien copié (simulation)')} className="p-2"><Share2 size={20} /></button>
        <button aria-label={liked ? 'Retirer des sauvegardes' : 'Sauvegarder'} aria-pressed={liked} data-testid="like" onClick={() => { toggleLike(place.id); showToast(liked ? 'Retiré de tes sauvegardes' : 'Ajouté à tes sauvegardes'); }} className="p-2">
          <Bookmark size={20} className={liked ? 'text-orange' : ''} fill={liked ? 'currentColor' : 'none'} />
        </button></div>} />
      <div className="px-5">
        <Photo src={place.hero} className="h-[170px] w-full rounded-xl" />
        <h1 data-testid="place-title" className="t-title mt-4 text-[30px]">{place.name}</h1>
        <p className="t-body mt-1 text-muted">{place.address}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="t-small flex items-center gap-1 text-[13px] font-bold"><Star size={13} fill="currentColor" />{String(place.rating).replace('.', ',')} · {fmtN(place.reviews)} avis{hotel && place.priceLabel ? ` · ${place.priceLabel}` : ''}</span>
          {place.recommended && <span className="rounded-md bg-sable px-3 py-1.5 text-[11px] font-bold">Recommandé pour vous</span>}
        </div>
      </div>
      <div className="mt-4"><Tabs items={TABS} value={tab} onChange={setTab} /></div>

      <div className="flex-1 px-5 pb-4 pt-4">
        {tab === 'Infos' && <>
          <div className="rounded-lg bg-sable p-4"><h2 className="t-h3">Infos pratiques</h2>{place.infos.map((l) => <p key={l} className="t-body mt-1 text-muted">{l}</p>)}</div>
          {place.partner && <p className="t-small mt-3 rounded-lg border-l-[3px] border-orange bg-sable px-3 py-2">{place.partner}</p>}
          {place.photos.length > 0 && <section className="mt-6"><SectionTitle action="Tout voir" onAction={() => setTab('Photos')}>Photos communauté</SectionTitle>
            <div className="scroll-area -mx-5 flex shrink-0 gap-2 overflow-x-auto px-5">{place.photos.map((p) => <Photo key={p} src={p} className="h-[70px] w-[84px] shrink-0 rounded-md" />)}</div></section>}
          <section className="mt-6"><SectionTitle action="Tout voir" onAction={() => setTab('Avis')}>Avis voyageurs</SectionTitle>
            {all[0] ? <div className="flex items-start gap-2"><Avatar size={28} initials={all[0].who.slice(0, 1)} tone="sable" /><div className="flex-1"><div className="t-small font-bold">{all[0].who} · {all[0].role}</div><div className="t-small text-muted">« {all[0].text} »</div></div><Stars value={all[0].stars} size={11} /></div>
              : <p className="t-body text-muted">Aucun avis pour le moment.</p>}
            {place.google && <div className="mt-3 rounded-lg bg-sable px-3 py-2"><div className="t-small font-bold">Avis Google · {place.google.rating} ★ ({place.google.count})</div><div className="t-small text-muted">« {place.google.quote} »</div></div>}</section>
        </>}

        {tab === 'Photos' && (place.photos.length
          ? <><h2 className="t-section mb-3">Photos · {place.name}</h2><div className="grid grid-cols-2 gap-2">{place.photos.map((p) => <Photo key={p} src={p} className="h-32 w-full rounded-lg" />)}</div></>
          : <p className="t-body text-muted">Aucune photo pour le moment.</p>)}

        {tab === 'Avis' && <>
          <div className="rounded-lg bg-sable p-4"><div className="flex items-baseline gap-2"><span className="text-[28px] font-bold">{String(place.rating).replace('.', ',')}</span><Stars value={Math.round(place.rating)} /></div><p className="t-small text-muted">{fmtN(place.reviews + mine.length)} avis de la communauté</p></div>
          <h2 className="t-section mb-2 mt-5">Avis récents</h2>
          {all.length === 0 && <p className="t-body text-muted">Sois le premier à donner ton avis.</p>}
          <ul className="flex flex-col gap-3">{all.map((r, i) => <li key={i} data-testid="review" className="border-b border-trait pb-3"><div className="flex items-center justify-between"><span className="t-small font-bold">{r.who} · {r.role}</span><Stars value={r.stars} size={12} /></div><p className="t-body mt-1 text-muted">« {r.text} »</p></li>)}</ul>
          {place.google && <p className="t-small mt-3 rounded-lg bg-sable px-3 py-2"><b>Avis Google · {place.google.rating} ★ ({place.google.count})</b><br />« {place.google.quote} »</p>}
          <div className="mt-4"><Button variant="secondary" onClick={() => setWriting(true)}>Écrire un avis</Button></div>
        </>}

        {tab === 'Événements' && (place.eventIds.length
          ? <ul className="flex flex-col gap-2">{place.eventIds.map((eid) => { const e = eventById(eid)!; const d = addDays(today(), e.dayOffset); return (
              <li key={eid}><button onClick={() => nav(`/event/${eid}`)} className="flex w-full items-center gap-3 rounded-lg bg-white p-3 text-left"><span className="flex w-11 flex-col items-center rounded-md bg-sable py-1.5"><span className="text-[17px] font-bold leading-none">{String(d.getDate()).padStart(2, '0')}</span><span className="text-[9px] font-bold text-orange">{monthAbbr(d)}</span></span><span><span className="t-h3 block text-[15px]">{e.title}</span><span className="t-small text-muted">{e.city} · {e.hour}</span></span></button></li>); })}</ul>
          : <p className="t-body text-muted">Aucun événement prévu pour ce lieu.</p>)}
      </div>

      <div className="flex flex-col gap-2 px-5 pb-4">
        {hotel
          ? <Button variant="orange" onClick={() => showToast('Réservation non disponible dans le prototype')}>Voir l’offre</Button>
          : <>
            <Button variant="light" stripe={false} className={cx('min-h-11 text-[14px]')} onClick={addToTrip}>Ajouter à un itinéraire</Button>
            <div className="grid grid-cols-2 gap-2"><Button variant="orange" className="min-h-11 text-[14px]" onClick={() => showToast('Réservation non disponible dans le prototype')}>Réserver la visite</Button><Button variant="light" stripe={false} className="min-h-11 text-[14px]" onClick={() => showToast('Création d’événement : bientôt disponible')}>Créer un événement</Button></div>
          </>}
      </div>

      <Sheet open={writing} onClose={() => setWriting(false)} title="Écrire un avis">
        <p className="t-small -mt-2 mb-3 text-muted">{place.name}</p>
        <h3 className="t-label mb-1">Note</h3>
        <div className="mb-3 flex gap-1">{[1, 2, 3, 4, 5].map((n) => <button key={n} aria-label={`${n} étoile${n > 1 ? 's' : ''}`} aria-pressed={n <= stars} onClick={() => setStars(n)} className="p-1 text-orange"><Star size={26} fill={n <= stars ? 'currentColor' : 'none'} /></button>)}</div>
        <label className="block rounded-lg bg-sable px-4 py-3"><span className="t-label block">Ton avis</span><textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="Partage ton expérience…" aria-label="Ton avis" className="t-body mt-1 w-full resize-none bg-transparent focus:outline-none" /></label>
        <div className="mt-4"><Button disabled={!text.trim()} onClick={publish}>Publier</Button></div>
      </Sheet>
    </>
  );
}
