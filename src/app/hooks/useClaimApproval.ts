import { useCallback, useMemo, useState } from 'react'
import type { Address, Hex } from 'viem'
import { useConnection, usePublicClient, useSignTypedData } from 'wagmi'
import { robinhood } from '@/app/config/appkit'
import { ENV } from '@/app/config/env'

// Step 1 of a claim: the holder approves it with an EIP-712 signature.
// It is free (no gas, no transaction) and works with or without the claim contract.
// When the contract is configured it becomes the typed-data verifying contract.

const STATEMENT = 'I approve claiming the Top10Long index tokens to this wallet.'
const VALID_MS = 24 * 60 * 60 * 1000

const DOMAIN = {
  name: 'Top10Long',
  version: '1',
  chainId: robinhood.id,
  ...(ENV.t10lClaim ? { verifyingContract: ENV.t10lClaim } : {}),
} as const

const TYPES = {
  ClaimApproval: [
    { name: 'account', type: 'address' },
    { name: 'tokens', type: 'address[]' },
    { name: 'issuedAt', type: 'uint256' },
    { name: 'statement', type: 'string' },
  ],
} as const

export type StoredApproval = { signature: Hex; issuedAt: number; tokens: Address[] }

const keyFor = (a: string) => `t10l-claim-approval:${robinhood.id}:${a.toLowerCase()}`

function readStored(address: string | undefined): StoredApproval | null {
  if (!address) return null
  try {
    const raw = window.localStorage.getItem(keyFor(address))
    if (!raw) return null
    const v = JSON.parse(raw) as StoredApproval
    return Date.now() - v.issuedAt * 1000 < VALID_MS ? v : null
  } catch {
    return null
  }
}

export function useClaimApproval(tokens: Address[]) {
  const { address } = useConnection()
  const client = usePublicClient({ chainId: robinhood.id })
  const sign = useSignTypedData()
  const [version, setVersion] = useState(0)
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)

  // Re-read storage when the wallet changes or after approve/revoke (version bump).
  const stored = useMemo(() => {
    void version
    return readStored(address)
  }, [address, version])

  const approve = useCallback(async () => {
    if (!address || !tokens.length) return
    setVerifyError(null)
    const message = { account: address, tokens, issuedAt: BigInt(Math.floor(Date.now() / 1000)), statement: STATEMENT }
    let signature: Hex
    try {
      signature = await sign.signTypedDataAsync({ domain: DOMAIN, types: TYPES, primaryType: 'ClaimApproval', message })
    } catch {
      return // rejected in the wallet; sign.error carries the reason
    }
    setVerifying(true)
    try {
      // verifyTypedData on the chain client also handles smart-contract wallets (ERC-1271 / ERC-6492).
      const ok = client
        ? await client.verifyTypedData({ address, domain: DOMAIN, types: TYPES, primaryType: 'ClaimApproval', message, signature })
        : false
      if (!ok) {
        setVerifyError('The signature did not verify for this wallet.')
        return
      }
      try {
        window.localStorage.setItem(keyFor(address), JSON.stringify({ signature, issuedAt: Number(message.issuedAt), tokens }))
      } catch {
        /* storage unavailable: the approval still holds for this visit */
      }
      setVersion((v) => v + 1)
    } catch (e) {
      setVerifyError(e instanceof Error ? e.message.split('\n')[0] : 'Could not verify the signature.')
    } finally {
      setVerifying(false)
    }
  }, [address, tokens, sign, client])

  const revoke = useCallback(() => {
    if (!address) return
    try {
      window.localStorage.removeItem(keyFor(address))
    } catch {
      /* ignore */
    }
    sign.reset()
    setVersion((v) => v + 1)
  }, [address, sign])

  return {
    approval: stored,
    isApproved: Boolean(stored),
    approve,
    revoke,
    isSigning: sign.isPending,
    isVerifying: verifying,
    error: verifyError ?? (sign.error ? sign.error.message.split('\n')[0] : null),
    expiresAt: stored ? stored.issuedAt * 1000 + VALID_MS : null,
  }
}
