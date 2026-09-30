// Small UI glyphs drawn for LONG10.

export function ArrowRight({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 16" fill="none" aria-hidden="true">
      <path d="M1 8h32M26 1.5 33 8l-7 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ArrowUpRight({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="15" stroke="currentColor" strokeOpacity=".25" strokeWidth="1.2" />
      <path d="M12 20 20 12M13.5 12H20v6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function LaunchGlyph({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 15l6-6M10 9h5v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function MenuGlyph({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function CloseGlyph({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// Dropdown row icons.
export function NavIcon({ kind }: { kind: 'rank' | 'claim' | 'chain' }) {
  if (kind === 'rank')
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="4" fill="var(--accent)" />
        <path d="M7 16v-3M10.5 16V9M14 16v-5M17.5 16V7" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  if (kind === 'claim')
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="var(--accent)" />
        <path d="M12 7v5l3 2" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="2" fill="var(--accent)" />
      <rect x="13" y="13" width="8" height="8" rx="2" fill="var(--accent)" />
      <path d="M11 7h3a3 3 0 0 1 3 3v3M13 17h-3a3 3 0 0 1-3-3v-3" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
