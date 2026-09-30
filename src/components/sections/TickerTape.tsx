import { useState } from 'react'
import { Marquee } from '@/components/ui/Marquee'
import { TICKER_TAPE } from '@/data/copy'
import { formatChange, formatPrice } from '@/data/tokens'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useLongIndex } from '@/hooks/useLongIndex'
import type { LiveToken } from '@/lib/longIndex'

// Token image as listed on DexScreener; a lettered disc if there is none or it fails to load.
function TokenLogo({ token }: { token: LiveToken }) {
  const [failed, setFailed] = useState(false)
  const box = 'h-[.2rem] w-[.2rem] shrink-0 rounded-full lg:h-[.36rem] lg:w-[.36rem]'
  if (!token.imageUrl || failed) {
    return (
      <span className={`${box} flex items-center justify-center bg-ink text-[.08rem] font-bold text-accent lg:text-[.14rem]`} aria-hidden="true">
        {token.ticker.slice(0, 1)}
      </span>
    )
  }
  return (
    <img
      src={token.imageUrl}
      alt=""
      width={36}
      height={36}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${box} bg-neutral object-cover`}
    />
  )
}

function Chip({ t }: { t: LiveToken }) {
  return (
    <a
      href={t.pairUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-[.24rem] shrink-0 items-center gap-[.08rem] whitespace-nowrap lg:h-[.4rem] lg:gap-[.12rem]"
      title={`${t.name} on DexScreener`}
    >
      <TokenLogo token={t} />
      <span className="text-[.14rem] font-bold tracking-tight text-ink lg:text-[.26rem]">{t.ticker}</span>
      <span className="text-[.12rem] text-ink/60 tabular-nums lg:text-[.2rem]">{formatPrice(t.priceUsd)}</span>
      <span className={`text-[.12rem] font-semibold tabular-nums lg:text-[.2rem] ${t.change24h >= 0 ? 'text-up' : 'text-down'}`}>
        {formatChange(t.change24h)}
      </span>
    </a>
  )
}

export function TickerTape() {
  const isMobile = useIsMobile()
  const { status, tokens } = useLongIndex()
  const gap = isMobile ? '0.24rem' : '0.64rem'

  return (
    <section className="w-full overflow-hidden py-[.48rem] lg:py-[.8rem]" aria-labelledby="ticker-heading">
      <h2 id="ticker-heading" className="mb-[.32rem] text-center text-[.24rem] leading-none font-medium text-ink lg:mb-[.64rem] lg:text-[.64rem]">
        {TICKER_TAPE.heading}
      </h2>
      {tokens.length > 0 ? (
        <Marquee direction="left" speed={40} gap={gap} fadeWidth={0} pauseOnHover>
          {tokens.map((t) => (
            <Chip key={t.address} t={t} />
          ))}
        </Marquee>
      ) : status === 'error' ? (
        <p className="flex h-[.24rem] items-center justify-center text-[.12rem] text-ink/50 lg:h-[.4rem] lg:text-[.2rem]">{TICKER_TAPE.error}</p>
      ) : (
        <div className="flex h-[.24rem] justify-center gap-[.24rem] overflow-hidden lg:h-[.4rem] lg:gap-[.64rem]" aria-label={TICKER_TAPE.loading}>
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="h-full w-[1.4rem] shrink-0 animate-pulse rounded-full bg-neutral lg:w-[3rem]" />
          ))}
        </div>
      )}
    </section>
  )
}
