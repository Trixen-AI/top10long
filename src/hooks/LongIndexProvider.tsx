import { useEffect, useState, type ReactNode } from 'react'
import { LongIndexContext, type LongIndexState } from '@/hooks/useLongIndex'
import { REFRESH_MS, capOf, fetchPairs, loadCandidates, newLaunchesSince, poolFrom, rankTopTen } from '@/lib/longIndex'

export function LongIndexProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LongIndexState>({ status: 'loading', tokens: [], updatedAt: null, nextRefreshAt: null, changes: [] })

  useEffect(() => {
    let cancelled = false
    let timer: number | undefined
    let nextAt = 0
    // Last known market cap per candidate; decides which tokens get priced each round.
    const caps = new Map<string, number>()

    const refresh = async () => {
      nextAt = Date.now() + REFRESH_MS
      try {
        const pairs = await fetchPairs(poolFrom(caps))
        for (const [a, p] of pairs) caps.set(a, capOf(p))
        const tokens = rankTopTen(pairs)
        if (!cancelled && tokens.length) {
          const now = Date.now()
          setState((prev) => {
            // Record membership changes against the previous live top 10 (not on the first load).
            let changes = prev.changes
            if (prev.tokens.length) {
              const before = new Set(prev.tokens.map((t) => t.address.toLowerCase()))
              const after = new Set(tokens.map((t) => t.address.toLowerCase()))
              const entered = tokens.filter((t) => !before.has(t.address.toLowerCase())).map((t) => t.ticker)
              const left = prev.tokens.filter((t) => !after.has(t.address.toLowerCase())).map((t) => t.ticker)
              if (entered.length || left.length) changes = [{ at: now, entered, left }, ...changes].slice(0, 20)
            }
            return { status: 'ready', tokens, updatedAt: now, nextRefreshAt: now + REFRESH_MS, changes }
          })
        }
      } catch {
        if (!cancelled) setState((s) => (s.tokens.length ? { ...s, nextRefreshAt: Date.now() + REFRESH_MS } : { ...s, status: 'error' }))
      }
    }

    const schedule = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(async () => {
        if (document.visibilityState === 'visible') await refresh()
        if (!cancelled) schedule()
      }, REFRESH_MS)
    }

    ;(async () => {
      try {
        const file = await loadCandidates()
        for (const c of file.candidates) caps.set(c.address.toLowerCase(), c.marketCapUsd)
        await refresh()
        schedule()
        // Tokens launched after the scan: price them once and keep any with a market cap.
        const fresh = (await newLaunchesSince(file.scanBlock)).filter((a) => !caps.has(a.toLowerCase()))
        if (fresh.length && !cancelled) {
          const pairs = await fetchPairs(fresh)
          let added = false
          for (const [a, p] of pairs) {
            if (capOf(p) > 0) {
              caps.set(a, capOf(p))
              added = true
            }
          }
          if (added) await refresh()
        }
      } catch {
        if (!cancelled) setState((s) => ({ ...s, status: s.tokens.length ? s.status : 'error' }))
      }
    })()

    const onVisible = () => {
      // Catch up straight away when the tab comes back after a missed refresh.
      if (document.visibilityState === 'visible' && nextAt && Date.now() > nextAt) refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return <LongIndexContext.Provider value={state}>{children}</LongIndexContext.Provider>
}
