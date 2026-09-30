import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MECHANISM } from '@/data/copy'
import { LINKS } from '@/data/site'
import { StackArt } from '@/components/art/StackArt'
import { ArrowRight } from '@/components/ui/Icons'

gsap.registerPlugin(ScrollTrigger)

const ACCENT = '#ffd23f'
const NEUTRAL = '#e6e4dc'
const STEP_REM = 1.5

type Card = (typeof MECHANISM.cards)[number]

const CARD_LINKS: Record<Card['art'], string> = { hold: LINKS.docs, claim: LINKS.claiming, rank: LINKS.methodology }

/** Inverted-corner fillet: a quarter square minus a quarter circle, in the card colour. */
function Fillet({ className }: { className: string }) {
  return (
    <div className={`absolute h-[.16rem] w-[.16rem] lg:h-[.4rem] lg:w-[.4rem] ${className}`}>
      <svg className="h-full w-full" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">
        <path d="M1 1V0A1 1 0 0 1 0 1Z" fill="var(--card-bg)" />
      </svg>
    </div>
  )
}

function DescTab({ card }: { card: Card }) {
  const right = card.tabSide === 'right'
  return (
    <div className={`absolute top-0 ${right ? 'right-0' : 'left-0'}`}>
      <div
        className={`relative p-[.12rem] pt-0 lg:p-[.4rem] lg:pt-0 ${
          right ? 'rounded-bl-[.16rem] lg:rounded-bl-[.4rem]' : 'rounded-br-[.16rem] lg:rounded-br-[.4rem]'
        }`}
        style={{ backgroundColor: 'var(--card-bg)' }}
      >
        {right ? (
          <>
            <Fillet className="top-0 -left-[.16rem] rotate-[270deg] lg:-left-[.4rem]" />
            <Fillet className="right-0 -bottom-[.16rem] rotate-[270deg] lg:-bottom-[.4rem]" />
          </>
        ) : (
          <>
            <Fillet className="top-0 -right-[.16rem] rotate-180 lg:-right-[.4rem]" />
            <Fillet className="-bottom-[.16rem] left-0 rotate-180 lg:-bottom-[.4rem]" />
          </>
        )}
        <div className="flex max-w-[1.13rem] flex-col items-end lg:max-w-[5.6rem]">
          <p className="text-[.08rem] leading-[.1rem] text-ink opacity-60 lg:text-[.22rem] lg:leading-relaxed">{card.body}</p>
          <a
            href={CARD_LINKS[card.art]}
            className="mt-[.1rem] flex items-center gap-[.08rem] pr-0 font-medium text-ink/60 transition-colors hover:text-ink lg:mt-[.18rem] lg:pr-[.3rem]"
          >
            <span className="text-[.08rem] lg:text-[.14rem]">{card.link}</span>
            <ArrowRight className="h-[.06rem] w-auto lg:h-[.2rem]" />
          </a>
        </div>
      </div>
    </div>
  )
}

function StackCard({ card, index }: { card: Card; index: number }) {
  return (
    <div
      className="stack-card__surface flex flex-col rounded-[.2rem] px-[.24rem] pt-[.24rem] pb-[.23rem] antialiased lg:rounded-[.6rem] lg:px-[1.17rem] lg:pt-[.68rem] lg:pb-[1.12rem]"
      style={{ ['--card-bg' as string]: index === 0 ? ACCENT : NEUTRAL, backgroundColor: 'var(--card-bg)' }}
    >
      <div className="flex items-start justify-between gap-[.3rem]">
        {card.tags.map((t) => (
          <span key={t} className="stack-chip">
            {t}
          </span>
        ))}
      </div>
      <div className="flex flex-col">
        <h3 className="mt-[.05rem] text-[.32rem] leading-[.4rem] tracking-[-0.05em] whitespace-nowrap text-ink uppercase lg:mt-0 lg:text-[1.56rem] lg:leading-[2.6rem] lg:tracking-tight">
          {card.title}
        </h3>
        <p className="mt-[.05rem] text-[.13rem] leading-none tracking-wide text-ink uppercase lg:mt-0 lg:text-[.4rem]">{card.subtitle}</p>
      </div>
      <div className="relative mt-[.26rem] lg:mt-[.54rem]">
        <div className="relative isolate h-[2.8rem] overflow-hidden rounded-[.15rem] lg:h-[5.84rem] lg:rounded-[.4rem]">
          <StackArt kind={card.art} />
        </div>
        <DescTab card={card} />
      </div>
    </div>
  )
}

