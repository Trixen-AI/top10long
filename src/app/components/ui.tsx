// Dashboard building blocks, made from the same devices as the website:
// white stat cards with uppercase labels, ink-outlined chips, neutral cards that turn accent on hover.
import { useState, type ReactNode } from 'react'
import type { LiveToken } from '@/lib/longIndex'
import { explorerAddress } from '@/app/config/env'
import { shortAddress } from '@/app/lib/format'

export function Card({ children, className = '', tone = 'white' }: { children: ReactNode; className?: string; tone?: 'white' | 'neutral' | 'accent' | 'ink' }) {
  const tones = {
    white: 'bg-white shadow-[0_.06rem_.24rem_#0000000f]',
    neutral: 'bg-neutral',
    accent: 'bg-accent',
    ink: 'bg-ink text-white',
  }
  return <div className={`relative rounded-[.2rem] p-[.18rem] lg:rounded-[.3rem] lg:p-[.32rem] ${tones[tone]} ${className}`}>{children}</div>
}

export function CardTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-[.14rem] flex items-center justify-between gap-[.12rem] lg:mb-[.2rem]">
      <h2 className="text-[.17rem] leading-tight text-current lg:text-[.28rem]">{children}</h2>
      {action}
    </div>
  )
}

export function Label({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`text-[.1rem] tracking-[.2em] uppercase opacity-70 lg:text-[.15rem] ${className}`}>{children}</p>
}

export function Stat({ label, value, note, tone = 'white' }: { label: string; value: ReactNode; note?: ReactNode; tone?: 'white' | 'accent' | 'ink' }) {
  const tones = {
    white: 'bg-white/85 text-ink shadow-[0_0_44.5px_0_#0000001a]',
    accent: 'bg-accent text-ink',
    ink: 'bg-ink text-white',
  }
  return (
    <div className={`flex min-w-0 flex-col rounded-[.15rem] px-[.18rem] py-[.16rem] lg:rounded-[.3rem] lg:px-[.32rem] lg:py-[.26rem] ${tones[tone]}`}>
      <Label>{label}</Label>
      <div className="mt-[.06rem] truncate text-[.24rem] leading-none font-bold tabular-nums lg:mt-[.1rem] lg:text-[.44rem]">{value}</div>
      {note ? <div className="mt-[.06rem] text-[.1rem] opacity-65 lg:mt-[.08rem] lg:text-[.15rem]">{note}</div> : null}
    </div>
  )
}

export function Chip({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-[.04rem] rounded-full border border-ink px-[.08rem] py-[.02rem] text-[.09rem] font-medium tracking-wider uppercase lg:px-[.14rem] lg:py-[.04rem] lg:text-[.13rem] ${
        active ? 'bg-ink text-accent' : 'text-ink'
      }`}
    >
      {children}
    </span>
  )
}

export function TokenMark({ token, size = 'md' }: { token: Pick<LiveToken, 'ticker' | 'imageUrl'>; size?: 'sm' | 'md' }) {
  const [failed, setFailed] = useState(false)
  const box = size === 'sm' ? 'h-[.2rem] w-[.2rem] lg:h-[.28rem] lg:w-[.28rem]' : 'h-[.26rem] w-[.26rem] lg:h-[.4rem] lg:w-[.4rem]'
  if (!token.imageUrl || failed) {
    return (
      <span className={`${box} flex shrink-0 items-center justify-center rounded-full bg-ink text-[.1rem] font-bold text-accent lg:text-[.15rem]`} aria-hidden="true">
        {token.ticker.slice(0, 1)}
      </span>
    )
  }
  return (
    <img
      src={token.imageUrl}
      alt=""
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${box} shrink-0 rounded-full bg-neutral object-cover`}
    />
  )
}

/** Single-series magnitude bar (ink on a light track), always shown next to its number. */
export function Bar({ value, max, label }: { value: number; max: number; label?: string }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0
  return (
    <div className="flex items-center gap-[.08rem]" title={label}>
      <div className="h-[.06rem] w-full min-w-[.4rem] overflow-hidden rounded-full bg-ink/8 lg:h-[.08rem]">
        <div className="h-full rounded-full bg-ink" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function AddressLink({ address, className = '' }: { address: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <span className={`inline-flex items-center gap-[.06rem] ${className}`}>
      <a
        href={explorerAddress(address)}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono underline decoration-current/25 underline-offset-4 hover:decoration-current"
        title={address}
      >
        {shortAddress(address)}
      </a>
      <button
        type="button"
        className="cursor-pointer rounded-full px-[.04rem] text-[.9em] opacity-60 hover:opacity-100"
        onClick={() => {
          navigator.clipboard?.writeText(address).then(() => {
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1400)
          })
        }}
        aria-label={`Copy ${address}`}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </span>
  )
}

export function Notice({ title, children, action, tone = 'neutral' }: { title: string; children?: ReactNode; action?: ReactNode; tone?: 'neutral' | 'accent' | 'dashed' }) {
  const tones = {
    neutral: 'bg-neutral',
    accent: 'bg-accent',
    dashed: 'border border-dashed border-ink/30',
  }
  return (
    <div className={`flex flex-col gap-[.1rem] rounded-[.16rem] p-[.18rem] md:flex-row md:items-center md:justify-between lg:rounded-[.24rem] lg:p-[.26rem] ${tones[tone]}`}>
      <div>
        <p className="text-[.15rem] font-semibold text-ink lg:text-[.22rem]">{title}</p>
        {children ? <div className="mt-[.04rem] text-[.13rem] leading-relaxed text-ink/70 lg:text-[.18rem]">{children}</div> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export function Button({
  children,
  onClick,
  disabled,
  variant = 'ink',
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'ink' | 'outline' | 'accent'
  type?: 'button' | 'submit'
}) {
  const variants = {
    ink: 'bg-ink text-white hover:scale-[1.03]',
    accent: 'bg-accent text-ink hover:scale-[1.03]',
    outline: 'border border-ink text-ink hover:bg-ink hover:text-white',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex cursor-pointer items-center justify-center gap-[.06rem] rounded-full px-[.16rem] py-[.08rem] text-[.13rem] font-bold whitespace-nowrap transition duration-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 lg:px-[.28rem] lg:py-[.14rem] lg:text-[.17rem] ${variants[variant]}`}
    >
      {children}
    </button>
  )
}

export function ExternalLink({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`underline decoration-current/25 underline-offset-4 hover:decoration-current ${className}`}>
      {children}
    </a>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <span className={`block animate-pulse rounded-[.08rem] bg-ink/8 ${className}`} />
}
