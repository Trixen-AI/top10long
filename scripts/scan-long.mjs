// Finds every token launched through Long.xyz and writes the largest ones by market cap
// to public/data/long-candidates.json. The site then refreshes live prices for this pool
// from DexScreener every 60s and ranks the top 10 in the browser.
//
//   npm run scan:long
//
// What counts as a Long.xyz token: an asset emitted in a LaunchCreated event by one of
// Long.xyz's official launcher contracts on Robinhood Chain (chain id 4663).
//   v1 LongLauncher              0x22e99278308B393ea1260859B181AD7E78f5eeED (from block 8,636,038)
//   v2 launcher (ERC1967Proxy)   0x1eef016f22a943abc7dd11422edee9d235942104 (from block 56,086,428)
// Both verified on https://robinhoodchain.blockscout.com. Genuine launches also end in "1e18".
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(root, 'public/data/long-candidates.json')

const RPC = 'https://rpc.mainnet.chain.robinhood.com'
const LAUNCH_CREATED = '0xadc6f1f726f7c710f77ec06adc75f3bb964e5be19581b072c67f7b9b4039267b'
const LAUNCHERS = [
  { address: '0x22e99278308B393ea1260859B181AD7E78f5eeED', fromBlock: 8_636_038 },
  { address: '0x1eef016f22a943abc7dd11422edee9d235942104', fromBlock: 56_086_428 },
]
const DEX = 'https://api.dexscreener.com/tokens/v1/robinhood/'
const POOL_SIZE = 200

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a)

let rpcId = 0
async function rpc(method, params, tries = 30) {
  for (let i = 0; i < tries; i++) {
    let res
    try {
      res = await fetch(RPC, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: ++rpcId, method, params }),
        signal: AbortSignal.timeout(90_000),
      })
    } catch (e) {
      log('rpc network error, retrying', e.message)
      await sleep(5_000)
      continue
    }
    const j = await res.json().catch(() => ({}))
    if (j.result !== undefined) return j.result
    const msg = j.error?.message ?? `HTTP ${res.status}`
    if (res.status === 429 || j.error?.code === 429 || /rate limit/i.test(msg)) {
      await sleep(12_000)
      continue
    }
    const err = new Error(msg)
    err.rpc = j.error
    throw err
  }
  throw new Error(`rpc ${method}: gave up after ${tries} tries`)
}

const hex = (n) => '0x' + n.toString(16)

// Pull LaunchCreated logs in block windows; halve the window when the node times out.
async function launchesFrom(launcher, toBlock) {
  const assets = []
  let from = launcher.fromBlock
  let step = 4_000_000
  while (from <= toBlock) {
    const to = Math.min(from + step - 1, toBlock)
    try {
      const logs = await rpc('eth_getLogs', [
        { address: launcher.address, topics: [LAUNCH_CREATED], fromBlock: hex(from), toBlock: hex(to) },
      ])
      for (const l of logs) assets.push({ address: '0x' + l.topics[2].slice(26), block: parseInt(l.blockNumber, 16) })
      log(`${launcher.address.slice(0, 8)} ${from}-${to}: ${logs.length} launches (total ${assets.length})`)
      from = to + 1
      if (logs.length < 2_000 && step < 8_000_000) step *= 2
    } catch (e) {
      if (step <= 25_000) throw e
      step = Math.floor(step / 2)
      log(`window too large (${e.message}), trying ${step} blocks`)
    }
  }
  return assets
}

async function dexBatch(addresses) {
  for (let i = 0; i < 12; i++) {
    const res = await fetch(DEX + addresses.join(','), { signal: AbortSignal.timeout(30_000) }).catch(() => null)
    if (res?.ok) return res.json()
    await sleep(res?.status === 429 ? 15_000 : 3_000)
  }
  throw new Error('DexScreener kept failing')
}

// The pair with the deepest liquidity speaks for the token. DexScreener also returns pairs
// where the requested token is the quote side, so only pairs whose base token is a Long
// launch count.
function bestPairs(pairs, launches) {
  const by = new Map()
  for (const p of pairs) {
    const addr = p.baseToken?.address?.toLowerCase()
    if (!addr || !launches.has(addr)) continue
    const prev = by.get(addr)
    if (!prev || (p.liquidity?.usd ?? 0) > (prev.liquidity?.usd ?? 0)) by.set(addr, p)
  }
  return by
}

async function main() {
  const latest = parseInt(await rpc('eth_blockNumber', []), 16)
  log('latest block', latest)

  const seen = new Map()
  for (const launcher of LAUNCHERS) {
    for (const a of await launchesFrom(launcher, latest)) seen.set(a.address.toLowerCase(), a)
  }
  const all = [...seen.keys()]
  log(`${all.length} Long.xyz launches found`)

  const found = new Map()
  const BATCH = 30
  const CONCURRENCY = 4
  for (let i = 0; i < all.length; i += BATCH * CONCURRENCY) {
    const group = []
    for (let k = 0; k < CONCURRENCY; k++) {
      const slice = all.slice(i + k * BATCH, i + (k + 1) * BATCH)
      if (slice.length) group.push(dexBatch(slice))
    }
    for (const pairs of await Promise.all(group)) {
      for (const [a, p] of bestPairs(pairs, seen)) {
        const prev = found.get(a)
        if (!prev || (p.liquidity?.usd ?? 0) > (prev.liquidity?.usd ?? 0)) found.set(a, p)
      }
    }
    if ((i / (BATCH * CONCURRENCY)) % 25 === 0) log(`DexScreener ${Math.min(i + BATCH * CONCURRENCY, all.length)}/${all.length}, ${found.size} with pairs`)
    await sleep(900)
  }

  const ranked = [...found.values()]
    .map((p) => ({
      address: p.baseToken.address,
      symbol: p.baseToken.symbol,
      name: p.baseToken.name,
      marketCapUsd: p.marketCap ?? p.fdv ?? 0,
    }))
    .filter((t) => t.marketCapUsd > 0)
    .sort((a, b) => b.marketCapUsd - a.marketCapUsd)

  const out = {
    generatedAt: new Date().toISOString(),
    scanBlock: latest,
    launchers: LAUNCHERS,
    launchCreatedTopic: LAUNCH_CREATED,
    totalLaunches: all.length,
    withDexPairs: found.size,
    candidates: ranked.slice(0, POOL_SIZE),
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n')
  log(`wrote ${out.candidates.length} candidates to public/data/long-candidates.json`)
  console.table(ranked.slice(0, 12).map((t, i) => ({ rank: i + 1, symbol: t.symbol, name: t.name, mcap: Math.round(t.marketCapUsd), address: t.address })))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
