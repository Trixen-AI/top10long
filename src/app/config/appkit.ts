// Reown AppKit + wagmi on Robinhood Chain (chain id 4663).
// AppKit is created once, at module load, and only when a project id is configured.
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { defineChain } from '@reown/appkit/networks'
import { fallback, http } from 'viem'
import { robinhood as viemRobinhood } from 'viem/chains'
import { ENV } from '@/app/config/env'

export const robinhood = defineChain({
  ...viemRobinhood,
  chainNamespace: 'eip155',
  caipNetworkId: 'eip155:4663',
})

// Your own RPC first (if set), then the public ones; the official RPC is rate limited.
const rpcs = [ENV.rpcUrl, ...viemRobinhood.rpcUrls.default.http].filter(Boolean)

export const hasProjectId = ENV.reownProjectId.length > 0

export const wagmiAdapter = new WagmiAdapter({
  networks: [robinhood],
  projectId: ENV.reownProjectId || 'missing-project-id',
  transports: { [robinhood.id]: fallback(rpcs.map((url) => http(url, { batch: true }))) },
})

if (hasProjectId) {
  createAppKit({
    adapters: [wagmiAdapter],
    networks: [robinhood],
    defaultNetwork: robinhood,
    projectId: ENV.reownProjectId,
    metadata: {
      name: 'Top10Long',
      description: 'The Long.xyz Top 10 Token Index on Robinhood Chain.',
      url: window.location.origin,
      icons: [`${window.location.origin}/brand/logo-500.png`],
    },
    features: { analytics: false, email: false, socials: false },
    themeMode: 'light',
    themeVariables: {
      '--w3m-accent': '#0b0b0c',
      '--w3m-font-family': "'Geist Variable', ui-sans-serif, system-ui, sans-serif",
      '--w3m-border-radius-master': '3px',
      '--w3m-z-index': 1000,
    },
  })
}
