import { useSyncExternalStore } from 'react'

// Matches the layout breakpoint (Tailwind `lg`, 64rem = 1024px).
const QUERY = '(max-width: 1023.98px)'

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

export function useIsMobile() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  )
}
