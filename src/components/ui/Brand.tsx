import { LOGO, MARK, TILE } from '@/brand/paths'

export function Logo({ className = '', color = 'currentColor' }: { className?: string; color?: string }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${LOGO.width} ${LOGO.height}`}
      fill={color}
      role="img"
      aria-label="Top10Long"
    >
      <path d={MARK.ring} />
      <path d={MARK.arrow} />
      <path d={LOGO.word} />
    </svg>
  )
}

export function Mark({ className = '', color = 'currentColor' }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox={MARK.viewBox} fill={color} aria-hidden="true">
      <path d={MARK.ring} />
      <path d={MARK.arrow} />
    </svg>
  )
}

// Hero tile variants: 1 ink, 2 accent, 3 accent with white keyline, 4 pale.
export type TileVariant = 1 | 2 | 3 | 4

const TILE_STYLE: Record<TileVariant, { fill: string; stroke?: string }> = {
  1: { fill: 'var(--ink)' },
  2: { fill: 'var(--accent)' },
  3: { fill: 'var(--accent)', stroke: '#ffffff' },
  4: { fill: 'var(--pale)' },
}

export function WordTile({ variant, className = '' }: { variant: TileVariant; className?: string }) {
  const s = TILE_STYLE[variant]
  return (
    <svg className={className} viewBox={`0 0 ${TILE.width} ${TILE.height}`} aria-hidden="true">
      <path d={TILE.d} fill={s.fill} stroke={s.stroke} strokeWidth={s.stroke ? 3 : undefined} />
    </svg>
  )
}

// Outline-only wordmark used as a backdrop behind the stat cards.
export function WordOutline({ className = '', color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox={`0 0 ${TILE.width} ${TILE.height}`} aria-hidden="true">
      <path d={TILE.d} fill="none" stroke={color} strokeWidth={3} />
    </svg>
  )
}
