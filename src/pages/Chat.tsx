import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Send } from 'lucide-react';
import { Header, Chip, cx } from '../components/ui';
import ItemCard from '../components/ItemCard';
import { catalog, chatbotScript } from '../api/mockApi';

interface Msg { from: 'bot' | 'me'; text: string; cards?: string[] }
const KEYWORDS: Record<string, string[]> = { add: ['ajout'], replace: ['remplac'], delete: ['supprim', 'retir'], info: ['info', 'conseil'], book: ['reserv', 'réserv'] };

export default function Chat() {
  const nav = useNavigate();
  const [msgs, setMsgs] = useState<Msg[]>([{ from: 'bot', text: chatbotScript.welcome }]);
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState('');
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs, typing]);

  const ask = (label: string, id?: string) => {
    if (typing) return;
    const key = id ?? Object.keys(KEYWORDS).find((k) => KEYWORDS[k].some((w) => label.toLowerCase().includes(w)));
    const s = chatbotScript.suggestions.find((x) => x.id === key);
    setMsgs((m) => [...m, { from: 'me', text: label }]);
    setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { from: 'bot', text: s ? s.reply : chatbotScript.fallback, cards: s && 'cards' in s ? (s.cards as string[]) : undefined }]);
      setTyping(false);
    }, 900);
  };
  const send = (e: React.FormEvent) => { e.preventDefault(); if (!text.trim()) return; ask(text.trim()); setText(''); };

  return (
    <div className="flex h-full flex-col bg-creme">
      <Header title="VibnGO Assistant" back onBack={() => nav(-1)} right={<span className="t-caption flex items-center gap-1 text-anthracite/70"><span className="h-2 w-2 rounded-full bg-green-500" />En ligne</span>} />
      <div className="scroll-area flex shrink-0 gap-2 overflow-x-auto px-4 pb-2" aria-label="Suggestions">
        {chatbotScript.suggestions.map((s) => <Chip key={s.id} onClick={() => ask(s.label, s.id)}>{s.label}</Chip>)}
      </div>
      <div className="scroll-area flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-2" aria-live="polite">
        {msgs.map((m, i) => (
          <div key={i} className={cx('flex gap-2', m.from === 'me' && 'justify-end')}>
            {m.from === 'bot' && <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brun text-white"><Bot size={18} /></span>}
            <div className={cx('flex max-w-[80%] flex-col gap-2')}>
              <p className={cx('t-body rounded-2xl px-3.5 py-2.5', m.from === 'me' ? 'bg-orange text-white' : 'bg-white text-anthracite')}>{m.text}</p>
              {m.cards?.map((id) => { const it = catalog.byId(id); return it ? <ItemCard key={id} item={it} /> : null; })}
            </div>
          </div>
        ))}
        {typing && <div className="flex gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-brun text-white"><Bot size={18} /></span><div className="flex items-center gap-1 rounded-2xl bg-white px-4">{[0, 1, 2].map((d) => <span key={d} className="dot h-1.5 w-1.5 rounded-full bg-brun" style={{ animationDelay: `${d * 0.2}s` }} />)}</div></div>}
        <div ref={end} />
      </div>
      <form onSubmit={send} className="flex items-center gap-2 border-t border-line bg-white p-3">
        <input value={text} onChange={(e) => setText(e.target.value)} aria-label="Votre message" placeholder="Demandez à votre assistant…" className="t-body-m min-h-11 flex-1 rounded-full border border-line px-4 focus:border-orange focus:outline-none" />
        <button type="submit" aria-label="Envoyer" disabled={!text.trim()} className="flex h-11 w-11 items-center justify-center rounded-full bg-orange text-white disabled:opacity-40"><Send size={18} /></button>
      </form>
    </div>
  );
}
