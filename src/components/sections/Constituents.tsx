import { useEffect, useMemo, useRef } from 'react'
import { CONSTITUENTS } from '@/data/copy'
import { formatCap, formatChange, formatRank } from '@/data/tokens'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useLongIndex } from '@/hooks/useLongIndex'
import type { LiveToken } from '@/lib/longIndex'

type Capsule = { token: LiveToken; kind: 'ticker' | 'cap'; rotate: number; z: number }

const TICKER_TILT = [7, -5, 4, -3, 6, -6, 3, -4, 5, -2]
const CAP_TILT = [-4, 6, -2, 5, -6, 3, -5, 2, -3, 6]

// Twenty capsules: each live market appears as its ticker and as its market cap.
const capsulesFor = (tokens: LiveToken[]): Capsule[] =>
  tokens.slice(0, 10).flatMap((t, i) => [
    { token: t, kind: 'ticker' as const, rotate: TICKER_TILT[i], z: 4 + i },
    { token: t, kind: 'cap' as const, rotate: CAP_TILT[i], z: 3 + i },
  ])

// Grid cells for each token's [ticker, market cap] pair, in rank order, so the two
// capsules of one market always sit next to each other (desktop 7 x 4, mobile 3 x 7).
const DESKTOP_PAIRS: [number, number][] = [
  [4, 5], [6, 7], [11, 12], [14, 15], [16, 17], [18, 19], [20, 27], [21, 22], [23, 24], [25, 26],
]
const MOBILE_PAIRS: [number, number][] = [
  [0, 1], [2, 5], [3, 4], [6, 7], [8, 11], [9, 10], [12, 13], [14, 17], [15, 16], [18, 19],
]
const cellsFor = (pairs: [number, number][]) => pairs.flat()
const DESKTOP_CELLS = cellsFor(DESKTOP_PAIRS)
const MOBILE_CELLS = cellsFor(MOBILE_PAIRS)

// Pointer field: capsules are pushed away from the pointer and spring back.
const FIELD = { sigma: 200, strength: 14, maxOffset: 18, stiffness: 0.12, rest: 0.075, damping: 0.86 }

function CapsuleChip({ c }: { c: Capsule }) {
  return (
    <span className="flex h-[.1rem] items-center gap-[.05rem] whitespace-nowrap lg:h-[.24rem] lg:gap-[.08rem]">
      {c.kind === 'ticker' ? (
        <>
          <span className="text-[.07rem] font-semibold text-ink/40 tabular-nums lg:text-[.13rem]">{formatRank(c.token.rank)}</span>
          <span className="text-[.1rem] font-bold tracking-tight text-ink lg:text-[.22rem]">{c.token.ticker}</span>
        </>
      ) : (
        <>
          <span className="text-[.08rem] font-medium text-ink tabular-nums lg:text-[.17rem]">{formatCap(c.token.marketCapUsd)}</span>
          <span className={`text-[.07rem] font-semibold tabular-nums lg:text-[.14rem] ${c.token.change24h >= 0 ? 'text-up' : 'text-down'}`}>
            {formatChange(c.token.change24h)}
          </span>
        </>
      )}
    </span>
  )
}

