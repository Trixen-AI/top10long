import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Constituents } from '@/components/sections/Constituents'
import { TopTen } from '@/components/sections/TopTen'
import { Contact, MobileContact } from '@/components/sections/Contact'
import { useIsMobile } from '@/hooks/useIsMobile'

gsap.registerPlugin(ScrollTrigger)

/** Desktop: constituents, the top 10 and the closing panel pinned and scrolled sideways. Mobile: stacked. */
export function SidewaysRun() {
  const isMobile = useIsMobile()
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    const track = trackRef.current
    if (isMobile || !container || !track) return
    const ctx = gsap.context(() => {
      const distance = () => track.scrollWidth - container.offsetWidth
      if (distance() <= 0) return
      gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: { trigger: container, start: 'top top', end: () => `+=${distance()}`, scrub: 1, pin: true, invalidateOnRefresh: true },
      })
    }, container)
    requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => ctx.revert()
  }, [isMobile])

  if (isMobile) {
    return (
      <div className="relative">
        <Constituents />
        <TopTen />
        <MobileContact />
      </div>
    )
  }

  return (
    <div className="relative">
      <div ref={containerRef} className="relative w-full overflow-hidden">
        <div ref={trackRef} className="flex w-[130vw] shrink-0 flex-nowrap">
          <div className="box-border min-w-0 flex-[0_0_100vw] shrink-0 px-[2.4rem]">
            <Constituents />
          </div>
          <div className="box-border min-w-0 flex-[0_0_80vw] shrink-0 px-0">
            <TopTen />
          </div>
          <div className="box-border flex h-full min-h-0 min-w-0 flex-[0_0_30vw] shrink-0 flex-col">
            <Contact />
          </div>
        </div>
      </div>
    </div>
  )
}
