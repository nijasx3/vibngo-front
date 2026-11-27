import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button, Header, img } from '../components/ui';
import { computeProfile } from '../api/mockApi';
import { useStore } from '../state/store';
import type { Profile } from '../types';

export default function Result() {
  const nav = useNavigate();
  const { answers, setProfile } = useStore();
  const [profile, setLocal] = useState<Profile | null>(null);
  const valid = answers.length === 12;
  useEffect(() => {
    if (!valid) return;
    let on = true;
    computeProfile(answers).then((p) => { if (on) { setLocal(p); setProfile(p.id); } });
    return () => { on = false; };
  }, [valid]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!valid) return <Navigate to="/intro" replace />;

  if (!profile) {
    return (
      <div role="status" aria-live="polite" className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
        <img src={img('vibi.png')} alt="" className="h-32" />
        <div className="spin h-8 w-8 rounded-full border-4 border-sable border-t-orange" />
        <h1 className="t-h3 text-[18px]">Vibi analyse tes réponses…</h1>
        <p className="t-body text-muted">Ton profil voyageur arrive dans un instant.</p>
      </div>
    );
  }
  return (
    <div className="fade-up flex flex-1 flex-col pb-6">
      <Header onBack={() => nav('/countries')} />
      <div className="flex flex-1 flex-col items-center px-5 text-center">
        <p className="t-label text-[12px] font-normal tracking-wide text-muted">TON PROFIL VOYAGEUR</p>
        <h1 data-testid="profile-name" className="t-title mt-2 text-[28px]">{profile.name}</h1>
        <img src={img(profile.image)} alt="" className="mt-4 h-[210px] w-auto" />
        <div className="mt-4 w-full rounded-lg bg-sable px-6 py-7"><p className="t-body text-[16px] text-muted">{profile.description}</p></div>
        <p className="t-body mt-5 max-w-[300px] text-muted">Ton profil est enregistré. Découvre les destinations proposées pour toi.</p>
      </div>
      <div className="px-5 pt-4"><Button onClick={() => nav('/destinations')}>Voir les recommandations</Button></div>
    </div>
  );
}
