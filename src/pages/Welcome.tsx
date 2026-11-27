import { useNavigate } from 'react-router-dom';
import { Button, Logo, img } from '../components/ui';

export default function Welcome() {
  const nav = useNavigate();
  return (
    <div className="flex flex-1 flex-col px-5 pb-6 pt-4">
      <Logo />
      <img src={img('welcome.jpg')} alt="Un avion dans un ciel bleu" className="mt-6 min-h-[260px] w-full flex-1 rounded-xl object-cover" />
      <div className="mb-6 mt-6 shrink-0 text-center">
        <h1 className="t-title text-[28px]">Bienvenue sur Vibngo</h1>
        <p className="t-body mx-auto mt-3 max-w-[290px] text-[15px] text-muted">Découvre des destinations qui te ressemblent et prépare ton prochain voyage.</p>
      </div>
      <Button onClick={() => nav('/signup')}>Créer un compte</Button>
      <button onClick={() => nav('/signup?mode=login')} className="mt-4 text-center text-[14px] font-bold">Se connecter</button>
    </div>
  );
}
