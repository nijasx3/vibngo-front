import { useNavigate } from 'react-router-dom';
import { Avatar, Button, Empty, Header } from '../components/ui';
import { communityData } from '../api/mockApi';
import { useStore } from '../state/store';

export default function Network() {
  const nav = useNavigate();
  const user = useStore((s) => s.user)!;
  const list = communityData.friends.filter((f) => user.friends.includes(f.id));
  return (
    <>
      <Header title="Mon réseau" />
      {list.length === 0
        ? <Empty title="Aucun viber ajouté" text="Découvre des vibers et ajoute-les pour échanger."><Button onClick={() => nav('/explore?tab=Utilisateurs')}>Découvrir des vibers</Button></Empty>
        : <div className="px-5 pb-6"><h2 className="t-section mb-3">Vibers ajoutés</h2>
            <ul className="flex flex-col gap-2">{list.map((f) => <li key={f.id} className="flex items-center gap-3 rounded-lg bg-white p-3"><Avatar initials={f.initials} size={40} /><div><div className="t-h3 text-[15px]">{f.name}</div><div className="t-small text-muted">{f.sub}</div></div></li>)}</ul>
            <div className="mt-5"><Button variant="secondary" onClick={() => nav('/explore?tab=Utilisateurs')}>Découvrir des vibers</Button></div></div>}
    </>
  );
}
