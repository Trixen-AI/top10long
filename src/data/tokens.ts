// Number formatting for live token data (see src/lib/longIndex.ts for where the data comes from).

export const formatCap = (usd: number) =>
  usd >= 1e9 ? `$${(usd / 1e9).toFixed(2)}B` : usd >= 1e6 ? `$${(usd / 1e6).toFixed(2)}M` : `$${(usd / 1e3).toFixed(1)}K`

export const formatChange = (pct: number) => `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`

export const formatRank = (rank: number) => String(rank).padStart(2, '0')

/** Prices of memecoins span many orders of magnitude; keep 4 significant digits. */
export function formatPrice(usd: number) {
  if (!usd) return '$0'
  if (usd >= 1) return `$${usd.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  if (usd >= 0.0001) return `$${usd.toPrecision(4)}`
  // e.g. 0.00000123 -> $0.0₅123 (subscript counts the zeros after the point)
  const zeros = Math.floor(-Math.log10(usd)) - 1
  const digits = Math.round(usd * 10 ** (zeros + 4)).toString()
  const sub = String(zeros).replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)])
  return `$0.0${sub}${digits}`
}
