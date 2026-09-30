import { useMemo } from 'react'
import type { Address } from 'viem'
import { useLongIndex } from '@/hooks/useLongIndex'
import { useClaim } from '@/app/hooks/useClaim'
import { useClaimApproval } from '@/app/hooks/useClaimApproval'
import { useHoldings } from '@/app/hooks/useHoldings'
import { formatDuration, useNow } from '@/app/hooks/useNow'
import { ENV, explorerTx } from '@/app/config/env'
import { formatAmount } from '@/app/lib/format'
import { LINKS } from '@/data/site'
import { AddressLink, Button, Card, CardTitle, ExternalLink, Stat, TokenMark } from '@/app/components/ui'
import { WalletGate } from '@/app/components/wallet'

type ClaimState = ReturnType<typeof useClaim>

function WindowCard({ c, now }: { c: ClaimState; now: number }) {
  if (c.windowState === 'open' && c.closesAt) return <Stat tone="accent" label="Holder window" value="Open now" note={`closes in ${formatDuration(c.closesAt - now)}`} />
  if (c.windowState === 'upcoming' && c.opensAt)
    return <Stat tone="ink" label="Holder window opens in" value={formatDuration(c.opensAt - now)} note={new Date(c.opensAt).toLocaleString()} />
  if (c.windowState === 'closed') return <Stat label="Holder window" value="Closed" note={c.closesAt ? `closed ${new Date(c.closesAt).toLocaleString()}` : undefined} />
  if (c.windowState === 'loading') return <Stat label="Holder window" value="…" note="reading the claim contract" />
  return <Stat label="Holder window" value="Unknown" note="the claim contract did not return a schedule" />
}

function StepBadge({ n, done }: { n: number; done: boolean }) {
  return (
    <span
      className={`flex h-[.28rem] w-[.28rem] shrink-0 items-center justify-center rounded-full text-[.13rem] font-bold lg:h-[.4rem] lg:w-[.4rem] lg:text-[.17rem] ${
        done ? 'bg-accent text-ink' : 'bg-ink text-accent'
      }`}
      aria-hidden="true"
    >
      {done ? '✓' : n}
    </span>
  )
}

