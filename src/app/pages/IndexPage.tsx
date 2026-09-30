import { useMemo, useState } from 'react'
import { useLongIndex } from '@/hooks/useLongIndex'
import { useHoldings } from '@/app/hooks/useHoldings'
import { formatDuration, useNow } from '@/app/hooks/useNow'
import { formatAmount, formatUsd, timeAgo } from '@/app/lib/format'
import { formatChange, formatPrice, formatRank } from '@/data/tokens'
import { explorerAddress } from '@/app/config/env'
import { Bar, Card, CardTitle, Skeleton, Stat, TokenMark } from '@/app/components/ui'
import type { LiveToken } from '@/lib/longIndex'

type SortKey = 'rank' | 'priceUsd' | 'change24h' | 'marketCapUsd' | 'liquidityUsd' | 'volume24hUsd'

const COLUMNS: { key: SortKey; label: string; align?: 'right' }[] = [
  { key: 'rank', label: '#' },
  { key: 'priceUsd', label: 'Price', align: 'right' },
  { key: 'change24h', label: '24h', align: 'right' },
  { key: 'marketCapUsd', label: 'Market cap', align: 'right' },
  { key: 'liquidityUsd', label: 'Liquidity', align: 'right' },
  { key: 'volume24hUsd', label: '24h volume', align: 'right' },
]

