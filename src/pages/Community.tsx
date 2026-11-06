import { Check, Heart, MessageCircle, MoreHorizontal, Plus } from 'lucide-react';
import TopBar from '../components/TopBar';
import { Button, Card, Visual, cx } from '../components/ui';
import { community_ } from '../api/mockApi';
import { useStore } from '../state/store';
import { addDays, fmtLong, today } from '../lib/dates';

const Avatar = ({ name, size = 40, ring }: { name: string; size?: number; ring?: boolean }) => (
  <span style={{ width: size, height: size }} className={cx('t-card flex shrink-0 items-center justify-center rounded-full bg-rose text-white', ring && 'ring-2 ring-orange ring-offset-2 ring-offset-creme')}>{name[0]}</span>
);

export default function Community() {
  const { user, joined, offered, join, leave, showToast } = useStore();
  const stories = [{ name: user?.name ?? 'Moi', label: 'Moi' }, ...community_.friends.map((f) => ({ name: f.name, label: f.name }))];
  const a = community_.offeredActivities[0];
  const isJoined = joined.includes(a.id);
  const date = addDays(today(), a.dayOffset);
  const count = offered[a.id] ?? a.subscriptions;
  const evt = community_.publicEvent;

  return (
    <div className="fade-up">
      <TopBar title="Communauté" />
      <div className="flex flex-col gap-4 pb-4">
        <div className="scroll-area flex gap-4 overflow-x-auto px-4" aria-label="Amis">
          {stories.map((s, i) => (
            <button key={s.label + i} onClick={() => showToast(i === 0 ? 'Ajouter une story : fonctionnalité simulée' : `Story de ${s.name} : fonctionnalité simulée`)} className="flex w-14 shrink-0 flex-col items-center gap-1">
              <Avatar name={s.name} size={52} ring={i > 0} />
              <span className="t-caption truncate text-anthracite/80">{s.label}</span>
            </button>
          ))}
        </div>

        <div className="mx-4 flex items-center gap-2">
          <Avatar name={user?.name ?? '?'} size={36} />
          <button onClick={() => showToast('Publication : fonctionnalité simulée')} className="t-body-m flex min-h-11 flex-1 items-center rounded-full border border-line bg-white px-4 text-left text-anthracite/50">Partagez une activité…</button>
          <button aria-label="Inviter des amis" onClick={() => showToast('Invitation d\'amis : fonctionnalité simulée')} className="flex h-11 w-11 items-center justify-center rounded-full bg-orange text-white"><Plus size={20} /></button>
        </div>

        {/* Invitation de Paul : parcours 5 */}
        <article className="mx-4 overflow-hidden rounded-2xl border border-line bg-white" data-testid="paul-invitation">
          <div className="flex items-center gap-3 p-3">
            <Avatar name={a.offered_by} size={36} />
            <div className="flex-1"><p className="t-card text-brun">{a.offered_by}</p><p className="t-caption text-anthracite/60">il y a 1 h · {a.place}</p></div>
            <MoreHorizontal size={18} className="text-anthracite/50" />
          </div>
          <p className="t-body px-3 pb-3 text-anthracite/90">{a.message}</p>
          <div className="border-t border-line bg-orange/5 p-3">
            <p className="t-section text-brun">Invitation : {a.name}</p>
            <p className="t-body mt-0.5 text-anthracite/80">{fmtLong(date)} à {a.time} · {a.place}</p>
            <p className="t-caption mt-1 font-semibold text-orange-dark" data-testid="subscriptions">{count} inscrit{count > 1 ? 's' : ''}</p>
            <div className="mt-3 flex gap-2">
              {isJoined ? (
                <>
                  <Button full variant="outline" disabled className="!opacity-100 !border-orange !text-orange"><Check size={16} />Vous participez</Button>
                  <Button variant="ghost" onClick={() => { leave(a.id); showToast('Participation annulée'); }}>Annuler</Button>
                </>
              ) : (
                <>
                  <Button full onClick={() => { join(a.id); showToast(`Inscription confirmée : ${a.name}`); }}>Je participe</Button>
                  <Button variant="outline" onClick={() => showToast('Noté : vous répondrez plus tard')}>Peut-être</Button>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 border-t border-line px-3 py-2"><span className="t-caption flex items-center gap-1 text-anthracite/70"><Heart size={14} />6</span><span className="t-caption flex items-center gap-1 text-anthracite/70"><MessageCircle size={14} />2</span></div>
        </article>

        {community_.posts.map((p) => (
          <article key={p.id} className="mx-4 overflow-hidden rounded-2xl border border-line bg-white">
            <div className="flex items-center gap-3 p-3"><Avatar name={p.author} size={36} /><div className="flex-1"><p className="t-card text-brun">{p.author}</p><p className="t-caption text-anthracite/60">{p.when}</p></div></div>
            <Visual tone={p.author === 'Marie' ? 'rose' : 'brun'} className="h-32" label="Photo" />
            <p className="t-body p-3 text-anthracite/90">{p.text}</p>
            <div className="flex items-center gap-4 border-t border-line px-3 py-2"><span className="t-caption flex items-center gap-1 text-anthracite/70"><Heart size={14} />{p.likes}</span><span className="t-caption flex items-center gap-1 text-anthracite/70"><MessageCircle size={14} />{p.comments}</span></div>
          </article>
        ))}

        <Card className="mx-4 !bg-creme !border-orange/30">
          <p className="t-section text-brun">Événement public</p>
          <p className="t-card mt-1 text-brun">{evt.title}</p>
          <p className="t-body text-anthracite/80">{fmtLong(addDays(today(), evt.dayOffset))} à {evt.time} · {evt.where}</p>
          <Button className="mt-2 !min-h-9" onClick={() => showToast('Inscription à l\'événement : fonctionnalité simulée')}>Rejoindre</Button>
        </Card>
      </div>
    </div>
  );
}
