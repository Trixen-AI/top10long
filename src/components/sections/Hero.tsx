import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { WordTile, type TileVariant } from '@/components/ui/Brand'
import { MobileHeader } from '@/components/sections/Header'
import { HERO } from '@/data/copy'

gsap.registerPlugin(ScrollTrigger, SplitText)

// Tile colour order per row (1 ink, 2 accent, 3 accent keyline, 4 pale).
const ROWS: TileVariant[][] = [
  [2, 1, 4, 3],
  [1, 4, 3, 2],
  [4, 3, 2, 1],
  [3, 2, 1, 2],
]
const TILE_REM_DESKTOP = 8.26
const TILE_REM_MOBILE = 3.78

type Props = { onIntroComplete: () => void }

export function Hero({ onIntroComplete }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const line2Ref = useRef<HTMLDivElement>(null)
  const markRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const doneRef = useRef(onIntroComplete)
  useLayoutEffect(() => {
    doneRef.current = onIntroComplete
  })

  // Keep the ink bar starting right where the highlighted word starts.
  useLayoutEffect(() => {
    const place = () => {
      if (markRef.current && barRef.current) barRef.current.style.left = `${markRef.current.offsetLeft}px`
    }
    place()
    const ro = new ResizeObserver(place)
    if (line2Ref.current) ro.observe(line2Ref.current)
    return () => ro.disconnect()
  }, [])

  useLayoutEffect(() => {
    const root = rootRef.current
    const track = trackRef.current
    if (!root || !track) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const splits: SplitText[] = []

    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray<HTMLElement>('.hero-row', root)
      const n = rows.length
      const rootFs = () => parseFloat(getComputedStyle(document.documentElement).fontSize)
      const tileRem = () => (window.innerWidth >= 1024 ? TILE_REM_DESKTOP : TILE_REM_MOBILE)
      const restX = (i: number) => (-tileRem() * rootFs() * (n - i)) / n

      const afterIntro = () => {
        // Horizontal pin: vertical scroll moves the track until the headline panel is in view.
        const distance = () => track.scrollWidth - root.offsetWidth
        if (distance() <= 0) {
          doneRef.current()
          return
        }
        const slide = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: { trigger: root, start: 'top top', end: () => `+=${distance()}`, scrub: 1, pin: true, invalidateOnRefresh: true },
        })
        ScrollTrigger.refresh()
        // The headline plays when the sideways slide reaches its end. Anchoring to the pin's
        // own end keeps the point reachable even if the viewport width changes afterwards.
        const pinEnd = () => (slide.scrollTrigger ? slide.scrollTrigger.end - 1 : distance())

        const words = gsap.utils.toArray<HTMLElement>('.hero-split-words', root)
        const body = root.querySelector<HTMLElement>('.hero-split-chars')
        const bar = barRef.current
        const mark = markRef.current

        if (reduce) {
          doneRef.current()
          return
        }

        const tl = gsap.timeline({
          scrollTrigger: { trigger: root, start: pinEnd, once: true },
          onComplete: () => {
            doneRef.current()
            requestAnimationFrame(() => ScrollTrigger.refresh())
          },
        })
        for (const el of words) {
          const s = new SplitText(el, { type: 'words', aria: 'auto' })
          splits.push(s)
          tl.from(s.words, { y: -100, opacity: 0, rotation: 'random(-80, 80)', duration: 0.7, ease: 'back', stagger: 0.15 })
        }
        if (bar) tl.from(bar, { xPercent: 30, opacity: 0, ease: 'power3.out' })
        if (mark) tl.from(mark, { yPercent: -200, opacity: 0, duration: 0.85, ease: 'bounce.out' }, '>')
        if (body) {
          const s = new SplitText(body, { type: 'words,chars', aria: 'auto' })
          splits.push(s)
          tl.from(s.chars, { x: 150, opacity: 0, duration: 0.7, ease: 'power4', stagger: 0.01 })
        }

        // Carry the visitor to the headline instead of waiting for them to scroll.
        const st = tl.scrollTrigger
        if (st) {
          requestAnimationFrame(() => {
            ScrollTrigger.refresh()
            const target = Math.min(ScrollTrigger.maxScroll(window), st.start + 1)
            const from = window.scrollY
            if (from >= target - 0.5) return
            const proxy = { y: from }
            gsap.to(proxy, { y: target, duration: 1.25, ease: 'power2.inOut', onUpdate: () => window.scrollTo(0, proxy.y) })
          })
        }
      }

      if (reduce) {
        gsap.set(rows, { x: (i: number) => restX(i), opacity: 1 })
        afterIntro()
        return
      }
      gsap.set(rows, { x: '50vw', opacity: 0.3 })
      gsap.to(rows, {
        x: (i: number) => restX(i),
        opacity: 1,
        duration: 2,
        ease: 'back.out',
        stagger: 0.2,
        onComplete: afterIntro,
      })
    }, root)

    return () => {
      splits.forEach((s) => s.revert())
      ctx.revert()
    }
  }, [])

  return (
    <div
      ref={rootRef}
      id="top"
      className="hero relative h-screen overflow-hidden bg-linear-to-b from-accent to-[rgba(var(--accent-rgb),0)]"
    >
      <div className="block lg:hidden">
        <MobileHeader />
      </div>
      <div ref={trackRef} className="flex h-full w-fit shrink-0">
        <div
          className="relative -mt-[.85rem] flex h-full shrink-0 flex-col justify-center overflow-hidden lg:mt-[.55rem]"
          aria-hidden="true"
        >
          {ROWS.map((row, r) => (
            <div key={r} className="hero-row flex w-fit">
              {row.map((v, i) => (
                <div key={i} className="flex items-center justify-center">
                  <WordTile variant={v} className="h-[1.01rem] w-[3.78rem] shrink-0 lg:h-[2.21rem] lg:w-[8.26rem]" />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="relative h-full w-[1.44rem] shrink-0 lg:w-[12.46rem]">
          <div className="absolute top-0 right-0 -mt-[.85rem] flex h-full w-screen items-center justify-center overflow-hidden lg:mt-0">
            <div className="w-full px-[.3rem] lg:w-[11.2rem]">
              <h1 className="relative mb-[.26rem] text-[.24rem] leading-none font-normal lg:mb-[.25rem] lg:text-[.64rem]">
                <span className="hero-split-words relative z-[2] block leading-none text-ink">{HERO.line1}</span>
                <span ref={line2Ref} className="relative z-[2] flex items-center leading-none text-white">
                  <span className="hero-split-words text-ink">{HERO.line2Lead}</span>
                  <span ref={markRef} className="relative z-[2] pl-[.12rem] lg:pl-[.24rem]">
                    {HERO.line2Mark}
                  </span>
                  <span
                    ref={barRef}
                    className="absolute top-0 z-[1] h-[.28rem] w-screen rounded-full bg-ink lg:h-[.72rem]"
                    aria-hidden="true"
                  />
                </span>
              </h1>
              <p className="hero-split-chars text-[.16rem] font-normal text-ink opacity-60 lg:text-[.3rem]">{HERO.body}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
