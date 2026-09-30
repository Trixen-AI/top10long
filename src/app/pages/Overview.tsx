import { Link } from 'react-router'
import { useLongIndex } from '@/hooks/useLongIndex'
import { useHoldings } from '@/app/hooks/useHoldings'
import { useClaim } from '@/app/hooks/useClaim'
import { useT10LQuote } from '@/app/hooks/useT10LQuote'
import { formatDuration, useNow } from '@/app/hooks/useNow'
import { ENV } from '@/app/config/env'
import { formatAmount, formatUsd } from '@/app/lib/format'
import { formatChange, formatPrice, formatRank } from '@/data/tokens'
import { Bar, Card, CardTitle, Chip, ExternalLink, Notice, Skeleton, Stat, TokenMark } from '@/app/components/ui'
import { hasProjectId } from '@/app/config/appkit'

// Only rendered once the claim contract is configured.
function WindowStat() {
  const now = useNow()
  const c = useClaim(now)
  if (c.windowState === 'open' && c.closesAt) return <Stat tone="accent" label="Holder window" value="Open" note={`closes in ${formatDuration(c.closesAt - now)}`} />
  if (c.windowState === 'upcoming' && c.opensAt) return <Stat label="Holder window" value={formatDuration(c.opensAt - now)} note="until claims open" />
  if (c.windowState === 'closed') return <Stat label="Holder window" value="Closed" note="the next window is announced on-chain" />
  return <Stat label="Holder window" value="…" note="reading the claim contract" />
}