function SortHeader({ col, sort, setSort }: { col: (typeof COLUMNS)[number]; sort: { key: SortKey; dir: 1 | -1 }; setSort: (s: { key: SortKey; dir: 1 | -1 }) => void }) {
  const active = sort.key === col.key
  const next = () => setSort({ key: col.key, dir: active ? (sort.dir === 1 ? -1 : 1) : col.key === 'rank' ? 1 : -1 })
  return (
    <th className={`px-[.08rem] py-[.1rem] font-medium lg:px-[.14rem] lg:py-[.16rem] ${col.align === 'right' ? 'text-right' : ''}`} aria-sort={active ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>
      <button type="button" onClick={next} className={`cursor-pointer uppercase ${active ? 'text-ink' : 'hover:text-ink'}`}>
        {col.label}
        {active ? (sort.dir === 1 ? ' ↑' : ' ↓') : ''}
      </button>
    </th>
  )
}

export default function IndexPage() {
  const { tokens, status, updatedAt, nextRefreshAt } = useLongIndex()
  const h = useHoldings()
  const now = useNow()
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'rank', dir: 1 })

  const combined = tokens.reduce((s, t) => s + t.marketCapUsd, 0)
  const liquidity = tokens.reduce((s, t) => s + t.liquidityUsd, 0)
  const volume = tokens.reduce((s, t) => s + t.volume24hUsd, 0)
  const topWeight = tokens[0] && combined ? tokens[0].marketCapUsd / combined : 1
  const heldBy = useMemo(() => new Map(h.holdings.map((x) => [x.token.address.toLowerCase(), x])), [h.holdings])
  const showHeld = h.isConnected && h.onChain

  const sorted = useMemo(() => tokens.toSorted((a: LiveToken, b: LiveToken) => (a[sort.key] - b[sort.key]) * sort.dir), [tokens, sort])

  return (
    <div className="flex flex-col gap-[.2rem] lg:gap-[.32rem]">
      <section className="flex flex-col gap-[.06rem] pt-[.1rem] md:flex-row md:items-end md:justify-between lg:pt-[.2rem]">
        <div>
          <p className="text-[.11rem] tracking-[.2em] text-ink/55 uppercase lg:text-[.15rem]">Index</p>
          <h1 className="text-[.34rem] leading-none lg:text-[.8rem]">The ten largest Long.xyz tokens</h1>
        </div>
        <p className="text-[.12rem] text-ink/55 tabular-nums lg:text-[.16rem]" aria-live="polite">
          {updatedAt ? `Updated ${timeAgo(updatedAt, now)}` : 'Loading'}
          {nextRefreshAt ? ` · next refresh in ${formatDuration(nextRefreshAt - now).slice(-5)}` : ''}
        </p>
      </section>

      <section className="grid grid-cols-2 gap-[.1rem] lg:grid-cols-4 lg:gap-[.2rem]" aria-label="Index totals">
        <Stat label="Combined market cap" value={combined ? formatUsd(combined) : '…'} />
        <Stat label="Liquidity" value={liquidity ? formatUsd(liquidity) : '…'} note="deepest pool per token" />
        <Stat label="24h volume" value={volume ? formatUsd(volume) : '…'} />
        <Stat label="Largest weight" value={tokens[0] ? `${(topWeight * 100).toFixed(1)}%` : '…'} note={tokens[0] ? tokens[0].ticker : undefined} />
      </section>

      <Card>
        <CardTitle>
          Constituents{' '}
          <span className="text-[.11rem] font-normal text-ink/50 lg:text-[.15rem]">ranked by market cap · click a column to sort</span>
        </CardTitle>
        {tokens.length === 0 ? (
          status === 'error' ? (
            <p className="text-[.14rem] text-ink/50">Live market data is unavailable right now.</p>
          ) : (
            <div className="flex flex-col gap-[.08rem]">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-[.32rem] w-full" />)}</div>
          )
        ) : (
          <div className="relative -mx-[.08rem] overflow-x-auto">
            <table className="w-full min-w-[6.4rem] border-collapse text-left text-[.12rem] lg:text-[.17rem]">
              <thead>
                <tr className="border-b border-ink/10 text-[.1rem] tracking-[.1em] whitespace-nowrap text-ink/45 lg:text-[.13rem]">
                  <SortHeader col={COLUMNS[0]} sort={sort} setSort={setSort} />
                  <th className="px-[.08rem] py-[.1rem] font-medium uppercase lg:px-[.14rem]">Token</th>
                  {COLUMNS.slice(1, 4).map((c) => (
                    <SortHeader key={c.key} col={c} sort={sort} setSort={setSort} />
                  ))}
                  <th className="px-[.08rem] py-[.1rem] font-medium uppercase lg:px-[.14rem]">Weight</th>
                  {COLUMNS.slice(4).map((c) => (
                    <SortHeader key={c.key} col={c} sort={sort} setSort={setSort} />
                  ))}
                  {showHeld ? <th className="px-[.08rem] py-[.1rem] text-right font-medium uppercase lg:px-[.14rem]">You hold</th> : null}
                </tr>
              </thead>
              <tbody>
                {sorted.map((t) => {
                  const weight = combined ? t.marketCapUsd / combined : 0
                  const mine = heldBy.get(t.address.toLowerCase())
                  return (
                    <tr key={t.address} className="border-b border-ink/5 transition-colors last:border-0 hover:bg-accent/25">
                      <td className="px-[.08rem] py-[.1rem] text-ink/45 tabular-nums lg:px-[.14rem] lg:py-[.14rem]">{formatRank(t.rank)}</td>
                      <td className="px-[.08rem] py-[.1rem] lg:px-[.14rem]">
                        <span className="flex items-center gap-[.08rem] whitespace-nowrap">
                          <TokenMark token={t} size="sm" />
                          <span className="flex flex-col leading-tight">
                            <a href={t.pairUrl} target="_blank" rel="noopener noreferrer" className="font-bold hover:underline">
                              {t.ticker}
                            </a>
                            <a href={explorerAddress(t.address)} target="_blank" rel="noopener noreferrer" className="text-[.1rem] text-ink/45 hover:text-ink lg:text-[.13rem]">
                              {t.name}
                            </a>
                          </span>
                        </span>
                      </td>
                      <td className="px-[.08rem] py-[.1rem] text-right tabular-nums lg:px-[.14rem]">{formatPrice(t.priceUsd)}</td>
                      <td className={`px-[.08rem] py-[.1rem] text-right font-semibold tabular-nums lg:px-[.14rem] ${t.change24h >= 0 ? 'text-up' : 'text-down'}`}>{formatChange(t.change24h)}</td>
                      <td className="px-[.08rem] py-[.1rem] text-right tabular-nums lg:px-[.14rem]">{formatUsd(t.marketCapUsd)}</td>
                      <td className="min-w-[1.2rem] px-[.08rem] py-[.1rem] lg:min-w-[1.6rem] lg:px-[.14rem]">
                        <span className="flex items-center gap-[.08rem]">
                          <Bar value={weight} max={topWeight} label={`${(weight * 100).toFixed(1)}% of the index`} />
                          <span className="w-[.44rem] shrink-0 text-right text-ink/60 tabular-nums lg:w-[.56rem]">{(weight * 100).toFixed(1)}%</span>
                        </span>
                      </td>
                      <td className="px-[.08rem] py-[.1rem] text-right tabular-nums lg:px-[.14rem]">{formatUsd(t.liquidityUsd)}</td>
                      <td className="px-[.08rem] py-[.1rem] text-right tabular-nums lg:px-[.14rem]">{formatUsd(t.volume24hUsd)}</td>
                      {showHeld ? (
                        <td className="px-[.08rem] py-[.1rem] text-right tabular-nums lg:px-[.14rem]">
                          {mine && mine.raw > 0n ? (
                            <span className="flex flex-col leading-tight">
                              <b>{formatAmount(mine.amount)}</b>
                              <span className="text-[.1rem] text-ink/50 lg:text-[.13rem]">{formatUsd(mine.valueUsd)}</span>
                            </span>
                          ) : (
                            <span className="text-ink/30">0</span>
                          )}
                        </td>
                      ) : null}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
