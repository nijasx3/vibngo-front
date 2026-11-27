import { useNavigate } from 'react-router-dom';
import { Button, Logo, img } from '../components/ui';

export default function Welcome() {
  const nav = useNavigate();
  return (
    <div className="flex min-h-0 flex-1 flex-col px-5 pb-6 pt-4">
      <Logo className="shrink-0" />
      <div className="relative mt-5 min-h-[110px] flex-1 overflow-hidden rounded-xl">
        <img src={img('welcome.jpg')} alt="Un avion dans un ciel bleu" className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <div className="mb-5 mt-5 shrink-0 text-center">
        <h1 className="t-title text-[28px]">Bienvenue sur Vibngo</h1>
        <p className="t-body mx-auto mt-3 max-w-[290px] text-[15px] text-muted">Découvre des destinations qui te ressemblent et prépare ton prochain voyage.</p>
      </div>
      <Button className="shrink-0" onClick={() => nav('/signup')}>Créer un compte</Button>
      <button onClick={() => nav('/signup?mode=login')} className="mt-4 shrink-0 text-center text-[14px] font-bold">Se connecter</button>
    </div>
  );
}
