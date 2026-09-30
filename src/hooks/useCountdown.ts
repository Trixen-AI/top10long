import { useEffect, useState } from 'react'

// A repeating countdown: counts `seconds` down to zero, then starts again.
// Used for the DexScreener refresh (60s) and the placeholder holder window.
export function useCountdown(seconds: number) {
  const [left, setLeft] = useState(seconds)
  useEffect(() => {
    const started = Date.now()
    const id = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - started) / 1000)
      setLeft(seconds - (elapsed % seconds))
    }, 1000)
    return () => window.clearInterval(id)
  }, [seconds])
  return left
}

export const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
