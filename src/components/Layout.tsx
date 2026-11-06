import { useEffect } from 'react';
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bot, Compass, House, Plus, User, Users } from 'lucide-react';
import { cx } from './ui';
import { useStore } from '../state/store';

const HIDE_NAV = ['/signup', '/quiz', '/result', '/chat'];
const HIDE_FAB = ['/signup', '/quiz', '/result', '/chat', '/create'];

function NavBar() {
  const link = (to: string, label: string, Icon: typeof House) => (
    <NavLink to={to} className={({ isActive }) => cx('flex min-h-14 min-w-0 flex-col items-center justify-center gap-0.5', isActive ? 'text-orange' : 'text-anthracite/60')}>
      <Icon size={22} strokeWidth={2} /><span className="max-w-full truncate text-[10px] font-semibold">{label}</span>
    </NavLink>
  );
  // Grille à 5 colonnes égales : le bouton « + » est exactement au centre, quelle que soit la largeur de l'écran.
  return (
    <nav aria-label="Navigation principale" className="relative z-30 grid shrink-0 grid-cols-5 items-center border-t border-line bg-white px-1 pb-[max(env(safe-area-inset-bottom),6px)] pt-1">
      {link('/home', 'Accueil', House)}
      {link('/explore', 'Explorer', Compass)}
      <div className="flex justify-center">
        <NavLink to="/create" aria-label="Créer un itinéraire" className="relative z-10 -mt-7 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-orange text-white shadow-lg shadow-orange/40 active:bg-orange-dark"><Plus size={26} /></NavLink>
      </div>
      {link('/community', 'Communauté', Users)}
      {link('/profile', 'Profil', User)}
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
  return <div role="status" className="t-body-s fade-up pointer-events-none absolute inset-x-4 top-4 z-50 rounded-xl bg-brun px-4 py-3 text-center text-white shadow-xl">{toast}</div>;
}

/** Cadre mobile : plein écran sur téléphone, "device" 393×852 centré sur ordinateur. */
export default function Layout() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const user = useStore((s) => s.user);
  const showNav = !HIDE_NAV.some((p) => pathname.startsWith(p));
  const showFab = !HIDE_FAB.some((p) => pathname.startsWith(p));

  // Gardes d'accès : sans utilisateur (ex. après un rafraîchissement) on revient à l'inscription,
  // sans jamais afficher la page demandée.
  if (!user && pathname !== '/signup') return <Navigate to="/signup" replace />;
  if (user && !user.traveler_type && !['/signup', '/quiz', '/result'].includes(pathname)) return <Navigate to="/quiz" replace />;

  return (
    <div className="flex min-h-full items-center justify-center bg-creme sm:p-6">
      <div className="relative flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-creme sm:h-[min(852px,calc(100dvh-48px))] sm:w-[393px] sm:rounded-[44px] sm:border-[6px] sm:border-anthracite sm:shadow-2xl">
        <Toast />
        <main className="scroll-area relative flex-1 overflow-y-auto overflow-x-hidden" id="scroll-root">
          <Outlet />
          {showFab && <div className="h-20" />}
        </main>
        {showFab && (
          <button aria-label="Ouvrir VibnGO Assistant" onClick={() => nav('/chat')}
            className="absolute bottom-[84px] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brun text-white shadow-xl shadow-brun/30 active:scale-95">
            <Bot size={28} />
          </button>
        )}
        {showNav && <NavBar />}
      </div>
    </div>
  );
}
