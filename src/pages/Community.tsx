import { useState } from 'react';
import { Bookmark, Heart, Link2, MessageCircle, Plus, Star } from 'lucide-react';
import { Avatar, Stars, TopBar, cx } from '../components/ui';
import { communityData } from '../api/mockApi';
import { useStore } from '../state/store';
import { addDays, fmtDayMonth, today } from '../lib/dates';

export default function Community() {
  const { user, activities, maybe, joinInvitation, leaveInvitation, setMaybe, toggleLike, showToast } = useStore();
  const inv = communityData.invitation;
  const post = communityData.post;
  const joined = activities.some((a) => a.id === inv.id);
  const seats = inv.seats - (joined ? 1 : 0);
  const [likedPost, setLikedPost] = useState(false);
  const [comments, setComments] = useState<{ who: string; text: string }[]>([communityData.invitation.comment]);
  const [draft, setDraft] = useState('');
  const saved = !!user?.like.includes(post.id);
  const initials = (user?.name ?? 'M').slice(0, 2).toUpperCase();

  const addComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setComments((c) => [...c, { who: initials, text: draft.trim() }]);
    setDraft('');
  };

  return (
    <>
      <TopBar />
      <div className="px-5 pb-2 pt-2"><h1 className="t-title text-[28px]">Communauté</h1></div>
      <div className="scroll-area flex shrink-0 gap-4 overflow-x-auto px-5 pb-3">
        {communityData.stories.map((s) => (
          <div key={s.id} className="flex shrink-0 flex-col items-center gap-1">
            {s.id === 'me'
              ? <button aria-label="Ajouter une story" onClick={() => showToast('Stories : bientôt disponible')} className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-orange text-orange"><Plus size={22} /></button>
              : <Avatar initials={s.name.slice(0, 1) + (s.id === 'lucas' ? 'M' : '')} size={56} tone="sable" />}
            <span className="t-small">{s.name}</span>
          </div>
        ))}
      </div>
      <div className="flex items-baseline justify-between px-5 pt-2"><h2 className="t-small text-[13px] font-bold">Fil de voyage</h2><button onClick={() => showToast('Publier : bientôt disponible')} className="text-[13px] font-bold">Publier</button></div>

      <div className="flex flex-col gap-5 px-5 pb-6 pt-3">
        <article>
          <div className="flex items-center gap-3"><Avatar initials={post.initials} size={36} /><div><div className="t-h3 text-[15px]">{post.author}</div><div className="t-small text-muted">{post.role} · {post.when} · {post.where}</div></div></div>
          <div className="mt-3 overflow-hidden rounded-xl"><img src={`${import.meta.env.BASE_URL}img/${post.image}`} alt="" className="h-[80px] w-full object-cover" /><div className="bg-brun px-4 py-3 text-white"><div className="text-[17px] font-bold">{post.title}</div><div className="t-small text-white/85">{post.text}</div></div></div>
          <div className="mt-3 flex items-center gap-4 text-[13px]">
            <button onClick={() => setLikedPost(!likedPost)} aria-pressed={likedPost} className="flex items-center gap-1.5"><Heart size={19} className={likedPost ? 'text-orange' : ''} fill={likedPost ? 'currentColor' : 'none'} />{post.likes + (likedPost ? 1 : 0)}</button>
            <span className="flex items-center gap-1.5"><MessageCircle size={19} />{post.comments}</span>
            <button aria-label="Copier le lien" onClick={() => showToast('Lien copié (simulation)')}><Link2 size={19} /></button>
            <div className="flex-1" />
            <button aria-label={saved ? 'Retirer des sauvegardes' : 'Sauvegarder la publication'} aria-pressed={saved} onClick={() => { toggleLike(post.id); showToast(saved ? 'Retiré de tes sauvegardes' : 'Publication sauvegardée'); }}><Bookmark size={19} className={saved ? 'text-orange' : ''} fill={saved ? 'currentColor' : 'none'} /></button>
          </div>
        </article>

        <article data-testid="invitation">
          <div className="flex items-center gap-3"><Avatar initials={inv.initials} size={36} tone="sable" /><div><div className="t-h3 text-[15px]">{inv.author}</div><div className="t-small text-muted">{inv.role} · {inv.when}</div></div></div>
          <div className="mt-3 rounded-lg border-l-[3px] border-orange bg-sable p-4">
            <div className="t-micro text-muted">Invitation / <span data-testid="seats">{seats}</span> places dispo</div>
            <h2 className="t-section mt-1 text-[22px]">{inv.name}</h2>
            <p className="t-h3 mt-1 text-[14px]">{inv.city} · {fmtDayMonth(addDays(today(), inv.dayOffset))} · {inv.time}</p>
            <p className="t-small mt-1 italic text-muted">« {inv.message} »</p>
            {joined
              ? <div className="mt-3"><div data-testid="joined" className="rounded-md bg-vert py-2.5 text-center text-[13px] font-bold">Inscrit · {activities.find((a) => a.id === inv.id)?.subscriptions} participants</div>
                <button onClick={leaveInvitation} className="mt-2 w-full text-center text-[12px] font-bold underline">Se désinscrire</button></div>
              : <div className="mt-3 grid grid-cols-2 gap-2">
                  <button data-testid="join" onClick={() => { joinInvitation(); showToast('Tu participes à « ' + inv.name + ' »'); }} className="min-h-10 rounded-md bg-orange text-[13px] font-bold text-white">Je participe</button>
                  <button onClick={() => { setMaybe(!maybe); showToast(maybe ? 'Réponse retirée' : 'Noté : peut-être'); }} aria-pressed={maybe} className={cx('min-h-10 rounded-md text-[13px] font-bold', maybe ? 'bg-brun text-white' : 'bg-white')}>Peut-être</button>
                </div>}
          </div>
          <ul className="mt-2 flex flex-col gap-1.5">{comments.map((c, i) => <li key={i} className="flex items-center gap-2"><Avatar initials={c.who} size={24} /><span className="t-small flex-1 rounded-md bg-sable px-3 py-1.5">{c.text}</span></li>)}</ul>
          <form onSubmit={addComment} className="mt-2"><input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ajouter un commentaire…" aria-label="Ajouter un commentaire" className="t-small w-full rounded-md bg-sable px-3 py-2.5 focus:outline-none" /></form>
        </article>

        <article className="rounded-lg bg-white p-4 shadow-[0_1px_0_rgba(90,46,31,.08)]">
          <div className="flex items-center gap-3"><Avatar initials={communityData.review.initials} size={32} /><div className="t-h3 text-[15px]">{communityData.review.author} a noté une activité</div></div>
          <div className="mt-2 flex items-center gap-1"><Stars value={communityData.review.stars} /></div>
          <p className="t-body mt-1">{communityData.review.text}</p>
          <p className="t-small mt-1 flex items-center gap-1 text-muted"><Star size={11} />{communityData.review.tag}</p>
        </article>
      </div>
    </>
  );
}
