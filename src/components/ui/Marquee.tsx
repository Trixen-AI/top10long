import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import gsap from 'gsap'

type Props = {
  children: ReactNode
  direction?: 'left' | 'right'
  /** pixels per second */
  speed?: number
  gap?: number | string
  /** width of the soft edge mask in px, 0 for none */
  fadeWidth?: number
  pauseOnHover?: boolean
  safeTop?: number
  safeBottom?: number
  className?: string
}

// Endless horizontal loop. The group is repeated until it covers the container
// twice, then the track slides by exactly one group width and wraps.
export function Marquee({
  children,
  direction = 'left',
  speed = 60,
  gap = 16,
  fadeWidth = 80,
  pauseOnHover = true,
  safeTop = 0,
  safeBottom = 0,
  className = '',
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const groupRef = useRef<HTMLDivElement>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  const [copies, setCopies] = useState(2)

  useLayoutEffect(() => {
    const root = rootRef.current
    const track = trackRef.current
    const group = groupRef.current
    if (!root || !track || !group) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const build = () => {
      const gw = group.offsetWidth
      const cw = root.offsetWidth
      if (gw <= 0 || cw <= 0) return
      const needed = Math.max(2, Math.ceil(cw / gw) + 2)
      setCopies((c) => (c === needed ? c : needed))
      const progress = tweenRef.current?.progress() ?? 0
      const paused = tweenRef.current?.paused() ?? false
      tweenRef.current?.kill()
      const from = direction === 'left' ? 0 : -gw
      const to = direction === 'left' ? -gw : 0
      tweenRef.current = gsap.fromTo(track, { x: from }, { x: to, duration: gw / speed, ease: 'none', repeat: -1 })
      tweenRef.current.progress(progress)
      if (paused || reduce) tweenRef.current.pause()
    }

    build()
    const ro = new ResizeObserver(() => build())
    ro.observe(root)
    ro.observe(group)
    return () => {
      ro.disconnect()
      tweenRef.current?.kill()
      tweenRef.current = null
    }
  }, [direction, speed, gap])

  const mask = fadeWidth
    ? `linear-gradient(to right, transparent 0px, #000 ${fadeWidth}px, #000 calc(100% - ${fadeWidth}px), transparent 100%)`
    : undefined
  const rootStyle: CSSProperties = {
    maskImage: mask,
    WebkitMaskImage: mask,
    paddingTop: safeTop || undefined,
    paddingBottom: safeBottom || undefined,
  }
  const gapValue = typeof gap === 'number' ? `${gap}px` : gap
  const groupStyle: CSSProperties = { gap: gapValue, paddingRight: gapValue }

  return (
    <div
      ref={rootRef}
      className={`marquee-root w-full overflow-hidden ${className}`}
      style={rootStyle}
      onMouseEnter={() => pauseOnHover && tweenRef.current?.pause()}
      onMouseLeave={() => pauseOnHover && tweenRef.current?.resume()}
    >
      <div ref={trackRef} className="flex" style={{ willChange: 'transform' }}>
        {Array.from({ length: copies }, (_, i) => (
          <div
            key={i}
            ref={i === 0 ? groupRef : undefined}
            className="flex shrink-0"
            style={groupStyle}
            aria-hidden={i > 0 ? true : undefined}
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  )
}