export function Constituents() {
  const isMobile = useIsMobile()
  const cols = isMobile ? 3 : 7
  const rows = isMobile ? 7 : 4
  const cells = isMobile ? MOBILE_CELLS : DESKTOP_CELLS
  const panelRef = useRef<HTMLDivElement>(null)
  const chipRefs = useRef<(HTMLDivElement | null)[]>([])
  const { tokens } = useLongIndex()
  const capsules = useMemo(() => capsulesFor(tokens), [tokens])

  useEffect(() => {
    const panel = panelRef.current
    if (!panel || isMobile) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const state = Array.from({ length: 20 }, () => ({ x: 0, y: 0, vx: 0, vy: 0 }))
    const pointer = { x: 0, y: 0, inside: false }
    let raf = 0
    let visible = false

    const onMove = (e: PointerEvent) => {
      const r = panel.getBoundingClientRect()
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
    }
    const onLeave = () => {
      pointer.inside = false
    }

    const tick = () => {
      chipRefs.current.forEach((el, i) => {
        if (!el) return
        const s = state[i]
        let tx = 0
        let ty = 0
        if (pointer.inside) {
          const r = el.getBoundingClientRect()
          const dx = r.left + r.width / 2 - s.x - pointer.x
          const dy = r.top + r.height / 2 - s.y - pointer.y
          const d = Math.hypot(dx, dy) || 1
          const f = FIELD.strength * Math.exp(-0.5 * (d / FIELD.sigma) ** 2)
          tx = (dx / d) * f * 1.6
          ty = (dy / d) * f * 1.6
          const m = Math.hypot(tx, ty)
          if (m > FIELD.maxOffset) {
            tx *= FIELD.maxOffset / m
            ty *= FIELD.maxOffset / m
          }
        }
        s.vx = (s.vx + FIELD.stiffness * (tx - s.x) - FIELD.rest * s.x) * FIELD.damping
        s.vy = (s.vy + FIELD.stiffness * (ty - s.y) - FIELD.rest * s.y) * FIELD.damping
        s.x += s.vx
        s.y += s.vy
        el.style.translate = `${s.x.toFixed(2)}px ${s.y.toFixed(2)}px`
      })
      raf = visible ? requestAnimationFrame(tick) : 0
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !raf) raf = requestAnimationFrame(tick)
    })
    io.observe(panel)
    window.addEventListener('pointermove', onMove, { passive: true })
    panel.addEventListener('pointerleave', onLeave)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      panel.removeEventListener('pointerleave', onLeave)
    }
  }, [isMobile])

  const grid: (Capsule | null)[] = Array.from({ length: cols * rows }, () => null)
  cells.forEach((cell, i) => {
    grid[cell] = capsules[i] ?? null
  })

  return (
    <div className="mt-0 lg:mt-[1.01rem]" id="top-ten">
      <h2 className="mb-[.32rem] text-center text-[.24rem] leading-none text-ink lg:mb-[1.3rem] lg:text-[.64rem]">{CONSTITUENTS.heading}</h2>
      <div
        className="relative mx-[.4rem] flex flex-col rounded-[.2rem] bg-accent pt-[.21rem] pb-[.1rem] lg:mx-0 lg:w-full lg:rounded-[.6rem] lg:pt-[.53rem] lg:pr-[.16rem] lg:pl-[.7rem]"
        style={{ perspective: '650px', transformStyle: 'preserve-3d' }}
      >
        <p className="mb-[.6rem] max-w-[6.53rem] pl-[.29rem] text-[.12rem] leading-[.15rem] text-ink lg:mb-[.48rem] lg:pl-0 lg:text-[.2rem] lg:leading-[.25rem]">
          {CONSTITUENTS.body}
        </p>
        <div
          ref={panelRef}
          className="mb-[.12rem] grid w-full gap-[.06rem] overflow-visible pl-[.1rem] lg:mb-[.4rem] lg:gap-x-[.16rem] lg:gap-y-[.1rem] lg:pr-[.24rem] lg:pl-0"
          style={{
            gridTemplateColumns: `repeat(${cols}, auto)`,
            gridTemplateRows: `repeat(${rows}, auto)`,
            justifyContent: isMobile ? undefined : 'start',
          }}
        >
          {grid.map((c, i) => {
            const idx = c ? capsules.indexOf(c) : -1
            return (
              <div key={i} className="relative min-h-0 min-w-0">
                {c && (
                  <div
                    ref={(el) => {
                      chipRefs.current[idx] = el
                    }}
                    className="relative w-fit"
                    style={{ zIndex: c.z }}
                  >
                    <div
                      className="capsule box-border cursor-default rounded-[1.12rem] bg-white px-[.1rem] py-[.05rem] lg:rounded-[.28rem] lg:px-[.28rem] lg:py-[.14rem]"
                      style={{ transform: `rotate(${c.rotate}deg)` }}
                    >
                      <CapsuleChip c={c} />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
