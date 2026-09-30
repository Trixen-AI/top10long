import { useQuery } from '@tanstack/react-query'
import { ENV } from '@/app/config/env'
import { fetchQuote } from '@/lib/longIndex'

/** Live DexScreener quote for T10L, once its token address is configured. */
export function useT10LQuote() {
  return useQuery({
    queryKey: ['t10l-quote', ENV.t10lToken],
    queryFn: () => fetchQuote(ENV.t10lToken!),
    enabled: Boolean(ENV.t10lToken),
    refetchInterval: 60_000,
  })
}
