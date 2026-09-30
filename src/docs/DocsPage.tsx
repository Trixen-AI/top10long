import { useEffect, useState } from 'react'
import { Header, MobileHeader, SocialLinks } from '@/components/sections/Header'
import { Logo } from '@/components/ui/Brand'
import { ArrowUpRight } from '@/components/ui/Icons'
import { CHAIN, DOCS, LAUNCH_EVENT, LONG_LAUNCHERS } from '@/data/docs'
import { FOOTER } from '@/data/copy'
import { FOOTER_LINKS, LINKS } from '@/data/site'
import { formatCap, formatChange, formatPrice, formatRank } from '@/data/tokens'
import { useLongIndex } from '@/hooks/useLongIndex'

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="docs-section scroll-mt-[.4rem] lg:scroll-mt-[1.5rem]">
      <h2 className="mb-[.16rem] text-[.26rem] leading-tight text-ink lg:mb-[.24rem] lg:text-[.44rem]">{title}</h2>
      {children}
    </section>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-[.12rem] text-[.15rem] leading-relaxed text-ink/75 lg:mb-[.16rem] lg:text-[.2rem]">{children}</p>
}

function AddressLink({ address }: { address: string }) {
  return (
    <a
      href={`${CHAIN.explorer}/address/${address}`}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono text-[.13rem] text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink lg:text-[.17rem]"
      title={address}
    >
      {short(address)}
    </a>
  )
}

