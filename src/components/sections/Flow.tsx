import { Marquee } from '@/components/ui/Marquee'
import { WordOutline, WordTile } from '@/components/ui/Brand'
import { FLOW, STATS } from '@/data/copy'
import { useEffect, useState } from 'react'
import { formatCap, formatRank } from '@/data/tokens'
import { mmss, useCountdown } from '@/hooks/useCountdown'
import { useLongIndex } from '@/hooks/useLongIndex'
import { REFRESH_MS } from '@/lib/longIndex'

// Placeholder holder-window length (02:14 in the concept). Wire to the real claim schedule.
export const HOLDER_WINDOW_SECONDS = 134

type StepKey = (typeof FLOW.steps)[number]['key']

function MockFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="flow-mock" aria-hidden="true">
      <p className="flow-mock__label">{label}</p>
      {children}
    </div>
  )
}

function RankMock() {
  const { tokens } = useLongIndex()
  return (
    <MockFrame label="Long.xyz top 10 · market cap">
      <ul className="flex flex-col gap-[.05rem]">
        {tokens.slice(0, 4).map((t) => (
          <li key={t.address} className="flow-mock__row">
            <span className="flex items-center gap-[.06rem]">
              <span className="text-ink/40 tabular-nums">{formatRank(t.rank)}</span>
              <b>{t.ticker}</b>
            </span>
            <span className="tabular-nums">{formatCap(t.marketCapUsd)}</span>
          </li>
        ))}
      </ul>
    </MockFrame>
  )
}

// Seconds until the live data actually refreshes next.
function useSecondsUntil(at: number | null) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return at ? Math.max(0, Math.ceil((at - now) / 1000)) : REFRESH_MS / 1000
}

function RefreshMock() {
  const { nextRefreshAt, tokens } = useLongIndex()
  const left = useSecondsUntil(nextRefreshAt)
  const pct = left / (REFRESH_MS / 1000)
  const C = 2 * Math.PI * 26
  return (
    <MockFrame label="DexScreener · auto refresh">
      <div className="flex items-center gap-[.14rem]">
        <svg viewBox="0 0 64 64" className="h-[.78rem] w-[.78rem] shrink-0 -rotate-90">
          <circle cx="32" cy="32" r="26" fill="none" stroke="#0b0b0c" strokeOpacity=".08" strokeWidth="7" />
          <circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke="#f2b705"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - pct)}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="flex flex-col gap-[.03rem]">
          <span className="text-[.1rem] text-ink/50">next refresh</span>
          <span className="text-[.26rem] leading-none font-semibold tabular-nums">{left}s</span>
          <span className="flow-mock__pill">{tokens.length} of 10 ranked</span>
        </div>
      </div>
    </MockFrame>
  )
}

function HoldMock() {
  const { tokens } = useLongIndex()
  const chips = tokens.length ? [...tokens.slice(0, 3).map((t) => t.ticker), `+${Math.max(0, tokens.length - 3)}`] : []
  return (
    <MockFrame label="One position holds">
      <p className="text-[.22rem] leading-none font-semibold tabular-nums">
        10 markets <span className="text-[.12rem] font-medium text-ink/50">in T10L</span>
      </p>
      <div className="mt-[.08rem] flex gap-[.04rem]">
        {chips.map((t) => (
          <span key={t} className="flow-mock__chip">
            {t}
          </span>
        ))}
      </div>
      <div className="mt-[.1rem] flex items-center justify-between rounded-[.08rem] bg-ink px-[.1rem] py-[.08rem] text-[.1rem] text-white">
        <span className="font-semibold text-accent">T10L</span>
        <span className="text-white/60">Robinhood Chain</span>
      </div>
    </MockFrame>
  )
}

function WindowMock() {
  const left = useCountdown(HOLDER_WINDOW_SECONDS)
  return (
    <MockFrame label="Holder window">
      <div className="flex items-end justify-between">
        <span className="text-[.34rem] leading-none font-semibold tabular-nums">{mmss(left)}</span>
        <span className="flow-mock__pill">opens soon</span>
      </div>
      <div className="mt-[.1rem] h-[.06rem] overflow-hidden rounded-full bg-ink/10">
        <div className="h-full rounded-full bg-accent-deep" style={{ width: `${(1 - left / HOLDER_WINDOW_SECONDS) * 100}%`, transition: 'width 1s linear' }} />
      </div>
      <div className="mt-[.08rem] flex items-center justify-between text-[.1rem] text-ink/60">
        <span>Claim all ten</span>
        <span className="flow-mock__toggle" />
      </div>
    </MockFrame>
  )
}

