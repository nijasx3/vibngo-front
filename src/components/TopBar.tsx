import type { ReactNode } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useStore } from '../state/store';

export function Bell_() {
  const { user, showToast } = useStore();
  const on = user?.parameters.notif;
  return (
    <button aria-label={on ? 'Notifications' : 'Notifications désactivées'} onClick={() => showToast(on ? 'Aucune nouvelle notification' : 'Les notifications sont désactivées (Paramètres)')}
      className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white text-brun">
      {on ? <Bell size={20} /> : <BellOff size={20} className="text-anthracite/40" />}
      {on && <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-orange" />}
    </button>
  );
}

export default function TopBar({ greeting, title }: { greeting?: ReactNode; title: ReactNode }) {
  return (
    <header className="flex items-center justify-between gap-2 px-4 pb-2 pt-4">
      <div className="min-w-0">
        {greeting && <p className="t-greet text-anthracite/70">{greeting}</p>}
        <h1 className="t-screen truncate text-brun">{title}</h1>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="font-[family-name:var(--font-title)] text-[13px] font-bold text-brun">Vibn<span className="text-orange">GO</span></span>
        <Bell_ />
      </div>
    </header>
  );
}
