// Navigation, links and social profiles in one place.

// Links work from every page (home, /docs/ and the /app/ dashboard).
export const LINKS = {
  home: '/',
  index: '/#top-ten',
  claim: '/#claim',
  docs: '/docs/',
  methodology: '/docs/#methodology',
  claiming: '/docs/#claiming',
  contracts: '/docs/#contracts',
  app: '/app/',
  longxyz: 'https://long.xyz',
} as const

export type NavChild = {
  label: string
  subtitle?: string
  href: string
  icon?: 'rank' | 'claim' | 'chain'
  external?: boolean
}

export type Page = 'home' | 'docs'

export type NavItem =
  | { label: string; href: string; kind: 'link'; page?: Page }
  | { label: string; kind: 'menu'; children: NavChild[]; page?: Page }
  | { label: string; href: string; kind: 'app' }

export const NAV: NavItem[] = [
  { label: 'Home', href: LINKS.home, kind: 'link', page: 'home' },
  {
    label: 'Index',
    kind: 'menu',
    children: [
      { label: 'Top 10 tokens', subtitle: 'The ten largest Long.xyz markets, ranked by market cap', href: LINKS.index, icon: 'rank' },
      { label: 'Claim', subtitle: 'Holder window countdown and what you can claim', href: LINKS.claim, icon: 'claim' },
      { label: 'On Robinhood Chain', subtitle: 'Where T10L lives and settles', href: LINKS.contracts, icon: 'chain' },
    ],
  },
  {
    label: 'Documentation',
    kind: 'menu',
    page: 'docs',
    children: [
      { label: 'Docs', href: LINKS.docs },
      { label: 'Index methodology', href: LINKS.methodology },
    ],
  },
  { label: 'Launch App', href: LINKS.app, kind: 'app' },
]

// Social profiles. The icon is X's official mark (see src/components/ui/SocialIcon.tsx).
export const SOCIALS = [{ key: 'x', label: 'Top10Long on X', href: 'https://x.com/Top10Long' }] as const

export type SocialKey = (typeof SOCIALS)[number]['key']

export const FOOTER_LINKS = [
  { label: 'Index', href: LINKS.index },
  { label: 'Claim', href: LINKS.claim },
  { label: 'Docs', href: LINKS.docs },
]
