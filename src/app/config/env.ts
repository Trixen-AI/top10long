import { isAddress, type Address } from 'viem'

const read = (v: string | undefined) => (v ?? '').trim()
const addressOrNull = (v: string | undefined): Address | null => {
  const s = read(v)
  return isAddress(s) ? (s as Address) : null
}

export const ENV = {
  reownProjectId: read(import.meta.env.VITE_REOWN_PROJECT_ID),
  t10lToken: addressOrNull(import.meta.env.VITE_T10L_TOKEN_ADDRESS),
  t10lClaim: addressOrNull(import.meta.env.VITE_T10L_CLAIM_ADDRESS),
  rpcUrl: read(import.meta.env.VITE_ROBINHOOD_RPC_URL),
}

export const EXPLORER = 'https://robinhoodchain.blockscout.com'
export const explorerAddress = (a: string) => `${EXPLORER}/address/${a}`
export const explorerTx = (h: string) => `${EXPLORER}/tx/${h}`
