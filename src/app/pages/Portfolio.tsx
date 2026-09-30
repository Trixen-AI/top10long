import { useState } from 'react'
import { useWatchAsset } from 'wagmi'
import { useLongIndex } from '@/hooks/useLongIndex'
import { useHoldings, type Holding } from '@/app/hooks/useHoldings'
import { useT10LQuote } from '@/app/hooks/useT10LQuote'
import { useNow } from '@/app/hooks/useNow'
import { ENV } from '@/app/config/env'
import { formatAmount, formatUsd, timeAgo } from '@/app/lib/format'
import { formatPrice } from '@/data/tokens'
import { AddressLink, Bar, Button, Card, CardTitle, Skeleton, Stat, TokenMark } from '@/app/components/ui'
import { WalletGate } from '@/app/components/wallet'

function WatchButton({ h }: { h: Holding }) {
  const { watchAsset, isPending, isSuccess } = useWatchAsset()
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        watchAsset({
          type: 'ERC20',
          options: { address: h.token.address, symbol: h.token.ticker.slice(0, 11), decimals: h.decimals, image: h.token.imageUrl },
        })
      }
      className="cursor-pointer text-[.11rem] font-medium whitespace-nowrap underline decoration-ink/25 underline-offset-4 hover:decoration-ink disabled:opacity-40 lg:text-[.15rem]"
    >
      {isSuccess ? 'Added' : isPending ? 'Check wallet' : 'Add to wallet'}
    </button>
  )
}

