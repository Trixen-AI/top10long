import { useMemo } from 'react'
import { erc20Abi, formatUnits, type Address } from 'viem'
import { useBalance, useConnection, useReadContracts } from 'wagmi'
import { robinhood } from '@/app/config/appkit'
import { ENV } from '@/app/config/env'
import { useLongIndex } from '@/hooks/useLongIndex'
import type { LiveToken } from '@/lib/longIndex'

export type Holding = {
  token: LiveToken
  raw: bigint
  decimals: number
  amount: number
  valueUsd: number
}

const REFRESH_MS = 30_000

/** Real balances of the connected wallet for every live index token and T10L, via Multicall3. */
export function useHoldings() {
  const { address, isConnected, chainId } = useConnection()
  const { tokens } = useLongIndex()
  const onChain = chainId === robinhood.id

  const tokenAddresses = useMemo(() => tokens.map((t) => t.address as Address), [tokens])

  const contracts = useMemo(() => {
    if (!address) return []
    const list: { address: Address; abi: typeof erc20Abi; functionName: 'balanceOf' | 'decimals'; args?: readonly [Address]; chainId: number }[] = []
    for (const a of tokenAddresses) {
      list.push({ address: a, abi: erc20Abi, functionName: 'balanceOf', args: [address], chainId: robinhood.id })
      list.push({ address: a, abi: erc20Abi, functionName: 'decimals', chainId: robinhood.id })
    }
    if (ENV.t10lToken) {
      list.push({ address: ENV.t10lToken, abi: erc20Abi, functionName: 'balanceOf', args: [address], chainId: robinhood.id })
      list.push({ address: ENV.t10lToken, abi: erc20Abi, functionName: 'decimals', chainId: robinhood.id })
    }
    return list
  }, [address, tokenAddresses])

  const reads = useReadContracts({
    contracts,
    allowFailure: true,
    query: { enabled: Boolean(address) && contracts.length > 0, refetchInterval: REFRESH_MS },
  })

  const eth = useBalance({
    address,
    chainId: robinhood.id,
    query: { enabled: Boolean(address), refetchInterval: REFRESH_MS },
  })

  const result = useMemo(() => {
    // The list mixes balanceOf (bigint) and decimals (number), so read each result by its runtime type.
    const data = reads.data as readonly { status: string; result?: unknown }[] | undefined
    const bigintAt = (i: number) => {
      const r = data?.[i]
      return r?.status === 'success' && typeof r.result === 'bigint' ? r.result : null
    }
    const decimalsAt = (i: number) => {
      const r = data?.[i]
      return r?.status === 'success' && r.result !== undefined ? Number(r.result) : 18
    }
    const holdings: Holding[] = []
    let t10l: { raw: bigint; amount: number } | null = null
    if (data) {
      tokens.forEach((token, i) => {
        const raw = bigintAt(i * 2) ?? 0n
        const decimals = decimalsAt(i * 2 + 1)
        const amount = Number(formatUnits(raw, decimals))
        holdings.push({ token, raw, decimals, amount, valueUsd: amount * token.priceUsd })
      })
      if (ENV.t10lToken) {
        const base = tokens.length * 2
        const raw = bigintAt(base)
        if (raw !== null) t10l = { raw, amount: Number(formatUnits(raw, decimalsAt(base + 1))) }
      }
    }
    const held = holdings.filter((h) => h.raw > 0n)
    const totalUsd = held.reduce((s, h) => s + h.valueUsd, 0)
    return { holdings, held, totalUsd, t10l }
  }, [reads.data, tokens])

  return {
    address,
    isConnected,
    onChain,
    ...result,
    eth: eth.data ? Number(formatUnits(eth.data.value, eth.data.decimals)) : null,
    isLoading: reads.isLoading || eth.isLoading,
    isError: reads.isError,
    updatedAt: reads.dataUpdatedAt || null,
    refetch: () => {
      reads.refetch()
      eth.refetch()
    },
  }
}
