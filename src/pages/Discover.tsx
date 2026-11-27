import { useNavigate } from 'react-router-dom';
import { Button, Header, TopBar } from '../components/ui';

const BLOCKS = [
  ['Explorer', 'Trouve des lieux, des activités, des voyageurs et des événements.'],
  ['+ Créer', 'Demande un itinéraire à Vibi ou compose ton propre programme.'],
  ['Communauté', 'Retrouve les publications et les avis des vibers.'],
  ['Profil', 'Retrouve tes voyages, tes sauvegardes et tes trophées.'],
];
export default function Discover() {
  const nav = useNavigate();
  return (
    <>
      <TopBar />
      <Header title="Découvrir Vibngo" onBack={() => nav('/home')} />
      <div className="flex flex-1 flex-col gap-3 px-5 pb-6">
        {BLOCKS.map(([t, d]) => <div key={t} className="rounded-lg border-l-[3px] border-orange bg-sable px-4 py-4"><h2 className="t-h3 text-[18px]">{t}</h2><p className="t-body mt-1 text-muted">{d}</p></div>)}
        <div className="flex-1" />
        <Button onClick={() => nav('/home')}>Accéder à l’accueil</Button>
      </div>
    </>
  );
}
