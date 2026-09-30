import { createContext, useContext } from 'react'
import type { LiveToken } from '@/lib/longIndex'

/** A change in index membership seen between two live refreshes. */
export type MembershipChange = { at: number; entered: string[]; left: string[] }

export type LongIndexState = {
  status: 'loading' | 'ready' | 'error'
  tokens: LiveToken[]
  updatedAt: number | null
  nextRefreshAt: number | null
  changes: MembershipChange[]
}

export const LongIndexContext = createContext<LongIndexState>({
  status: 'loading',
  tokens: [],
  updatedAt: null,
  nextRefreshAt: null,
  changes: [],
})

export function useLongIndex() {
  return useContext(LongIndexContext)
}
