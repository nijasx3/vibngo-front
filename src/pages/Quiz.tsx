import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Header, Logo, cx } from '../components/ui';
import { QUESTIONS } from '../api/mockApi';
import { useStore } from '../state/store';

export function QuizIntro() {
  const nav = useNavigate();
  const setProfile = useStore((s) => s.setProfile);
  const setAnswers = useStore((s) => s.setAnswers);
  const skip = () => { setAnswers([]); setProfile(null); nav('/home'); };
  return (
    <div className="flex flex-1 flex-col pb-6">
      <div className="px-5 pt-4"><Logo /></div>
      <div className="mt-8 flex-1 px-5">
        <h1 className="t-title text-[28px]">Ton profil voyageur</h1>
        <p className="t-body mt-3 text-[15px] text-muted">Dis-nous comment tu aimes voyager pour recevoir des idées adaptées à tes envies.</p>
        <div className="mt-6 rounded-lg bg-sable p-5">
          <div className="t-h3">{QUESTIONS.length} questions</div>
          <p className="t-body mt-2 text-muted">Choisis une réponse par question. Tu pourras revenir en arrière pour la modifier.</p>
          <p className="t-body mt-2 text-muted">La question sur les pays visités est facultative.</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 px-5">
        <Button variant="secondary" onClick={skip}>Passer</Button>
        <Button onClick={() => nav('/quiz')}>Commencer</Button>
      </div>
    </div>
  );
}

export default function Quiz() {
  const nav = useNavigate();
  const stored = useStore((s) => s.answers);
  const setAnswers = useStore((s) => s.setAnswers);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const q = QUESTIONS[i];
  // un retour sur le questionnaire repart de zéro si les réponses précédentes étaient complètes
  useEffect(() => { if (stored.length === QUESTIONS.length) setAnswers([]); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (key: string) => {
    if (picked) return;
    setPicked(key);
    setTimeout(() => {
      const next = [...stored.slice(0, i), key];
      setAnswers(next);
      setPicked(null);
      if (i + 1 < QUESTIONS.length) setI(i + 1); else nav('/countries');
    }, 220);
  };
  const back = () => (i > 0 ? setI(i - 1) : nav('/intro'));

  return (
    <div className="flex flex-1 flex-col pb-6">
      <div className="px-5 pt-4"><Logo /></div>
      <Header onBack={back} />
      <div className="px-5">
        <p className="t-body text-muted">Question {i + 1} sur {QUESTIONS.length}</p>
        <div className="mt-2 h-1.5 rounded-full bg-sable" role="progressbar" aria-valuemin={0} aria-valuemax={QUESTIONS.length} aria-valuenow={i + 1}>
          <div className="h-full rounded-full bg-orange transition-all" style={{ width: `${((i + 1) / QUESTIONS.length) * 100}%` }} />
        </div>
        <h1 className="t-title mt-6 min-h-[96px] text-[26px] leading-[1.2]" data-testid="question">{q.text}</h1>
        <div className="mt-5 flex flex-col gap-4">
          {q.options.map((o) => {
            const on = (picked ?? stored[i]) === o.key;
            return (
              <button key={o.key} onClick={() => choose(o.key)} aria-pressed={on}
                className={cx('flex min-h-[78px] items-center gap-5 rounded-xl px-5 text-left transition', on ? 'bg-brun text-white' : 'bg-sable')}>
                <span className="w-4 font-mono text-[17px] font-bold">{o.key}</span>
                <span className={cx('t-body flex-1 text-[16px]', on ? 'text-white' : 'text-muted')}>{o.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