function Steps({ c, now }: { c: ClaimState; now: number }) {
  const { tokens } = useLongIndex()
  const tokenAddresses = useMemo(() => tokens.map((t) => t.address as Address), [tokens])
  const a = useClaimApproval(tokenAddresses)

  const contractReady = Boolean(c.claimAddress)
  const canClaim = a.isApproved && contractReady && c.windowState === 'open' && c.hasClaimable && !c.isSigning && !c.isConfirming

  let claimNote = ''
  if (!a.isApproved) claimNote = 'Approve first, then claim.'
  else if (!contractReady) claimNote = 'Approved. Claiming opens when the claim contract goes live.'
  else if (c.windowState === 'upcoming') claimNote = 'Approved. Claims open when the holder window starts.'
  else if (c.windowState === 'closed') claimNote = 'This holder window has closed.'
  else if (!c.hasClaimable && !c.claimableLoading) claimNote = 'Nothing is claimable for this wallet right now.'

  return (
    <Card>
      <CardTitle>{contractReady ? 'Claim in two steps' : 'Approve your claim'}</CardTitle>
      <ol className="flex flex-col gap-[.12rem] lg:gap-[.16rem]">
        <li className="flex flex-col gap-[.1rem] rounded-[.16rem] bg-neutral p-[.16rem] md:flex-row md:items-center md:justify-between lg:rounded-[.24rem] lg:p-[.24rem]">
          <div className="flex gap-[.12rem]">
            <StepBadge n={1} done={a.isApproved} />
            <div>
              <p className="text-[.15rem] font-semibold lg:text-[.22rem]">Approve the claim</p>
              <p className="text-[.12rem] leading-relaxed text-ink/65 lg:text-[.17rem]" aria-live="polite">
                {a.isVerifying
                  ? 'Verifying your signature…'
                  : a.isApproved && a.expiresAt
                    ? `Approved. Valid for ${formatDuration(a.expiresAt - now)}.`
                    : 'Sign once in your wallet. It is free: no gas and no transaction.'}
                {a.error ? <span className="block text-down">{a.error}</span> : null}
              </p>
            </div>
          </div>
          {a.isApproved ? (
            <Button variant="outline" onClick={a.revoke}>
              Revoke
            </Button>
          ) : (
            <Button onClick={a.approve} disabled={a.isSigning || a.isVerifying || tokens.length === 0}>
              {a.isSigning ? 'Check your wallet' : a.isVerifying ? 'Verifying…' : 'Approve'}
            </Button>
          )}
        </li>

        {/* The claim step appears once the claim contract address is configured. */}
        {contractReady ? (
        <li className={`flex flex-col gap-[.1rem] rounded-[.16rem] p-[.16rem] lg:rounded-[.24rem] lg:p-[.24rem] ${a.isApproved ? 'bg-accent' : 'bg-neutral/60'}`}>
          <div className="flex flex-col gap-[.1rem] md:flex-row md:items-center md:justify-between">
            <div className="flex gap-[.12rem]">
              <StepBadge n={2} done={c.isConfirmed} />
              <div>
                <p className="text-[.15rem] font-semibold lg:text-[.22rem]">Claim the ten</p>
                <p className="text-[.12rem] leading-relaxed text-ink/70 lg:text-[.17rem]" aria-live="polite">
                  {c.isSigning ? 'Confirm the claim in your wallet…' : null}
                  {c.isConfirming ? 'Claim sent, waiting for confirmation…' : null}
                  {c.isConfirmed ? <span className="text-up">Claimed. The tokens are in your wallet.</span> : null}
                  {c.writeError ? <span className="text-down">{c.writeError.message.split('\n')[0]}</span> : null}
                  {!c.isSigning && !c.isConfirming && !c.isConfirmed && !c.writeError ? claimNote : null}
                  {c.txHash ? (
                    <>
                      {' '}
                      <ExternalLink href={explorerTx(c.txHash)}>View transaction</ExternalLink>
                    </>
                  ) : null}
                </p>
              </div>
            </div>
            <Button onClick={c.claim} disabled={!canClaim}>
              {c.isSigning ? 'Check your wallet' : c.isConfirming ? 'Confirming…' : 'Claim all'}
            </Button>
          </div>

          {contractReady && c.lines.length ? (
            <ul className="mt-[.06rem] grid grid-cols-1 gap-[.06rem] md:grid-cols-2">
              {c.lines.map((l) => (
                <li key={l.token} className="flex items-center justify-between rounded-[.12rem] bg-white px-[.12rem] py-[.08rem] text-[.13rem] lg:text-[.18rem]">
                  <b>{l.symbol}</b>
                  <span className="tabular-nums">{formatAmount(l.amount)}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {contractReady && c.claimableError ? (
            <p className="text-[.12rem] text-down lg:text-[.16rem]">The claim contract could not be read. Check VITE_T10L_CLAIM_ADDRESS against src/app/config/claimAbi.ts.</p>
          ) : null}
        </li>
        ) : null}
      </ol>
    </Card>
  )
}

function Payout() {
  const { tokens } = useLongIndex()
  return (
    <Card tone="neutral">
      <CardTitle>What a claim pays out</CardTitle>
      <p className="mb-[.14rem] text-[.13rem] leading-relaxed text-ink/70 lg:text-[.18rem]">
        A claim delivers the tokens that make up the index at the time of the window. Today that is these ten, ranked live by market cap:
      </p>
      <div className="flex flex-wrap gap-[.08rem]">
        {tokens.map((t) => (
          <span key={t.address} className="inline-flex items-center gap-[.06rem] rounded-full bg-white py-[.04rem] pr-[.12rem] pl-[.04rem] text-[.13rem] font-semibold lg:text-[.17rem]">
            <TokenMark token={t} size="sm" />
            {t.ticker}
          </span>
        ))}
      </div>
      <a href={LINKS.claiming} className="mt-[.14rem] inline-block text-[.13rem] font-medium underline underline-offset-4 lg:text-[.17rem]">
        How claiming works
      </a>
    </Card>
  )
}

export default function Claim() {
  const now = useNow()
  const c = useClaim(now)
  const h = useHoldings()

  return (
    <div className="flex flex-col gap-[.2rem] lg:gap-[.32rem]">
      <section className="flex flex-col gap-[.06rem] pt-[.1rem] lg:pt-[.2rem]">
        <p className="text-[.11rem] tracking-[.2em] text-ink/55 uppercase lg:text-[.15rem]">Claim</p>
        <h1 className="text-[.34rem] leading-none lg:text-[.8rem]">Claim the ten</h1>
        <p className="max-w-[8rem] text-[.13rem] leading-relaxed text-ink/65 lg:text-[.2rem]">
          During the holder window, T10L holders claim each of the ten index tokens straight to their own wallet.
        </p>
      </section>

      {/* Contract-backed cards appear once the claim contract is configured. */}
      {ENV.t10lClaim ? (
        <section className="grid grid-cols-1 gap-[.1rem] md:grid-cols-3 lg:gap-[.2rem]">
          <WindowCard c={c} now={now} />
          {ENV.t10lToken ? (
            <Stat label="Your T10L" value={h.t10l ? formatAmount(h.t10l.amount) : '…'} note={h.t10l && h.t10l.raw > 0n ? 'eligible to claim' : 'hold T10L to become eligible'} />
          ) : null}
          <Stat label="Claim contract" value={<AddressLink address={ENV.t10lClaim} className="text-[.16rem] lg:text-[.24rem]" />} note="Robinhood Chain" />
        </section>
      ) : null}

      <WalletGate what="your claim">
        <Steps c={c} now={now} />
      </WalletGate>

      <Payout />
    </div>
  )
}
