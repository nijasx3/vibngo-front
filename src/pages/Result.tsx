import { useNavigate } from 'react-router-dom';
import { Compass, Sparkles } from 'lucide-react';
import { Button, Visual } from '../components/ui';
import { PROFILES } from '../lib/scoring';
import { useStore } from '../state/store';

export default function Result() {
  const nav = useNavigate();
  const user = useStore((s) => s.user);
  const profile = PROFILES.find((p) => p.id === user?.traveler_type);
  if (!profile) return null;
  return (
    <div className="flex min-h-full flex-col px-4 pb-8 pt-10">
      <div className="fade-up flex flex-1 flex-col items-center gap-5 text-center">
        <p className="t-greet text-orange">Votre profil voyageur</p>
        <Visual tone="orange" className="h-32 w-32 rounded-full" icon={<Compass size={56} />} label="Profil voyageur" />
        <h1 className="t-hero text-brun" style={{ fontSize: 24 }}>{profile.name}</h1>
        <p className="t-body max-w-[300px] text-anthracite/90">{profile.description}</p>
        <div className="t-body-m flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-left text-brun">
          <Sparkles size={18} className="shrink-0 text-orange" />
          <span>Vos recommandations et vos itinéraires seront adaptés à ce profil. Vous pourrez le modifier à tout moment dans les paramètres.</span>
        </div>
      </div>
      <Button full className="mt-6" onClick={() => nav('/home', { replace: true })}>Découvrir VibnGO</Button>
    </div>
  );
}