export default function Overview() {
  const { tokens, status } = useLongIndex()
  const h = useHoldings()
  const quote = useT10LQuote()
  const combined = tokens.reduce((s, t) => s + t.marketCapUsd, 0)
  const connected = h.isConnected && h.onChain

  const t10lValue = h.t10l && quote.data ? h.t10l.amount * quote.data.priceUsd : null
  const summaryCount = 2 + (ENV.t10lToken ? 1 : 0) + (ENV.t10lClaim ? 1 : 0)
  const summaryCols = { 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' }[summaryCount]

  return (
    <div className="flex flex-col gap-[.2rem] lg:gap-[.32rem]">
      <section className="flex flex-col gap-[.06rem] pt-[.1rem] lg:pt-[.2rem]">
        <p className="text-[.11rem] tracking-[.2em] text-ink/55 uppercase lg:text-[.15rem]">Dashboard</p>
        <h1 className="text-[.34rem] leading-none lg:text-[.8rem]">Your top 10, in one place.</h1>
        <p className="max-w-[8rem] text-[.13rem] leading-relaxed text-ink/65 lg:text-[.2rem]">
          Follow the ten largest Long.xyz tokens live, see what your wallet already holds, and claim during the holder window.
        </p>
      </section>

      {/* T10L and holder-window cards appear only once their contracts are configured. */}
      <section className={`grid grid-cols-2 gap-[.1rem] lg:gap-[.2rem] ${summaryCols}`} aria-label="Summary">
        {ENV.t10lToken ? (
          <Stat
            tone="ink"
            label="Your T10L"
            value={connected ? (h.t10l ? formatAmount(h.t10l.amount) : <Skeleton className="h-[.24rem] w-[1rem] lg:h-[.4rem]" />) : '…'}
            note={connected ? (t10lValue !== null ? formatUsd(t10lValue) : 'price loading') : 'connect to read your balance'}
          />
        ) : null}
        <Stat
          label="Index tokens held"
          value={connected ? (h.isLoading ? '…' : formatUsd(h.totalUsd)) : '…'}
          note={connected ? `${h.held.length} of ${tokens.length || 10} tokens` : 'connect to read your wallet'}
        />
        {ENV.t10lClaim ? <WindowStat /> : null}
        <Stat label="Index size" value={combined ? formatUsd(combined) : '…'} note="combined market cap of the ten" />
      </section>

      {!hasProjectId ? (
        <Notice title="Wallet connection is not configured" tone="dashed">
          Add your Reown project id as <code className="font-mono">VITE_REOWN_PROJECT_ID</code> in <code className="font-mono">.env.local</code> and restart the dev
          server. Live index data below works without it.
        </Notice>
      ) : null}

      <div className="grid gap-[.2rem] lg:grid-cols-[1.6fr_1fr] lg:gap-[.32rem]">
        <Card>
          <CardTitle
            action={
              <Link to="/index" className="text-[.12rem] font-medium underline underline-offset-4 lg:text-[.16rem]">
                Full index
              </Link>
            }
          >
            The ten right now
          </CardTitle>
          {tokens.length === 0 ? (
            <div className="flex flex-col gap-[.08rem]">
              {status === 'error' ? <p className="text-[.14rem] text-ink/50">Live market data is unavailable right now.</p> : Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-[.3rem] w-full" />)}
            </div>
          ) : (
            <ul className="flex flex-col">
              {tokens.map((t) => {
                const weight = combined ? t.marketCapUsd / combined : 0
                return (
                  <li key={t.address} className="grid grid-cols-[.26rem_1fr_auto] items-center gap-x-[.1rem] border-b border-ink/6 py-[.08rem] last:border-0 lg:grid-cols-[.4rem_1.6fr_1fr_.9fr_.8fr] lg:gap-x-[.16rem] lg:py-[.12rem]">
                    <span className="text-[.11rem] text-ink/40 tabular-nums lg:text-[.15rem]">{formatRank(t.rank)}</span>
                    <span className="flex min-w-0 items-center gap-[.08rem]">
                      <TokenMark token={t} size="sm" />
                      <b className="truncate text-[.14rem] lg:text-[.19rem]">{t.ticker}</b>
                    </span>
                    <span className="hidden lg:block">
                      <Bar value={weight} max={tokens[0] ? tokens[0].marketCapUsd / combined : 1} label={`${(weight * 100).toFixed(1)}% of the index`} />
                    </span>
                    <span className="hidden text-right text-[.15rem] text-ink/60 tabular-nums lg:block">{(weight * 100).toFixed(1)}%</span>
                    <span className="text-right text-[.13rem] tabular-nums lg:text-[.17rem]">
                      {formatPrice(t.priceUsd)}{' '}
                      <span className={t.change24h >= 0 ? 'text-up' : 'text-down'}>{formatChange(t.change24h)}</span>
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <div className="flex flex-col gap-[.2rem] lg:gap-[.32rem]">
          <Card tone="neutral">
            <CardTitle
              action={
                <Link to="/portfolio" className="text-[.12rem] font-medium underline underline-offset-4 lg:text-[.16rem]">
                  Portfolio
                </Link>
              }
            >
              Your exposure
            </CardTitle>
            {connected ? (
              h.held.length ? (
                <>
                  <p className="mb-[.1rem] text-[.13rem] text-ink/70 lg:text-[.18rem]">
                    You already hold {h.held.length} of the ten, worth {formatUsd(h.totalUsd)}.
                  </p>
                  <div className="flex flex-wrap gap-[.06rem]">
                    {h.holdings.map((x) => (
                      <Chip key={x.token.address} active={x.raw > 0n}>
                        {x.token.ticker}
                      </Chip>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-[.13rem] text-ink/70 lg:text-[.18rem]">{h.isLoading ? 'Reading your balances…' : 'This wallet holds none of the ten yet.'}</p>
              )
            ) : (
              <p className="text-[.13rem] text-ink/70 lg:text-[.18rem]">Connect a wallet to see which of the ten you already hold.</p>
            )}
          </Card>

          {/* Appears once the T10L token address is configured. */}
          {ENV.t10lToken ? (
            <Card tone="accent">
              <CardTitle>Get T10L</CardTitle>
              <div className="flex flex-col gap-[.08rem] text-[.13rem] lg:text-[.18rem]">
                <p>
                  {quote.data ? (
                    <>
                      T10L trades at <b>{formatPrice(quote.data.priceUsd)}</b> ({formatChange(quote.data.change24h)} in 24h).
                    </>
                  ) : (
                    'Reading the T10L market…'
                  )}
                </p>
                {quote.data ? <ExternalLink href={quote.data.pairUrl}>Open the T10L market on DexScreener</ExternalLink> : null}
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
