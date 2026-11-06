import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button, Header, Spinner, cx } from '../components/ui';
import { computeProfile, getQuestions } from '../api/mockApi';
import { useStore } from '../state/store';
import type { Question } from '../types';

export default function Quiz() {
  const nav = useNavigate();
  const { setAnswers, setProfile } = useStore();
  const [qs, setQs] = useState<Question[]>([]);
  const [step, setStep] = useState(0);
  const [answers, setLocal] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { getQuestions().then(setQs); }, []);
  if (!qs.length) return null;

  const q = qs[step];
  const chosen = answers[step];

  if (loading) return <div className="px-6 pt-24"><Spinner label="Nous analysons vos réponses…" /></div>;

  const next = async () => {
    if (step < qs.length - 1) { setStep(step + 1); return; }
    setLoading(true);
    const profile = await computeProfile(answers);
    setAnswers(answers);
    setProfile(profile.id);
    nav('/result', { replace: true });
  };

  return (
    <div className="flex min-h-full flex-col">
      <Header title="Votre profil voyageur" back={step > 0} onBack={() => setStep(step - 1)} />
      <div className="px-4">
        <div className="flex items-center gap-3" aria-label={`Question ${step + 1} sur ${qs.length}`}>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-orange transition-all" style={{ width: `${((step + 1) / qs.length) * 100}%` }} /></div>
          <span className="t-caption font-semibold text-brun">{step + 1}/{qs.length}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-5 px-4 pb-6 pt-6" key={q.id}>
        <h2 className="t-hero fade-up text-brun">{q.text}</h2>
        <div className="flex flex-col gap-2.5" role="radiogroup" aria-label={q.text}>
          {q.options.map((o) => {
            const on = chosen === o.key;
            return (
              <button key={o.key} role="radio" aria-checked={on} onClick={() => setLocal((a) => { const n = [...a]; n[step] = o.key; return n; })}
                className={cx('t-body-m fade-up flex min-h-14 items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-colors', on ? 'border-orange bg-orange/10 text-brun' : 'border-line bg-white text-anthracite')}>
                <span>{o.label}</span>
                <span className={cx('flex h-6 w-6 shrink-0 items-center justify-center rounded-full border', on ? 'border-orange bg-orange text-white' : 'border-line')}>{on && <Check size={14} />}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-auto">
          <Button full disabled={!chosen} onClick={next}>{step < qs.length - 1 ? 'Continuer' : 'Voir mon profil'}</Button>
        </div>
      </div>
    </div>
  );
}