export function Mechanism({ onStackComplete }: { onStackComplete: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const doneRef = useRef(onStackComplete)
  useLayoutEffect(() => {
    doneRef.current = onStackComplete
  })

  useLayoutEffect(() => {
    const root = rootRef.current
    const wrapper = wrapperRef.current
    const pin = pinRef.current
    if (!root || !wrapper || !pin) return
    const mm = gsap.matchMedia()

    const ctx = gsap.context(() => {
      // Intro heading: fade up once when it reaches 88% of the viewport.
      gsap.utils.toArray<HTMLElement>('.reveal-up', root).forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 88%',
          once: true,
          onEnter: () => {
            el.style.animationDelay = el.dataset.delay ?? '0s'
            el.classList.add('is-revealed')
          },
        })
      })

      mm.add('(min-width: 1024px)', () => {
        const cards = gsap.utils.toArray<HTMLElement>('.stack-card', pin)
        const surface = (el: HTMLElement) => el.querySelector<HTMLElement>('.stack-card__surface')
        cards.forEach((card, i) => {
          gsap.set(card, { zIndex: i + 1, top: `${i * STEP_REM}rem`, left: 0, right: 0, yPercent: i === 0 ? 0 : 100 })
          surface(card)?.style.setProperty('--card-bg', i === 0 ? ACCENT : NEUTRAL)
        })
        let told = false
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrapper,
            start: 'top top',
            end: () => `+=${(cards.length - 1) * window.innerHeight}`,
            pin,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onLeave: () => {
              if (!told) {
                told = true
                doneRef.current()
              }
            },
          },
        })
        // One progress value per step drives both colours, so every card always has a colour
        // whichever way (and however fast) the stack is scrubbed.
        const toNeutral = gsap.utils.interpolate(ACCENT, NEUTRAL)
        const toAccent = gsap.utils.interpolate(NEUTRAL, ACCENT)
        for (let i = 1; i < cards.length; i++) {
          const inS = surface(cards[i])
          const outS = surface(cards[i - 1])
          const step = { p: 0 }
          tl.to(cards[i], { yPercent: 0, duration: 1, ease: 'none' }, i - 1)
          tl.to(
            step,
            {
              p: 1,
              duration: 1,
              ease: 'none',
              onUpdate: () => {
                outS?.style.setProperty('--card-bg', toNeutral(step.p))
                inS?.style.setProperty('--card-bg', toAccent(step.p))
              },
            },
            i - 1,
          )
        }
      })

      mm.add('(max-width: 1023.98px)', () => {
        // No pin on small screens: the cards simply stack, and the rest of the page mounts right away.
        gsap.utils.toArray<HTMLElement>('.stack-card__surface', pin).forEach((s) => s.style.setProperty('--card-bg', ACCENT))
        doneRef.current()
      })
    }, root)

    return () => {
      mm.revert()
      ctx.revert()
    }
  }, [])

  return (
    <div ref={rootRef} id="how-it-works">
      <div className="flex flex-col items-center justify-center">
        <h2 className="reveal-up max-w-[3.38rem] text-center text-[.24rem] leading-none text-ink lg:max-w-[11.2rem] lg:text-[.64rem]">
          {MECHANISM.heading}
        </h2>
        <div className="reveal-up mt-[.17rem] mb-[.24rem] max-w-[2.51rem] text-center lg:mt-[.43rem] lg:mb-[.94rem] lg:max-w-[11.2rem]" data-delay="0.25s">
          <p className="text-[.12rem] leading-none text-ink/50 lg:text-[.2rem] lg:leading-[.25rem]">{MECHANISM.body}</p>
        </div>
      </div>
      <div ref={wrapperRef}>
        <div className="relative w-full">
          <div
            ref={pinRef}
            className="stack-pin relative w-full"
            style={{ ['--stack-extra' as string]: `${MECHANISM.cards.length * STEP_REM}rem` }}
          >
            {MECHANISM.cards.map((card, i) => (
              <div key={card.title} className="stack-card mx-[.4rem] mb-[.33rem] lg:mx-0 lg:mb-0">
                <StackCard card={card} index={i} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
