// All page copy for Top10Long (index token: T10L). Plain words, the product's own terms.

export const HERO = {
  line1: 'One token.',
  line2Lead: 'Ten Long.xyz',
  line2Mark: 'markets.',
  body:
    'Hold T10L and claim the top 10 Long.xyz tokens, the largest markets on Robinhood Chain, in a single position. No basket of wallets. No database. One index.',
}

export const TICKER_TAPE = {
  heading: 'Inside the Index',
  loading: 'Loading live Long.xyz markets',
  error: 'Live market data is unavailable right now.',
}

export const MECHANISM = {
  heading: 'Ten Positions, Folded Into One',
  body:
    'Top10Long reads the Long.xyz leaderboard, keeps the ten largest tokens by market cap and lets anyone holding T10L claim them. You watch one balance instead of ten.',
  cards: [
    {
      tags: ['One token', 'Robinhood Chain'],
      title: 'Hold T10L',
      subtitle: 'The whole top 10 in one position',
      body:
        'Hold T10L and you are exposed to the ten largest Long.xyz tokens at once. There is no basket to rebalance by hand, no ten wallets to watch and no spreadsheet to keep in sync.',
      link: 'Read the docs',
      tabSide: 'right',
      art: 'hold',
    },
    {
      tags: ['Holder window', 'Timed'],
      title: 'Claim the Ten',
      subtitle: 'Top 10 tokens, sent to your wallet',
      body:
        'When the holder window opens, T10L holders claim from each of the ten tokens directly on Robinhood Chain. The countdown on this page shows when the next window starts.',
      link: 'How claiming works',
      tabSide: 'left',
      art: 'claim',
    },
    {
      tags: ['By market cap', 'Every 60s'],
      title: 'The Top 10',
      subtitle: 'Ranked from the Long.xyz leaderboard',
      body:
        'The basket is the ten largest Long.xyz tokens by market cap, read from DexScreener and refreshed every 60 seconds. A token that climbs into the ten joins the index. One that falls out leaves it.',
      link: 'Index methodology',
      tabSide: 'right',
      art: 'rank',
    },
  ],
} as const

export const FLOW = {
  heading: 'How Top10Long Works',
  body: 'From the Long.xyz leaderboard to your wallet in five steps. Nothing to rebalance and nothing to track by hand.',
  steps: [
    { key: 'rank', title: 'Rank', body: 'The ten largest Long.xyz tokens by market cap, read from DexScreener.' },
    { key: 'refresh', title: 'Refresh', body: 'The ranking updates every 60 seconds, so the index follows the market.' },
    { key: 'hold', title: 'Hold', body: 'One T10L balance on Robinhood Chain stands for the full top 10.' },
    { key: 'window', title: 'Holder Window', body: 'When the window opens, claims go live for every T10L holder.' },
    { key: 'receive', title: 'Receive', body: 'Each of the ten tokens lands in your own wallet. Nobody holds them for you.' },
  ],
} as const

export const STATS = [
  { label: 'One token', value: 'T10L', note: 'the index' },
  { label: 'Basket', value: 'TOP 10', note: 'largest Long.xyz mcap' },
  { label: 'Claim', value: 'countdown', note: 'holder window' },
] as const

export const CONSTITUENTS = {
  heading: 'Every Market in the Index',
  body:
    'These are the ten tokens T10L holds right now, ranked live by market cap on Long.xyz. Move your pointer across the panel: each capsule is one market, and together they make one position.',
}

export const TOP_TEN_SECTION = {
  heading: 'The Top 10 Right Now',
  more: 'See every market on Long.xyz',
}

export const CONTACT = {
  heading: 'Take the whole top 10 with one token.',
  body: 'Open the app on Robinhood Chain, hold T10L and claim the ten largest Long.xyz tokens when the holder window opens.',
  cta: 'Launch App',
}

export const FOOTER = {
  line: 'Top10Long · Long.xyz Top 10 Token Index · Robinhood Chain',
}