function Holdings() {
  const { tokens } = useLongIndex()
  const h = useHoldings()
  const quote = useT10LQuote()
  const now = useNow(5000)
  const [onlyHeld, setOnlyHeld] = useState(false)
  const combined = tokens.reduce((s, t) => s + t.marketCapUsd, 0)
  const rows = onlyHeld ? h.held : h.holdings
  const maxShare = h.held.reduce((m, x) => Math.max(m, h.totalUsd ? x.valueUsd / h.totalUsd : 0), 0)

  return (
    <>
      <section className={`grid grid-cols-2 gap-[.1rem] lg:gap-[.2rem] ${ENV.t10lToken ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`} aria-label="Wallet summary">
        <Stat tone="ink" label="Index tokens" value={h.isLoading ? '…' : formatUsd(h.totalUsd)} note={`${h.held.length} of ${tokens.length || 10} held`} />
        {ENV.t10lToken ? (
          <Stat
            label="T10L"
            value={h.t10l ? formatAmount(h.t10l.amount) : '…'}
            note={h.t10l && quote.data ? formatUsd(h.t10l.amount * quote.data.priceUsd) : 'reading'}
          />
        ) : null}
        <Stat label="ETH for gas" value={h.eth === null ? '…' : formatAmount(h.eth)} note="native balance on Robinhood Chain" />
        <Stat label="Coverage" value={tokens.length ? `${Math.round((h.held.length / tokens.length) * 100)}%` : '…'} note="of the ten you hold directly" />
      </section>

      <Card>
        <CardTitle
          action={
            <div className="flex items-center gap-[.12rem]">
              <label className="flex cursor-pointer items-center gap-[.06rem] text-[.12rem] lg:text-[.16rem]">
                <input type="checkbox" checked={onlyHeld} onChange={(e) => setOnlyHeld(e.target.checked)} className="accent-ink" />
                Only what I hold
              </label>
              <Button variant="outline" onClick={h.refetch}>
                Refresh
              </Button>
            </div>
          }
        >
          Holdings
        </CardTitle>
        {h.address ? (
          <p className="mb-[.12rem] text-[.12rem] text-ink/55 lg:text-[.16rem]">
            Wallet <AddressLink address={h.address} /> {h.updatedAt ? `· read ${timeAgo(h.updatedAt, now)}` : ''}
          </p>
        ) : null}
        {h.isLoading && !h.holdings.length ? (
          <div className="flex flex-col gap-[.08rem]">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-[.32rem] w-full" />)}</div>
        ) : h.isError ? (
          <p className="text-[.14rem] text-ink/60">Could not read balances from Robinhood Chain. The public RPC may be busy; try Refresh in a moment.</p>
        ) : rows.length === 0 ? (
          <p className="text-[.14rem] text-ink/60 lg:text-[.18rem]">This wallet holds none of the ten right now.</p>
        ) : (
          <div className="relative -mx-[.08rem] overflow-x-auto">
            <table className="w-full min-w-[6rem] border-collapse text-left text-[.12rem] lg:text-[.17rem]">
              <thead>
                <tr className="border-b border-ink/10 text-[.1rem] tracking-[.1em] whitespace-nowrap text-ink/45 uppercase lg:text-[.13rem]">
                  <th className="px-[.08rem] py-[.1rem] font-medium lg:px-[.14rem] lg:py-[.16rem]">Token</th>
                  <th className="px-[.08rem] py-[.1rem] text-right font-medium lg:px-[.14rem]">Balance</th>
                  <th className="px-[.08rem] py-[.1rem] text-right font-medium lg:px-[.14rem]">Price</th>
                  <th className="px-[.08rem] py-[.1rem] text-right font-medium lg:px-[.14rem]">Value</th>
                  <th className="px-[.08rem] py-[.1rem] font-medium lg:px-[.14rem]">Share of your ten</th>
                  <th className="px-[.08rem] py-[.1rem] text-right font-medium lg:px-[.14rem]">Index weight</th>
                  <th className="px-[.08rem] py-[.1rem] font-medium lg:px-[.14rem]">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((x) => {
                  const share = h.totalUsd ? x.valueUsd / h.totalUsd : 0
                  const weight = combined ? x.token.marketCapUsd / combined : 0
                  const held = x.raw > 0n
                  return (
                    <tr key={x.token.address} className={`border-b border-ink/5 last:border-0 ${held ? '' : 'text-ink/40'}`}>
                      <td className="px-[.08rem] py-[.1rem] lg:px-[.14rem] lg:py-[.14rem]">
                        <span className="flex items-center gap-[.08rem] whitespace-nowrap">
                          <TokenMark token={x.token} size="sm" />
                          <b className={held ? 'text-ink' : ''}>{x.token.ticker}</b>
                        </span>
                      </td>
                      <td className="px-[.08rem] py-[.1rem] text-right tabular-nums lg:px-[.14rem]">{formatAmount(x.amount)}</td>
                      <td className="px-[.08rem] py-[.1rem] text-right tabular-nums lg:px-[.14rem]">{formatPrice(x.token.priceUsd)}</td>
                      <td className="px-[.08rem] py-[.1rem] text-right font-semibold tabular-nums lg:px-[.14rem]">{held ? formatUsd(x.valueUsd) : '$0'}</td>
                      <td className="min-w-[1.2rem] px-[.08rem] py-[.1rem] lg:min-w-[1.6rem] lg:px-[.14rem]">
                        <span className="flex items-center gap-[.08rem]">
                          <Bar value={share} max={maxShare || 1} label={`${(share * 100).toFixed(1)}% of your index holdings`} />
                          <span className="w-[.44rem] shrink-0 text-right tabular-nums lg:w-[.56rem]">{(share * 100).toFixed(1)}%</span>
                        </span>
                      </td>
                      <td className="px-[.08rem] py-[.1rem] text-right tabular-nums lg:px-[.14rem]">{(weight * 100).toFixed(1)}%</td>
                      <td className="px-[.08rem] py-[.1rem] lg:px-[.14rem]">
                        <span className="flex items-center justify-end gap-[.12rem]">
                          <WatchButton h={x} />
                          <a href={x.token.pairUrl} target="_blank" rel="noopener noreferrer" className="text-[.11rem] whitespace-nowrap underline decoration-ink/25 underline-offset-4 hover:decoration-ink lg:text-[.15rem]">
                            Market
                          </a>
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}

export default function Portfolio() {
  return (
    <div className="flex flex-col gap-[.2rem] lg:gap-[.32rem]">
      <section className="flex flex-col gap-[.06rem] pt-[.1rem] lg:pt-[.2rem]">
        <p className="text-[.11rem] tracking-[.2em] text-ink/55 uppercase lg:text-[.15rem]">Portfolio</p>
        <h1 className="text-[.34rem] leading-none lg:text-[.8rem]">What your wallet holds</h1>
        <p className="max-w-[8rem] text-[.13rem] leading-relaxed text-ink/65 lg:text-[.2rem]">
          Live balances from Robinhood Chain for T10L and each of the ten index tokens, valued at current DexScreener prices.
        </p>
      </section>
      <WalletGate what="your holdings">
        <Holdings />
      </WalletGate>
    </div>
  )
}
