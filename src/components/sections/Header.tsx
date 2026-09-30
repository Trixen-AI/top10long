import { useEffect, useRef, useState } from 'react'
import { NAV, SOCIALS, LINKS, type NavChild, type NavItem, type Page } from '@/data/site'
import { Logo } from '@/components/ui/Brand'
import { SocialIcon } from '@/components/ui/SocialIcon'
import { CloseGlyph, MenuGlyph, NavIcon } from '@/components/ui/Icons'

export function SocialLinks({
  className = '',
  hoverScale = 'hover:scale-120',
  tone = 'light',
}: {
  className?: string
  hoverScale?: string
  tone?: 'light' | 'dark'
}) {
  return (
    <div className={`flex items-center justify-center gap-[.24rem] ${className}`} aria-label="Social media">
      {SOCIALS.map((s) => (
        <a
          key={s.key}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.label}
          className={`inline-flex cursor-pointer transition-transform duration-200 ease-out ${hoverScale}`}
        >
          <SocialIcon platform={s.key} tone={tone} className="w-[.32rem]" />
        </a>
      ))}
    </div>
  )
}

function DropdownRow({ item }: { item: NavChild }) {
  return (
    <a
      href={item.href}
      className={`nav-dropdown__link ${item.subtitle ? '' : 'nav-dropdown__link--compact'}`}
      {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <span className={`flex w-full ${item.icon ? 'gap-[.16rem]' : ''}`}>
        {item.icon && (
          <span className="nav-dropdown__icon">
            <NavIcon kind={item.icon} />
          </span>
        )}
        <span className="flex min-w-0 flex-col gap-[.05rem]">
          <span className="text-[.16rem] font-bold text-[#0a0a0a]">{item.label}</span>
          {item.subtitle && <span className="nav-dropdown__subtitle">{item.subtitle}</span>}
        </span>
      </span>
    </a>
  )
}

function MenuTrigger({ item }: { item: Extract<NavItem, { kind: 'menu' }> }) {
  const [open, setOpen] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const show = () => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setOpen(true), 120)
  }
  const hide = () => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setOpen(false), 160)
  }
  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <div className="relative flex h-full items-center" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      <button
        type="button"
        className="inline-flex cursor-pointer items-center gap-[.06rem] text-[.18rem] leading-none text-inherit"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
      >
        {item.label} <i className="nav-trigger__arrow" />
      </button>
      <div className={`nav-dropdown ${open ? 'is-open' : ''}`} role="menu">
        <span className="nav-dropdown__arrow" aria-hidden="true" />
        {item.children.map((c) => (
          <DropdownRow key={c.label} item={c} />
        ))}
      </div>
    </div>
  )
}

export function Header({ page = 'home' }: { page?: Page }) {
  return (
    <header className="header-bar fixed inset-x-0 top-0 z-50 hidden h-[1.26rem] w-full items-center justify-center lg:flex">
      <div className="flex items-center justify-center gap-[.26rem]">
        <a href={LINKS.home} aria-label="Top10Long home" className="text-ink">
          <Logo className="block h-[.4rem] w-auto" />
        </a>
        <nav
          className="flex h-[.53rem] items-center justify-center gap-[.92rem] rounded-2xl bg-ink px-[.6rem]"
          aria-label="Main navigation"
        >
          {NAV.map((item) => (
            <div
              key={item.label}
              className={`flex h-full items-center text-[.18rem] font-bold transition-colors ${
                item.kind !== 'app' && item.page === page ? 'text-white' : 'text-white/50 hover:text-white/80'
              }`}
            >
              {item.kind === 'link' && (
                <a href={item.href} aria-current={item.page === page ? 'page' : undefined}>
                  {item.label}
                </a>
              )}
              {item.kind === 'menu' && <MenuTrigger item={item} />}
              {item.kind === 'app' && <a href={item.href}>{item.label}</a>}
            </div>
          ))}
        </nav>
        <SocialLinks />
      </div>
    </header>
  )
}

export function MobileHeader() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <div className="relative z-10 flex w-full items-center justify-between px-[.2rem] py-[.16rem]">
        <a href={LINKS.home} aria-label="Top10Long home" className="text-ink">
          <Logo className="block h-[.32rem] w-auto" />
        </a>
        <button type="button" aria-label="Open menu" className="cursor-pointer text-ink" onClick={() => setOpen(true)}>
          <MenuGlyph className="h-[.24rem] w-[.24rem]" />
        </button>
      </div>

      <div className={`mobile-menu ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <button type="button" className="mobile-menu__scrim" aria-label="Close menu" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1} />
        <aside className="mobile-menu__panel" aria-label="Menu">
          <div className="flex items-center justify-between">
            <Logo className="h-[.28rem] w-auto" />
            <button type="button" aria-label="Close menu" className="cursor-pointer" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
              <CloseGlyph className="h-[.24rem] w-[.24rem]" />
            </button>
          </div>
          <nav className="mt-[.4rem] flex flex-col gap-[.26rem]" aria-label="Mobile navigation">
            {NAV.map((item) => {
              if (item.kind === 'link')
                return (
                  <a key={item.label} href={item.href} className="text-[.18rem] font-bold" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
                    {item.label}
                  </a>
                )
              if (item.kind === 'app')
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="w-fit rounded-full bg-ink px-[.2rem] py-[.1rem] text-[.16rem] font-bold text-white"
                    tabIndex={open ? 0 : -1}
                  >
                    {item.label}
                  </a>
                )
              return (
                <div key={item.label} className="flex flex-col gap-[.12rem]">
                  <span className="text-[.18rem] font-bold text-ink/45">{item.label}</span>
                  {item.children.map((c) => (
                    <a
                      key={c.label}
                      href={c.href}
                      className="flex items-center gap-[.12rem] rounded-full bg-neutral p-[.14rem] text-[.15rem] font-medium"
                      onClick={() => setOpen(false)}
                      tabIndex={open ? 0 : -1}
                    >
                      <span className="h-[.14rem] w-[.14rem] shrink-0 rounded-full bg-accent-deep" />
                      {c.label}
                    </a>
                  ))}
                </div>
              )
            })}
          </nav>
          <SocialLinks className="mt-auto justify-start" hoverScale="hover:scale-110" />
        </aside>
      </div>
    </>
  )
}
