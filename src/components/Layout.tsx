import { useEffect } from 'react';
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { House, Plus, Search, User, Users } from 'lucide-react';
import { cx } from './ui';
import { useStore } from '../state/store';

const PUBLIC = ['/', '/signup'];
const HIDE_NAV = ['/', '/signup', '/intro', '/quiz', '/countries', '/result', '/destinations', '/prepare', '/vibi', '/create/vibi'];
const SECTIONS: { to: string; label: string; match: string[] }[] = [
  { to: '/home', label: 'Accueil', match: ['/home', '/discover'] },
  { to: '/explore', label: 'Explorer', match: ['/explore', '/place', '/destination', '/event'] },
  { to: '/create', label: 'Créer', match: ['/create', '/proposal', '/modify', '/transport', '/manual', '/trip-saved', '/plan'] },
  { to: '/community', label: 'Communauté', match: ['/community'] },
  { to: '/profile', label: 'Profil', match: ['/profile', '/settings', '/saved', '/network', '/trips', '/trip', '/upcoming', '/carnet', '/leg'] },
];
const ICONS = [House, Search, Plus, Users, User];

function NavBar({ pathname }: { pathname: string }) {
  const current = SECTIONS.findIndex((s) => s.match.some((m) => pathname === m || pathname.startsWith(m + '/')));
  return (
    <nav aria-label="Navigation principale" className="relative z-30 grid shrink-0 grid-cols-5 border-t border-trait bg-fond pb-[max(env(safe-area-inset-bottom),10px)]">
      {SECTIONS.map((s, i) => {
        const Icon = ICONS[i];
        const active = i === current;
        return (
          <NavLink key={s.to} to={s.to} aria-current={active ? 'page' : undefined} className="relative flex min-w-0 flex-col items-center gap-0.5 pb-1 pt-2.5">
            {active && <span className="absolute inset-x-3 top-0 h-0.5 bg-orange" />}
            {i === 2
              ? <span className="flex h-6 w-6 items-center justify-center rounded-md bg-orange text-white"><Icon size={16} strokeWidth={2.6} /></span>
              : <Icon size={22} strokeWidth={1.7} />}
            <span className={cx('max-w-full truncate text-[10.5px]', active ? 'font-bold' : 'font-normal')}>{s.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

function Toast() {
  const { toast, hideToast } = useStore();
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(hideToast, 2600);
    return () => clearTimeout(t);
  }, [toast, hideToast]);
  if (!toast) return null;
  return <div role="status" className="fade-up pointer-events-none absolute inset-x-4 top-4 z-50 rounded-lg bg-brun px-4 py-3 text-center text-[13px] font-medium text-white shadow-xl">{toast}</div>;
}

/** Cadre mobile : plein écran sur téléphone, « device » 393×852 centré sur ordinateur. */
export default function Layout() {
  const { pathname } = useLocation();
  const user = useStore((s) => s.user);
  const showNav = !HIDE_NAV.includes(pathname);

  // Gardes d'accès : sans utilisateur (ex. après un rafraîchissement), retour à l'accueil du parcours,
  // sans jamais afficher la page demandée.
  if (!user && !PUBLIC.includes(pathname)) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-full items-center justify-center bg-sable sm:p-6">
      <div id="phone-frame" className="relative flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-fond sm:h-[min(852px,calc(100dvh-48px))] sm:w-[393px] sm:rounded-[44px] sm:border-[6px] sm:border-encre sm:shadow-2xl">
        <Toast />
        <main className="scroll-area relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden" id="scroll-root">
          <Outlet />
        </main>
        {showNav && <NavBar pathname={pathname} />}
      </div>
    </div>
  );
}
