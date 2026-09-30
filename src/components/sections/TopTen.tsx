import { Marquee } from '@/components/ui/Marquee'
import { ArrowRight, ArrowUpRight } from '@/components/ui/Icons'
import { TICKER_TAPE, TOP_TEN_SECTION } from '@/data/copy'
import { LINKS } from '@/data/site'
import { formatCap, formatChange, formatPrice, formatRank } from '@/data/tokens'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useLongIndex } from '@/hooks/useLongIndex'
import type { LiveToken } from '@/lib/longIndex'

// Card art cycles through three surfaces so neighbouring cards read apart.
const SURFACES = [
  { bg: 'var(--accent)', fg: 'var(--ink)', sub: 'rgba(11,11,12,.55)' },
  { bg: 'var(--ink)', fg: 'var(--accent)', sub: 'rgba(255,255,255,.55)' },
  { bg: 'var(--pale)', fg: 'var(--ink)', sub: 'rgba(11,11,12,.5)' },
]

function TokenArt({ t }: { t: LiveToken }) {
  const s = SURFACES[(t.rank - 1) % SURFACES.length]
  const up = t.change24h >= 0
  return (
    <div className="relative flex h-full w-full flex-col justify-between p-[.14rem]" style={{ background: s.bg, color: s.fg }}>
      <div className="flex items-start justify-between">
        <span className="text-[.14rem] font-semibold tabular-nums" style={{ color: s.sub }}>
          #{formatRank(t.rank)}
        </span>
        <span
          className="rounded-full px-[.08rem] py-[.02rem] text-[.12rem] font-semibold tabular-nums"
          style={{ background: up ? '#0f8a4a' : '#c2362b', color: '#fff' }}
        >
          {formatChange(t.change24h)}
        </span>
      </div>
      <div>
        <p className="truncate text-[.46rem] leading-[.9] font-bold tracking-[-0.04em]">{t.ticker}</p>
        <p className="mt-[.04rem] text-[.13rem] tabular-nums" style={{ color: s.sub }}>
          {formatPrice(t.priceUsd)} · mcap {formatCap(t.marketCapUsd)}
        </p>
      </div>
      <svg className="pointer-events-none absolute -right-[.2rem] -bottom-[.3rem] h-[1.2rem] w-[1.2rem] opacity-[.12]" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="12 6.85" />
      </svg>
    </div>
  )
}

function TokenCard({ t }: { t: LiveToken }) {
  return (
    <a
      href={t.pairUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="token-card flex w-[3.2rem] shrink-0 flex-col rounded-[.24rem] bg-white p-[.16rem]"
    >
      <header className="relative flex items-start justify-between gap-[.2rem]">
        <div className="min-w-0 flex-1 pr-[.1rem]">
          <p className="line-clamp-3 text-left text-[.16rem] leading-snug font-semibold text-ink">
            {formatRank(t.rank)} · {t.name} ({t.ticker})
          </p>
        </div>
        <ArrowUpRight className="h-[.32rem] w-[.32rem] shrink-0 text-ink" />
      </header>
      <div className="mt-[.12rem] aspect-video w-full overflow-hidden rounded-[.12rem]">
        <TokenArt t={t} />
      </div>
    </a>
  )
}

function SkeletonRow() {
  return (
    <div className="flex w-full justify-center gap-[.32rem] overflow-hidden py-[16px]">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="h-[2.2rem] w-[3.2rem] shrink-0 animate-pulse rounded-[.24rem] bg-white" />
      ))}
    </div>
  )
}

export function TopTen() {
  const isMobile = useIsMobile()
  const { status, tokens } = useLongIndex()
  const rowA = tokens.filter((_, i) => i % 2 === 0)
  const rowB = tokens.filter((_, i) => i % 2 === 1)
  const gap = isMobile ? 16 : 32

  return (
    <div className="mt-[.53rem] overflow-hidden lg:mt-[1.01rem]">
      <h2 className="mb-[.41rem] text-center text-[.24rem] text-ink lg:mb-[.25rem] lg:text-[.64rem]">{TOP_TEN_SECTION.heading}</h2>
      <div className="flex w-full flex-col items-center justify-center gap-y-[.28rem]">
        {tokens.length > 0 ? (
          <>
            <Marquee direction="left" speed={60} gap={gap} safeTop={16} safeBottom={16}>
              {rowA.map((t) => (
                <TokenCard key={t.address} t={t} />
              ))}
            </Marquee>
            <Marquee direction="left" speed={80} gap={gap} safeTop={16} safeBottom={16}>
              {rowB.map((t) => (
                <TokenCard key={t.address} t={t} />
              ))}
            </Marquee>
          </>
        ) : status === 'error' ? (
          <p className="py-[.6rem] text-center text-[.14rem] text-ink/50 lg:text-[.2rem]">{TICKER_TAPE.error}</p>
        ) : (
          <>
            <SkeletonRow />
            <SkeletonRow />
          </>
        )}
        <a
          href={LINKS.longxyz}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-[.08rem] text-[.14rem] font-medium text-ink transition-opacity duration-200 hover:opacity-60 lg:text-[.16rem]"
        >
          <span>{TOP_TEN_SECTION.more}</span>
          <ArrowRight className="h-[.12rem] w-auto" />
        </a>
      </div>
    </div>
  )
}
