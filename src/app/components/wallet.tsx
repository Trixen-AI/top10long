import type { ReactNode } from 'react'
import { useAppKit } from '@reown/appkit/react'
import { useConnection, useSwitchChain } from 'wagmi'
import { hasProjectId, robinhood } from '@/app/config/appkit'
import { shortAddress } from '@/app/lib/format'
import { Button, Notice } from '@/app/components/ui'

// Only rendered when AppKit exists (useAppKit throws before createAppKit runs).
function LiveConnectButton({ compact }: { compact?: boolean }) {
  const { open } = useAppKit()
  const { address, isConnected, chainId } = useConnection()
  if (isConnected && address) {
    const wrong = chainId !== robinhood.id
    return (
      <button
        type="button"
        onClick={() => open({ view: wrong ? 'Networks' : 'Account' })}
        className="inline-flex cursor-pointer items-center gap-[.06rem] rounded-full bg-ink px-[.12rem] py-[.07rem] text-[.12rem] font-bold text-white transition hover:scale-[1.03] lg:px-[.22rem] lg:py-[.12rem] lg:text-[.17rem]"
      >
        <span className={`h-[.07rem] w-[.07rem] rounded-full lg:h-[.1rem] lg:w-[.1rem] ${wrong ? 'bg-down' : 'bg-accent'}`} aria-hidden="true" />
        {wrong ? 'Wrong network' : shortAddress(address)}
      </button>
    )
  }
  return (
    <Button onClick={() => open({ view: 'Connect' })}>{compact ? 'Connect' : 'Connect wallet'}</Button>
  )
}

export function ConnectButton({ compact }: { compact?: boolean }) {
  if (!hasProjectId) {
    return (
      <span title="Set VITE_REOWN_PROJECT_ID to enable wallet connection">
        <Button disabled>{compact ? 'Connect' : 'Connect wallet'}</Button>
      </span>
    )
  }
  return <LiveConnectButton compact={compact} />
}

/** Shows children only for a connected wallet on Robinhood Chain; otherwise the step that is missing. */
export function WalletGate({ children, what }: { children: ReactNode; what: string }) {
  const { isConnected, chainId } = useConnection()
  const { switchChain, isPending } = useSwitchChain()
  if (!hasProjectId) {
    return (
      <Notice title="Wallet connection is not configured" tone="dashed">
        Add your Reown project id as <code className="font-mono">VITE_REOWN_PROJECT_ID</code> in <code className="font-mono">.env.local</code> and restart the
        dev server.
      </Notice>
    )
  }
  if (!isConnected) {
    return <Notice title={`Connect a wallet to see ${what}`}>Use Connect in the top right. Balances are read straight from Robinhood Chain for the address you connect.</Notice>
  }
  if (chainId !== robinhood.id) {
    return (
      <Notice
        title="Your wallet is on another network"
        tone="accent"
        action={
          <Button onClick={() => switchChain({ chainId: robinhood.id })} disabled={isPending}>
            {isPending ? 'Switching…' : 'Switch to Robinhood Chain'}
          </Button>
        }
      >
        T10L and every Long.xyz token live on Robinhood Chain (chain id 4663).
      </Notice>
    )
  }
  return <>{children}</>
}
