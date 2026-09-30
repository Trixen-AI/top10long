// Live Long.xyz top 10, computed in the browser.
//
// 1. Candidate pool: public/data/long-candidates.json, written by `npm run scan:long`
//    (every token launched by Long.xyz's official launcher contracts, largest first).
// 2. New launches since that scan are read once per visit from the Robinhood Chain RPC
//    (best effort: the public RPC is rate limited, so a failure is skipped quietly).
// 3. Prices and market caps come from DexScreener for the pool, then the ten largest
//    by market cap make the index.

export type LiveToken = {
  rank: number
  address: string
  ticker: string
  name: string
  priceUsd: number
  marketCapUsd: number
  change24h: number
  liquidityUsd: number
  volume24hUsd: number
  imageUrl?: string
  pairUrl: string
}

type Candidate = { address: string; symbol: string; name: string; marketCapUsd: number }
type CandidateFile = { scanBlock: number; candidates: Candidate[] }

type DexPair = {
  url: string
  baseToken: { address: string; name: string; symbol: string }
  priceUsd?: string
  marketCap?: number
  fdv?: number
  liquidity?: { usd?: number }
  volume?: { h24?: number }
  priceChange?: { h24?: number }
  info?: { imageUrl?: string }
}

export const REFRESH_MS = 60_000

const DEX = 'https://api.dexscreener.com/tokens/v1/robinhood/'
// Official RPC first, then the secondary public RPC listed for Robinhood Chain (both allow browser calls).
const RPCS = ['https://rpc.mainnet.chain.robinhood.com', 'https://rpc.ordofi.network']
const LAUNCH_CREATED = '0xadc6f1f726f7c710f77ec06adc75f3bb964e5be19581b072c67f7b9b4039267b'
// The launcher Long.xyz uses today (v2). v1 is paused, so only v2 can add new tokens.
const CURRENT_LAUNCHER = '0x1eef016f22a943abc7dd11422edee9d235942104'
const LIVE_POOL = 150

export async function loadCandidates(): Promise<CandidateFile> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/long-candidates.json`, { cache: 'no-store' })
  if (!res.ok) throw new Error('candidate list missing')
  return res.json()
}

async function rpc<T>(method: string, params: unknown[]): Promise<T> {
  let lastError: unknown
  for (const url of RPCS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
        signal: AbortSignal.timeout(20_000),
      })
      const j = await res.json()
      if (j.result !== undefined) return j.result as T
      lastError = new Error(j.error?.message ?? 'rpc error')
    } catch (e) {
      lastError = e
    }
  }
  throw lastError
}

/** Tokens launched after the scan block. Returns [] if the RPC is busy. */
export async function newLaunchesSince(scanBlock: number): Promise<string[]> {
  try {
    const latest = parseInt(await rpc<string>('eth_blockNumber', []), 16)
    const found: string[] = []
    const STEP = 1_000_000
    for (let from = scanBlock + 1; from <= latest; from += STEP) {
      const to = Math.min(from + STEP - 1, latest)
      const logs = await rpc<{ topics: string[] }[]>('eth_getLogs', [
        { address: CURRENT_LAUNCHER, topics: [LAUNCH_CREATED], fromBlock: `0x${from.toString(16)}`, toBlock: `0x${to.toString(16)}` },
      ])
      for (const l of logs) found.push(`0x${l.topics[2].slice(26)}`)
    }
    return found
  } catch {
    return []
  }
}

/** Live DexScreener data for many tokens, 30 per request, deepest-liquidity pair per token. */
export async function fetchPairs(addresses: string[]): Promise<Map<string, DexPair>> {
  const batches: string[][] = []
  for (let i = 0; i < addresses.length; i += 30) batches.push(addresses.slice(i, i + 30))
  const results = await Promise.all(
    batches.map(async (b) => {
      const res = await fetch(DEX + b.join(','), { signal: AbortSignal.timeout(20_000) })
      if (!res.ok) throw new Error(`DexScreener ${res.status}`)
      return (await res.json()) as DexPair[]
    }),
  )
  // DexScreener also returns pairs where a requested token is the quote side;
  // only pairs whose base token was requested (a Long.xyz launch) count.
  const wanted = new Set(addresses.map((a) => a.toLowerCase()))
  const best = new Map<string, DexPair>()
  for (const p of results.flat()) {
    const key = p.baseToken?.address?.toLowerCase()
    if (!key || !wanted.has(key)) continue
    const prev = best.get(key)
    if (!prev || (p.liquidity?.usd ?? 0) > (prev.liquidity?.usd ?? 0)) best.set(key, p)
  }
  return best
}

export const capOf = (p: DexPair) => p.marketCap ?? p.fdv ?? 0

/** Live DexScreener quote for one token (used for T10L once its address is set). */
export async function fetchQuote(address: string) {
  const pairs = await fetchPairs([address])
  const p = pairs.get(address.toLowerCase())
  if (!p) return null
  return { priceUsd: Number(p.priceUsd ?? 0), marketCapUsd: capOf(p), change24h: p.priceChange?.h24 ?? 0, pairUrl: p.url }
}

export function rankTopTen(pairs: Map<string, DexPair>): LiveToken[] {
  return [...pairs.values()]
    .filter((p) => capOf(p) > 0)
    .sort((a, b) => capOf(b) - capOf(a))
    .slice(0, 10)
    .map((p, i) => ({
      rank: i + 1,
      address: p.baseToken.address,
      ticker: p.baseToken.symbol,
      name: p.baseToken.name,
      priceUsd: Number(p.priceUsd ?? 0),
      marketCapUsd: capOf(p),
      change24h: p.priceChange?.h24 ?? 0,
      liquidityUsd: p.liquidity?.usd ?? 0,
      volume24hUsd: p.volume?.h24 ?? 0,
      imageUrl: p.info?.imageUrl,
      pairUrl: p.url,
    }))
}

/** Pool of addresses to price on each refresh: the largest known caps first. */
export function poolFrom(caps: Map<string, number>): string[] {
  return [...caps.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, LIVE_POOL)
    .map(([a]) => a)
}
