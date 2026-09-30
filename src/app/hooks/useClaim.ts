import { useMemo } from 'react'
import { erc20Abi, formatUnits, type Address } from 'viem'
import { useConnection, useReadContracts, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { robinhood } from '@/app/config/appkit'
import { CLAIM_ABI } from '@/app/config/claimAbi'
import { ENV } from '@/app/config/env'

export type WindowState = 'unconfigured' | 'loading' | 'upcoming' | 'open' | 'closed' | 'unknown'

export type ClaimLine = { token: Address; symbol: string; amount: number; raw: bigint }

/** Holder-window schedule, claimable amounts and the claim transaction, read from the claim contract. */
export function useClaim(now: number) {
  const { address } = useConnection()
  const claimAddress = ENV.t10lClaim

  const schedule = useReadContracts({
    contracts: claimAddress
      ? [
          { address: claimAddress, abi: CLAIM_ABI, functionName: 'windowOpensAt', chainId: robinhood.id },
          { address: claimAddress, abi: CLAIM_ABI, functionName: 'windowClosesAt', chainId: robinhood.id },
        ]
      : [],
    allowFailure: true,
    query: { enabled: Boolean(claimAddress), refetchInterval: 60_000 },
  })

  const claimable = useReadContracts({
    contracts:
      claimAddress && address
        ? [{ address: claimAddress, abi: CLAIM_ABI, functionName: 'claimable', args: [address], chainId: robinhood.id }]
        : [],
    allowFailure: true,
    query: { enabled: Boolean(claimAddress && address), refetchInterval: 30_000 },
  })

  const claimTokens = useMemo(() => {
    const r = claimable.data?.[0]
    if (r?.status !== 'success') return null
    const [tokens, amounts] = r.result as readonly [readonly Address[], readonly bigint[]]
    return { tokens, amounts }
  }, [claimable.data])

  // Symbols and decimals for whatever tokens the contract says are claimable.
  const meta = useReadContracts({
    contracts: (claimTokens?.tokens ?? []).flatMap((t) => [
      { address: t, abi: erc20Abi, functionName: 'symbol' as const, chainId: robinhood.id },
      { address: t, abi: erc20Abi, functionName: 'decimals' as const, chainId: robinhood.id },
    ]),
    allowFailure: true,
    query: { enabled: Boolean(claimTokens?.tokens.length) },
  })

  const lines: ClaimLine[] = useMemo(() => {
    if (!claimTokens) return []
    return claimTokens.tokens.map((token, i) => {
      const sym = meta.data?.[i * 2]
      const dec = meta.data?.[i * 2 + 1]
      const decimals = dec?.status === 'success' ? Number(dec.result) : 18
      const raw = claimTokens.amounts[i] ?? 0n
      return {
        token,
        symbol: sym?.status === 'success' ? String(sym.result) : `${token.slice(0, 6)}…`,
        raw,
        amount: Number(formatUnits(raw, decimals)),
      }
    })
  }, [claimTokens, meta.data])

  const opensAt = schedule.data?.[0]?.status === 'success' ? Number(schedule.data[0].result) * 1000 : null
  const closesAt = schedule.data?.[1]?.status === 'success' ? Number(schedule.data[1].result) * 1000 : null

  let windowState: WindowState = 'unknown'
  if (!claimAddress) windowState = 'unconfigured'
  else if (schedule.isLoading) windowState = 'loading'
  else if (opensAt && closesAt) windowState = now < opensAt ? 'upcoming' : now <= closesAt ? 'open' : 'closed'

  const write = useWriteContract()
  const receipt = useWaitForTransactionReceipt({ hash: write.data, chainId: robinhood.id })

  const claim = () => {
    if (!claimAddress) return
    write.writeContract(
      { address: claimAddress, abi: CLAIM_ABI, functionName: 'claim', chainId: robinhood.id },
      { onSuccess: () => claimable.refetch() },
    )
  }

  return {
    claimAddress,
    windowState,
    opensAt,
    closesAt,
    lines,
    hasClaimable: lines.some((l) => l.raw > 0n),
    claimableLoading: claimable.isLoading,
    claimableError: claimable.isError,
    claim,
    txHash: write.data,
    isSigning: write.isPending,
    writeError: write.error,
    isConfirming: receipt.isLoading,
    isConfirmed: receipt.isSuccess,
    refetch: () => {
      schedule.refetch()
      claimable.refetch()
    },
  }
}
