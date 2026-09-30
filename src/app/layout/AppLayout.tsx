import { NavLink, Outlet, ScrollRestoration } from 'react-router'
import { Logo } from '@/components/ui/Brand'
import { SocialLinks } from '@/components/sections/Header'
import { ConnectButton } from '@/app/components/wallet'
import { LINKS } from '@/data/site'

const APP_NAV = [
  { to: '/', label: 'Overview', end: true },
  { to: '/index', label: 'Index' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/claim', label: 'Claim' },
]

const navClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap transition-colors ${isActive ? 'text-white' : 'text-white/50 hover:text-white/80'}`

export function AppLayout() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="header-bar sticky top-0 z-50">
        <div className="mx-auto flex h-[.64rem] max-w-[14.4rem] items-center justify-between gap-[.16rem] px-[.2rem] lg:h-[1.1rem] lg:gap-[.26rem] lg:px-[.4rem]">
          <a href={LINKS.home} aria-label="Top10Long website" className="shrink-0 text-ink">
            <Logo className="block h-[.26rem] w-auto lg:h-[.4rem]" />
          </a>
          <nav
            className="hidden h-[.53rem] items-center gap-[.7rem] rounded-2xl bg-ink px-[.5rem] text-[.18rem] font-bold lg:flex"
            aria-label="Dashboard"
          >
            {APP_NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={navClass}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <ConnectButton compact />
        </div>
        <nav className="relative mx-[.2rem] mb-[.08rem] flex h-[.4rem] items-center justify-between gap-[.1rem] overflow-x-auto rounded-full bg-ink px-[.22rem] text-[.13rem] font-bold lg:hidden" aria-label="Dashboard">
          {APP_NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={navClass}>
              {n.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-[14.4rem] px-[.2rem] pt-[.2rem] pb-[.6rem] lg:px-[.4rem] lg:pt-[.3rem] lg:pb-[1rem]">
        <Outlet />
      </main>

      <footer className="border-t border-ink/10">
        <div className="mx-auto flex max-w-[14.4rem] flex-col gap-[.12rem] px-[.2rem] py-[.24rem] text-[.12rem] text-ink/60 md:flex-row md:items-center md:justify-between lg:px-[.4rem] lg:py-[.36rem] lg:text-[.16rem]">
          <p>Top10Long dashboard · Robinhood Chain</p>
          <nav className="flex gap-[.2rem]" aria-label="Site">
            <a href={LINKS.home} className="hover:text-ink">
              Website
            </a>
            <a href={LINKS.docs} className="hover:text-ink">
              Docs
            </a>
            <a href={LINKS.methodology} className="hover:text-ink">
              Methodology
            </a>
          </nav>
          <SocialLinks className="justify-start" hoverScale="hover:scale-110" />
        </div>
      </footer>
      <ScrollRestoration />
    </div>
  )
}