function ReceiveMock() {
  const { tokens } = useLongIndex()
  return (
    <MockFrame label="Example claim">
      <ul className="flex flex-col gap-[.05rem]">
        {tokens.slice(0, 4).map((t, i) => (
          <li key={t.address} className="flow-mock__row">
            <b>{t.ticker}</b>
            <span className={`flow-mock__pill ${i < 3 ? 'flow-mock__pill--done' : ''}`}>{i < 3 ? 'Received' : 'Pending'}</span>
          </li>
        ))}
      </ul>
    </MockFrame>
  )
}

const MOCKS: Record<StepKey, () => React.ReactElement> = {
  rank: RankMock,
  refresh: RefreshMock,
  hold: HoldMock,
  window: WindowMock,
  receive: ReceiveMock,
}

function FlowCard({ step }: { step: (typeof FLOW.steps)[number] }) {
  const Mock = MOCKS[step.key]
  return (
    <div className="flex w-full shrink-0 flex-col lg:w-[4.5rem]">
      <div className="cursor-pointer rounded-[.2rem] bg-neutral px-[.2rem] py-[.15rem] transition-colors duration-300 hover:bg-accent lg:rounded-[.3rem] lg:px-[.35rem] lg:py-[.3rem]">
        <h3 className="mb-[.24rem] text-[.16rem] leading-none text-ink lg:text-[.36rem]">{step.title}</h3>
        <Mock />
        <p className="mt-[.24rem] text-[.11rem] leading-relaxed text-ink lg:mt-[.1rem] lg:text-[.18rem]">{step.body}</p>
      </div>
    </div>
  )
}

function StatCard({ stat }: { stat: (typeof STATS)[number] }) {
  const left = useCountdown(HOLDER_WINDOW_SECONDS)
  const value = stat.value === 'countdown' ? mmss(left) : stat.value
  return (
    <div className="rounded-[.15rem] bg-white/85 px-[.2rem] py-[.18rem] shadow-[0_0_44.5px_0_#0000001a] backdrop-blur-[0.6px] lg:rounded-[.3rem] lg:px-[.4rem] lg:py-[.32rem]">
      <p className="text-[.1rem] tracking-[.2em] text-ink uppercase lg:text-[.18rem]">{stat.label}</p>
      <p className="mt-[.06rem] text-[.32rem] leading-none font-bold text-ink tabular-nums lg:mt-[.12rem] lg:text-[.56rem]">{value}</p>
      <p className="mt-[.06rem] text-[.1rem] text-ink/60 lg:mt-[.1rem] lg:text-[.16rem]">{stat.note}</p>
    </div>
  )
}

export function Flow() {
  return (
    <div className="w-full pt-0 md:pt-[.6rem] xl:pt-[1.21rem] 2xl:pt-[2.41rem]">
      <div className="flex w-full flex-col items-center justify-center">
        <h2 className="max-w-[3.38rem] text-center text-[.24rem] leading-none text-ink lg:max-w-[11.2rem] lg:text-[.64rem]">{FLOW.heading}</h2>
        <p className="mt-[.2rem] max-w-[90%] text-center text-[.12rem] leading-[.25rem] text-ink lg:mt-[.37rem] lg:max-w-[11.2rem] lg:text-[.2rem]">
          {FLOW.body}
        </p>
      </div>

      <div className="relative mt-[.3rem] hidden w-full lg:mt-[.6rem] lg:block">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <WordTile variant={4} className="absolute top-2 -left-3 h-[1.1rem] w-auto lg:h-[2.2rem]" />
          <WordTile variant={4} className="absolute -right-3 bottom-2 h-[1.1rem] w-auto lg:h-[2.2rem]" />
        </div>
        <Marquee speed={50} gap={32} fadeWidth={80} pauseOnHover>
          {FLOW.steps.map((s) => (
            <FlowCard key={s.key} step={s} />
          ))}
        </Marquee>
      </div>
      <div className="mt-[.3rem] flex w-full flex-col gap-[.24rem] px-[.4rem] lg:hidden">
        {FLOW.steps.map((s) => (
          <FlowCard key={s.key} step={s} />
        ))}
      </div>

      <div
        id="claim"
        className="relative mt-[.4rem] mb-[.4rem] flex w-full flex-col items-center justify-center px-[.4rem] py-[.4rem] lg:mt-[1.6rem] lg:mb-0 lg:min-h-[4.6rem] lg:px-[2.4rem] lg:py-[.8rem]"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <WordOutline color="var(--accent-deep)" className="absolute top-2 -left-3 h-[1.1rem] w-auto lg:h-[2.2rem]" />
          <WordOutline color="var(--accent-deep)" className="absolute -right-3 bottom-2 h-[1.1rem] w-auto lg:h-[2.2rem]" />
        </div>
        <div className="relative z-10 grid grid-cols-1 gap-[.24rem] lg:mt-[.2rem] lg:grid-cols-3 lg:gap-[.51rem]">
          {STATS.map((s) => (
            <StatCard key={s.label} stat={s} />
          ))}
        </div>
      </div>
    </div>
  )
}
