export const formatUsd = (v: number) => {
  if (!Number.isFinite(v)) return '$0'
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`
  if (v >= 1e3) return `$${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  if (v >= 1) return `$${v.toFixed(2)}`
  if (v > 0) return `$${v.toPrecision(3)}`
  return '$0'
}

/** Token amounts: compact for big numbers, a few significant digits for small ones. */
export const formatAmount = (v: number) => {
  if (!v) return '0'
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`
  if (v >= 1e3) return v.toLocaleString('en-US', { maximumFractionDigits: 2 })
  if (v >= 1) return v.toLocaleString('en-US', { maximumFractionDigits: 4 })
  return v.toPrecision(4)
}

export const shortAddress = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`

export const timeAgo = (at: number, now: number) => {
  const s = Math.max(0, Math.round((now - at) / 1000))
  if (s < 60) return `${s}s ago`
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  return `${Math.round(m / 60)}h ago`
}
