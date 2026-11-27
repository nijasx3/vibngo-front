import { useNavigate } from 'react-router-dom';
import { Button, Empty, Header, ListRow, SectionTitle } from '../components/ui';
import { placeById, rome } from '../api/mockApi';
import { useStore } from '../state/store';

export default function Saved() {
  const nav = useNavigate();
  const user = useStore((s) => s.user)!;
  const places = user.like.map(placeById).filter(Boolean) as NonNullable<ReturnType<typeof placeById>>[];
  const dest = user.like.includes('dest-rome');
  const posts = user.like.includes('post-marie');
  const none = places.length === 0 && !dest && !posts;
  return (
    <>
      <Header title="Mes sauvegardes" />
      {none && <Empty title="Aucune sauvegarde" text="Enregistre un lieu, une activité ou une publication pour la retrouver ici."><Button onClick={() => nav('/explore')}>Explorer</Button></Empty>}
      {!none && <div className="flex flex-col gap-5 px-5 pb-6">
        <section><SectionTitle>Lieux et destinations</SectionTitle>
          <div className="flex flex-col gap-2">
            {places.map((p) => <ListRow key={p.id} testId={`saved-${p.id}`} src={p.image} title={p.name} sub={`${p.typeLabel} · Rome`} onClick={() => nav(`/place/${p.id}`)} />)}
            {dest && <ListRow testId="saved-dest-rome" src={rome.image} title="Rome, Italie" sub="Destination · Italie" onClick={() => nav('/destination/rome')} />}
          </div></section>
        {posts && <section><SectionTitle>Publications</SectionTitle><div className="rounded-lg bg-white p-3"><div className="t-h3 text-[14px]">Patagonie · J−4 · Trekking W</div><div className="t-small text-muted">Vue incroyable depuis le mirador</div></div></section>}
      </div>}
    </>
  );
}