/** Highlights the section currently in view in the table of contents. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-20% 0px -65% 0px' },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [ids])
  return active
}

function LiveTable() {
  const { status, tokens } = useLongIndex()
  if (!tokens.length) {
    return (
      <p className="rounded-[.16rem] bg-white p-[.2rem] text-[.15rem] text-ink/50 lg:text-[.18rem]">
        {status === 'error' ? 'Live market data is unavailable right now.' : 'Loading live Long.xyz markets…'}
      </p>
    )
  }
  return (
    <div className="relative overflow-x-auto rounded-[.16rem] bg-white shadow-[0_.06rem_.24rem_#0000000f] lg:rounded-[.24rem]">
      <table className="w-full md:min-w-[5.6rem] border-collapse text-left text-[.13rem] lg:text-[.18rem]">
        <thead>
          <tr className="border-b border-ink/10 text-[.11rem] tracking-[.12em] whitespace-nowrap text-ink/45 uppercase lg:text-[.13rem]">
            <th className="px-[.08rem] py-[.12rem] font-medium lg:px-[.16rem] lg:py-[.18rem]">#</th>
            <th className="px-[.08rem] py-[.12rem] font-medium lg:px-[.16rem]">Token</th>
            <th className="hidden px-[.08rem] py-[.12rem] text-right font-medium md:table-cell lg:px-[.16rem]">Price</th>
            <th className="px-[.08rem] py-[.12rem] text-right font-medium lg:px-[.16rem]">Market cap</th>
            <th className="px-[.08rem] py-[.12rem] text-right font-medium lg:px-[.16rem]">24h</th>
            <th className="hidden px-[.08rem] py-[.12rem] font-medium md:table-cell lg:px-[.16rem]">Contract</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((t) => (
            <tr key={t.address} className="border-b border-ink/5 last:border-0">
              <td className="px-[.08rem] py-[.12rem] text-ink/45 tabular-nums lg:px-[.16rem] lg:py-[.16rem]">{formatRank(t.rank)}</td>
              <td className="px-[.08rem] py-[.12rem] lg:px-[.16rem]">
                <a href={t.pairUrl} target="_blank" rel="noopener noreferrer" title={`${t.name} on DexScreener`} className="group inline-flex items-center gap-[.06rem] whitespace-nowrap">
                  <b className="text-ink">{t.ticker}</b>
                                    <ArrowUpRight className="h-[.18rem] w-[.18rem] text-ink/40 transition-colors group-hover:text-ink lg:h-[.22rem] lg:w-[.22rem]" />
                </a>
              </td>
              <td className="hidden px-[.08rem] py-[.12rem] text-right tabular-nums md:table-cell lg:px-[.16rem]">{formatPrice(t.priceUsd)}</td>
              <td className="px-[.08rem] py-[.12rem] text-right tabular-nums lg:px-[.16rem]">
                {formatCap(t.marketCapUsd)}
                <span className="block text-[.11rem] text-ink/50 md:hidden">{formatPrice(t.priceUsd)}</span>
              </td>
              <td className={`px-[.08rem] py-[.12rem] text-right font-semibold tabular-nums lg:px-[.16rem] ${t.change24h >= 0 ? 'text-up' : 'text-down'}`}>
                {formatChange(t.change24h)}
              </td>
              <td className="hidden px-[.08rem] py-[.12rem] md:table-cell lg:px-[.16rem]">
                <AddressLink address={t.address} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function KeyValue({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="divide-y divide-ink/10 overflow-hidden rounded-[.16rem] bg-white lg:rounded-[.24rem]">
      {rows.map(([k, v]) => (
        <div key={k} className="flex flex-col gap-[.04rem] px-[.16rem] py-[.12rem] md:flex-row md:items-center md:justify-between lg:px-[.16rem] lg:py-[.16rem]">
          <dt className="text-[.13rem] text-ink/55 lg:text-[.17rem]">{k}</dt>
          <dd className="text-[.13rem] break-all text-ink lg:text-[.17rem]">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

export function DocsPage() {
  const ids = DOCS.sections.map((s) => s.id)
  const active = useActiveSection(ids)
  const title = (id: string) => DOCS.sections.find((s) => s.id === id)?.title ?? id

  return (
    <>
      <Header page="docs" />
      <main className="min-h-screen bg-paper">
        <div className="bg-linear-to-b from-accent to-[rgba(var(--accent-rgb),0)] pb-[.5rem] lg:pt-[1.26rem] lg:pb-[.9rem]">
          <div className="block lg:hidden">
            <MobileHeader />
          </div>
          <div className="mx-auto max-w-[11.2rem] px-[.24rem] pt-[.4rem] lg:px-[.4rem] lg:pt-[.8rem]">
            <p className="mb-[.12rem] text-[.12rem] tracking-[.2em] text-ink/60 uppercase lg:text-[.16rem]">Documentation</p>
            <h1 className="mb-[.16rem] text-[.4rem] leading-none text-ink lg:mb-[.24rem] lg:text-[.96rem]">{DOCS.title}</h1>
            <p className="max-w-[7.6rem] text-[.15rem] leading-relaxed text-ink/70 lg:text-[.24rem]">{DOCS.intro}</p>
          </div>
        </div>

        <div className="mx-auto grid max-w-[11.2rem] gap-[.4rem] px-[.24rem] pb-[.8rem] lg:grid-cols-[2.4rem_1fr] lg:gap-[.8rem] lg:px-[.4rem] lg:pb-[1.4rem]">
          <nav className="hidden lg:block" aria-label="On this page">
            <ul className="sticky top-[1.5rem] flex flex-col gap-[.04rem] border-l border-ink/10">
              {DOCS.sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={`-ml-px block border-l-2 py-[.06rem] pl-[.2rem] text-[.17rem] transition-colors ${
                      active === s.id ? 'border-ink font-semibold text-ink' : 'border-transparent text-ink/50 hover:text-ink'
                    }`}
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex min-w-0 flex-col gap-[.5rem] lg:gap-[.8rem]">
            <Section id="overview" title={title('overview')}>
              {DOCS.overview.map((p) => (
                <P key={p}>{p}</P>
              ))}
            </Section>

            <Section id="methodology" title={title('methodology')}>
              <P>{DOCS.methodology.lead}</P>
              <ol className="grid gap-[.12rem] md:grid-cols-2 lg:gap-[.2rem]">
                {DOCS.methodology.steps.map((s, i) => (
                  <li key={s.title} className="rounded-[.16rem] bg-neutral p-[.18rem] transition-colors hover:bg-accent lg:rounded-[.24rem] lg:p-[.28rem]">
                    <span className="mb-[.08rem] block text-[.12rem] text-ink/45 tabular-nums lg:text-[.15rem]">{formatRank(i + 1)}</span>
                    <h3 className="mb-[.06rem] text-[.17rem] font-semibold text-ink lg:mb-[.1rem] lg:text-[.24rem]">{s.title}</h3>
                    <p className="text-[.14rem] leading-relaxed text-ink/70 lg:text-[.18rem]">{s.body}</p>
                  </li>
                ))}
              </ol>
            </Section>

            <Section id="constituents" title={title('constituents')}>
              <P>The index right now, ranked by market cap. This table updates itself every 60 seconds.</P>
              <LiveTable />
            </Section>

            <Section id="holding" title={title('holding')}>
              {DOCS.holding.map((p) => (
                <P key={p}>{p}</P>
              ))}
            </Section>

            <Section id="claiming" title={title('claiming')}>
              <P>{DOCS.claiming.lead}</P>
              <ol className="mb-[.16rem] flex flex-col gap-[.08rem]">
                {DOCS.claiming.steps.map((s, i) => (
                  <li key={s} className="flex gap-[.12rem] rounded-[.14rem] bg-white p-[.14rem] lg:p-[.2rem]">
                    <span className="flex h-[.26rem] w-[.26rem] shrink-0 items-center justify-center rounded-full bg-ink text-[.12rem] font-semibold text-accent lg:h-[.34rem] lg:w-[.34rem] lg:text-[.15rem]">
                      {i + 1}
                    </span>
                    <span className="text-[.15rem] leading-relaxed text-ink/80 lg:text-[.2rem]">{s}</span>
                  </li>
                ))}
              </ol>
              <p className="rounded-[.14rem] border border-dashed border-ink/25 p-[.14rem] text-[.14rem] text-ink/60 lg:p-[.2rem] lg:text-[.18rem]">
                {DOCS.claiming.note}
              </p>
            </Section>

            <Section id="contracts" title={title('contracts')}>
              <P>Everything the index uses is public. Check any of it on the Robinhood Chain explorer.</P>
              <KeyValue
                rows={[
                  ['Network', `${CHAIN.name} (chain id ${CHAIN.chainId})`],
                  [
                    'Explorer',
                    <a key="e" href={CHAIN.explorer} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                      robinhoodchain.blockscout.com
                    </a>,
                  ],
                  ['Public RPC', CHAIN.rpc],
                  ['T10L token contract', DOCS.tba],
                  ...LONG_LAUNCHERS.map((l): [string, React.ReactNode] => [l.label, <AddressLink key={l.address} address={l.address} />]),
                  ['Launch event', <code key="ev" className="font-mono text-[.12rem] lg:text-[.15rem]">{LAUNCH_EVENT}</code>],
                  [
                    'Market data',
                    <a key="d" href="https://docs.dexscreener.com/api/reference" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                      DexScreener API
                    </a>,
                  ],
                ]}
              />
            </Section>

            <Section id="faq" title={title('faq')}>
              <div className="flex flex-col gap-[.08rem]">
                {DOCS.faq.map((f) => (
                  <details key={f.q} className="group rounded-[.14rem] bg-white px-[.16rem] py-[.12rem] lg:px-[.16rem] lg:py-[.18rem]">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-[.16rem] font-semibold text-ink lg:text-[.22rem]">
                      {f.q}
                      <span className="text-ink/40 transition-transform group-open:rotate-45" aria-hidden="true">
                        +
                      </span>
                    </summary>
                    <p className="mt-[.08rem] text-[.14rem] leading-relaxed text-ink/70 lg:text-[.19rem]">{f.a}</p>
                  </details>
                ))}
              </div>
            </Section>
          </div>
        </div>

        <footer className="bg-ink px-[.24rem] py-[.32rem] text-white lg:px-[.65rem] lg:py-[.5rem]">
          <div className="mx-auto flex max-w-[11.2rem] flex-col gap-[.2rem] md:flex-row md:items-center md:justify-between">
            <a href={LINKS.home} aria-label="Top10Long home">
              <Logo className="h-[.3rem] w-auto lg:h-[.4rem]" color="#ffd23f" />
            </a>
            <div className="flex flex-col gap-[.06rem] text-[.12rem] text-white/70 md:items-end lg:text-[.16rem]">
              <p>{FOOTER.line}</p>
              <nav className="flex gap-[.16rem]" aria-label="Footer">
                {FOOTER_LINKS.map((l) => (
                  <a key={l.label} href={l.href} className="underline-offset-4 hover:underline">
                    {l.label}
                  </a>
                ))}
              </nav>
            </div>
            <SocialLinks tone="dark" className="justify-start" hoverScale="hover:scale-110" />
          </div>
        </footer>
      </main>
    </>
  )
}
