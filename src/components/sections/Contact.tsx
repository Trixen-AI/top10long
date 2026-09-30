import { Logo } from '@/components/ui/Brand'
import { LaunchGlyph } from '@/components/ui/Icons'
import { SocialLinks } from '@/components/sections/Header'
import { CONTACT, FOOTER } from '@/data/copy'
import { FOOTER_LINKS, LINKS } from '@/data/site'

function LaunchButton({ size = 'lg' }: { size?: 'lg' | 'sm' }) {
  const lg = size === 'lg'
  return (
    <a
      href={LINKS.app}
      className={`inline-flex items-center justify-center rounded-full bg-ink transition-transform duration-200 hover:scale-[1.03] ${
        lg ? 'px-[.32rem] py-[.18rem]' : 'px-[.13rem] py-[.08rem]'
      }`}
    >
      <LaunchGlyph className={`${lg ? 'mr-[.08rem] h-[.24rem] w-[.24rem]' : 'mr-[.04rem] h-[.14rem] w-[.14rem]'} text-accent`} />
      <span className={`font-bold text-white ${lg ? 'text-[.18rem]' : 'text-[.12rem]'}`}>{CONTACT.cta}</span>
    </a>
  )
}

function FooterLine({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col gap-[.06rem] ${className}`}>
      <p>{FOOTER.line}</p>
      <nav className="flex gap-[.16rem]" aria-label="Footer">
        {FOOTER_LINKS.map((l) => (
          <a key={l.label} href={l.href} className="underline-offset-4 hover:underline">
            {l.label}
          </a>
        ))}
      </nav>
    </div>
  )
}

/** Desktop: the last panel of the sideways run. */
export function Contact() {
  return (
    <div className="contact-panel">
      <div className="mt-[30%] max-w-[3.83rem]">
        <h3 className="mb-[.18rem] text-[.48rem] leading-[1.1] text-ink">{CONTACT.heading}</h3>
        <p className="mb-[.71rem] text-[.2rem] text-ink/60">{CONTACT.body}</p>
        <LaunchButton />
      </div>
      <div className="absolute right-[.65rem] bottom-[10%] flex max-w-[4.6rem] flex-col items-end text-right">
        <a href={LINKS.home} aria-label="Top10Long home" className="mb-[.16rem] text-ink">
          <Logo className="block h-[.4rem] w-auto" />
        </a>
        <FooterLine className="mb-[.16rem] items-end text-[.16rem] text-ink/60" />
        <SocialLinks />
      </div>
    </div>
  )
}

/** Mobile: a stacked call to action above an ink footer. */
export function MobileContact() {
  return (
    <div className="relative z-[1]">
      <div className="contact-mobile-top px-[.4rem] py-[.6rem]">
        <h3 className="relative mb-[.12rem] text-[.26rem] leading-[1.1] text-ink">{CONTACT.heading}</h3>
        <p className="relative mb-[.3rem] text-[.13rem] text-ink/60">{CONTACT.body}</p>
        <div className="relative w-fit">
          <LaunchButton size="sm" />
        </div>
      </div>
      <footer className="flex flex-col items-end bg-ink px-[.4rem] py-[.32rem] text-right text-white">
        <Logo className="h-[.3rem] w-auto" color="#ffd23f" />
        <FooterLine className="mt-[.16rem] items-end text-[.12rem] text-white/70" />
        <SocialLinks className="mt-[.2rem] gap-[.22rem]" hoverScale="hover:scale-110" tone="dark" />
      </footer>
    </div>
  )
}
