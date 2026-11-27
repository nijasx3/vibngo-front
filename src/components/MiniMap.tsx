/** Plan schématique du programme du jour (illustration statique : le prototype n'embarque pas de fond de carte). */
export default function MiniMap({ stops, temp, friends }: { stops: number; temp: string; friends: number }) {
  const pts = [[55, 140], [130, 115], [200, 132], [262, 92], [312, 55]].slice(0, Math.max(1, Math.min(stops, 5)));
  const route = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
  return (
    <div role="img" aria-label="Plan schématique du parcours du jour" className="relative h-[185px] overflow-hidden rounded-xl bg-[#e8ddd2]">
      <svg viewBox="0 0 350 185" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
        <path d="M0 150 L90 120 L200 135 L350 90" stroke="#fbf6ef" strokeWidth="9" fill="none" />
        <path d="M60 0 L90 120 L70 185" stroke="#fbf6ef" strokeWidth="7" fill="none" />
        <path d="M200 0 L200 135 L230 185" stroke="#fbf6ef" strokeWidth="7" fill="none" />
        <path d="M0 60 L120 80 L260 40 L350 60" stroke="#fbf6ef" strokeWidth="5" fill="none" />
        <path d="M280 185 L300 100 L350 120" stroke="#fbf6ef" strokeWidth="5" fill="none" />
        <rect x="235" y="105" width="115" height="80" rx="10" fill="#dbe3cf" />
        <rect x="-10" y="95" width="70" height="60" rx="10" fill="#d9e3cf" />
        <rect x="115" y="100" width="70" height="40" rx="8" fill="#f0e5c9" />
        <path d={route} stroke="#5a2e1f" strokeWidth="3.5" fill="none" strokeLinejoin="round" />
      </svg>
      {pts.map(([x, y], i) => (
        <span key={i} style={{ left: `${(x / 350) * 100}%`, top: `${(y / 185) * 100}%` }}
          className="absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[4px] bg-rouille text-[12px] font-bold text-white">{i + 1}</span>
      ))}
      <span className="t-small absolute left-3 top-3 rounded-md bg-white px-3 py-2 font-medium">{temp} · Rome</span>
      <span className="t-small absolute right-3 top-3 rounded-md bg-white px-3 py-2 font-medium">{friends} amis à proximité</span>
    </div>
  );
}
