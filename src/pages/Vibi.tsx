import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import { Button, Header, img, cx } from '../components/ui';
import { askVibi, chatbotScript } from '../api/mockApi';
import { useStore } from '../state/store';
import { fmtRange, addDays, today } from '../lib/dates';

interface Msg { from: 'vibi' | 'me'; text: string; card?: boolean }
const KEYWORDS: Record<string, string[]> = { edit: ['modif', 'change', 'remplac'], visa: ['visa', 'passeport'], meteo: ['meteo', 'météo', 'temps'] };

/** Assistant Vibi (scripté). En mode « create », il propose l'itinéraire de Rome à partir de n'importe quel message. */
export default function Vibi({ mode }: { mode: 'chat' | 'create' }) {
  const nav = useNavigate();
  const { user, newProposal } = useStore();
  const create = mode === 'create';
  const [msgs, setMsgs] = useState<Msg[]>([{ from: 'vibi', text: create ? chatbotScript.createWelcome : chatbotScript.welcome.replace('{name}', user?.name ?? '') }]);
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState('');
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs, typing]);
  const done = create && msgs.some((m) => m.card);

  const ask = async (label: string) => {
    if (typing || !label.trim() || done) return;
    setMsgs((m) => [...m, { from: 'me', text: label }]);
    setText('');
    setTyping(true);
    await askVibi();
    if (create) {
      setMsgs((m) => [...m, { from: 'vibi', text: chatbotScript.createReply, card: true }]);
    } else {
      const l = label.toLowerCase();
      const key = Object.keys(KEYWORDS).find((k) => KEYWORDS[k].some((w) => l.includes(w)));
      const s = chatbotScript.suggestions.find((x) => x.id === key);
      setMsgs((m) => [...m, { from: 'vibi', text: s ? s.reply : chatbotScript.fallback }]);
    }
    setTyping(false);
  };
  const showProgram = () => { newProposal(); nav('/proposal'); };
  const start = today();
  const range = fmtRange(start, addDays(start, 7));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Header onBack={() => nav(create ? '/create' : '/home')} />
      <div className="flex items-center gap-3 px-5 pb-3">
        <span className="h-11 w-11 overflow-hidden rounded-full bg-sable"><img src={img('vibi-avatar.png')} alt="" className="h-full w-full object-cover" /></span>
        <div><h1 className="t-h3 text-[20px]">Vibi</h1><p className="t-small text-muted">Ton assistant de voyage</p></div>
        <span className="t-small ml-auto flex items-center gap-1.5 text-[11px]"><span className="h-2 w-2 rounded-full bg-green-500" />En ligne</span>
      </div>
      {!create && <div className="scroll-area flex shrink-0 gap-2 overflow-x-auto px-5 pb-2">{chatbotScript.suggestions.map((s) => <button key={s.id} onClick={() => ask(s.label)} className="shrink-0 rounded-md bg-sable px-3 py-1.5 text-[12px] font-bold">{s.label}</button>)}</div>}
      <div className="scroll-area flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-2" aria-live="polite">
        {msgs.map((m, i) => (
          <div key={i} className={cx('flex flex-col', m.from === 'me' ? 'items-end' : 'items-start')}>
            <span className="t-micro mb-1 text-muted">{m.from === 'me' ? 'Toi' : 'Vibi'}</span>
            <p data-testid={m.from === 'vibi' ? 'vibi-msg' : undefined} className={cx('t-body max-w-[88%] rounded-lg px-4 py-3 text-[14px]', m.from === 'me' ? 'bg-brun text-white' : 'bg-sable')}>{m.text}</p>
            {m.card && (
              <div className="mt-2 w-full max-w-[88%] rounded-lg border-l-[3px] border-orange bg-white p-4">
                <div className="t-h3 text-[16px]">Rome, Italie</div>
                <div className="t-small text-muted">{range} · 7 jours · 2 voyageurs</div>
                <p className="t-small mt-1 text-[10px] italic text-muted">Prototype : les dates sont fixées automatiquement (départ aujourd’hui).</p>
                <div className="mt-3"><Button data-testid="see-program" className="min-h-10 text-[14px]" onClick={showProgram}>Voir le programme</Button></div>
              </div>
            )}
          </div>
        ))}
        {typing && <div role="status" aria-label="Vibi écrit" className="flex w-16 items-center justify-center gap-1 rounded-lg bg-sable py-3">{[0, 1, 2].map((d) => <span key={d} className="dot h-1.5 w-1.5 rounded-full bg-brun" style={{ animationDelay: `${d * 0.2}s` }} />)}</div>}
        <div ref={end} />
      </div>
      {create && !done && !typing && msgs.length === 1 && (
        <div className="px-5 pb-2"><button data-testid="example" onClick={() => ask(chatbotScript.createExample)} className="rounded-lg bg-sable px-3 py-2 text-left text-[12px] text-muted">Exemple : « {chatbotScript.createExample} »</button></div>
      )}
      <form onSubmit={(e) => { e.preventDefault(); ask(text); }} className="flex items-center gap-2 border-t border-trait p-3">
        <input value={text} onChange={(e) => setText(e.target.value)} disabled={done} aria-label="Ton message" placeholder="Écris à ton assistant…" className="t-body min-h-11 flex-1 rounded-lg bg-sable px-4 text-[14px] focus:outline-none disabled:opacity-50" />
        <button type="submit" aria-label="Envoyer" disabled={!text.trim() || done} className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange text-white disabled:opacity-40"><Send size={18} /></button>
      </form>
    </div>
  );
}
