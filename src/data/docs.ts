// Copy for the /docs/ page. Facts about Long.xyz contracts were checked on-chain
// (robinhoodchain.blockscout.com). Items marked TBA are for the Top10Long team to fill in.

export const CHAIN = {
  name: 'Robinhood Chain',
  chainId: 4663,
  rpc: 'https://rpc.mainnet.chain.robinhood.com',
  explorer: 'https://robinhoodchain.blockscout.com',
}

export const LONG_LAUNCHERS = [
  { label: 'Long.xyz launcher v1 (paused)', address: '0x22e99278308B393ea1260859B181AD7E78f5eeED' },
  { label: 'Long.xyz launcher v2 (current)', address: '0x1eef016f22a943abc7dd11422edee9d235942104' },
]

export const LAUNCH_EVENT =
  'LaunchCreated(address poolOrHook, address asset, address numeraire, address poolInitializer, address launcher, bytes32 tickerKey, uint48 deployedAt, uint48 reservedUntil, string normalizedTicker)'

export const DOCS = {
  title: 'Top10Long Docs',
  intro:
    'Top10Long tracks the ten largest Long.xyz tokens on Robinhood Chain and wraps them into one index token, T10L. This page explains how the ten are chosen, where the numbers come from and how holding and claiming work.',
  sections: [
    { id: 'overview', title: 'Overview' },
    { id: 'methodology', title: 'Index methodology' },
    { id: 'constituents', title: 'Live constituents' },
    { id: 'holding', title: 'Holding T10L' },
    { id: 'claiming', title: 'Claiming' },
    { id: 'contracts', title: 'Contracts and data' },
    { id: 'faq', title: 'FAQ' },
  ],
  overview: [
    'Long.xyz is a token launchpad on Robinhood Chain. Thousands of tokens launch there, and following the ones that matter means watching many charts and many wallets.',
    'Top10Long keeps that list for you. The index always holds the ten Long.xyz tokens with the largest market cap, and T10L is the single token that stands for that basket.',
  ],
  methodology: {
    lead: 'The ranking is rebuilt from public data, with no manual picks.',
    steps: [
      {
        title: 'Only real Long.xyz launches',
        body: 'A token counts as a Long.xyz token only if one of the official Long.xyz launcher contracts emitted a LaunchCreated event for it. Genuine launches also have contract addresses ending in 1e18.',
      },
      {
        title: 'Market cap from DexScreener',
        body: 'For every launch, market cap, price and 24h change are read from DexScreener. When a token trades in several pools, the pool with the deepest liquidity is used.',
      },
      {
        title: 'Ten largest, every 60 seconds',
        body: 'Tokens are sorted by market cap and the top ten form the index. The ranking refreshes every 60 seconds, so a token that climbs into the ten joins, and one that falls out leaves.',
      },
      {
        title: 'New launches included',
        body: 'The full launch history is scanned periodically. Between scans, the site also reads tokens launched since the last scan straight from the Robinhood Chain RPC.',
      },
    ],
  },
  holding: [
    'T10L is one token on Robinhood Chain. Holding it gives you exposure to the whole top 10 without buying, storing or rebalancing ten tokens yourself.',
    'The T10L contract address will be published here and in the app. Until then, treat any token claiming to be T10L as unofficial.',
  ],
  claiming: {
    lead: 'During a holder window, T10L holders can claim the ten index tokens to their own wallet.',
    steps: [
      'Open the app and connect a wallet on Robinhood Chain that holds T10L.',
      'Wait for the holder window. The countdown on the home page shows when the next one opens.',
      'Claim while the window is open. The tokens go straight to your wallet; nobody holds them for you.',
    ],
    note: 'The window schedule, eligibility snapshot and claim amounts will be published before the first window opens.',
  },
  faq: [
    {
      q: 'Why DexScreener?',
      a: 'It lists every Robinhood Chain pool with price, liquidity and market cap in one public API, so anyone can check the same numbers the index uses.',
    },
    {
      q: 'Can a token be added by hand?',
      a: 'No. Membership follows the ranking only. A token needs to be a Long.xyz launch and to be among the ten largest by market cap.',
    },
    {
      q: 'Why does the list sometimes change?',
      a: 'Memecoin market caps move fast. When the tenth and eleventh tokens swap places, the index swaps them on the next refresh.',
    },
    {
      q: 'Is this financial advice?',
      a: 'No. Memecoins are highly volatile and you can lose what you put in.',
    },
  ],
  tba: 'To be announced',
}
