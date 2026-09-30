import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import '../index.css'
import { wagmiAdapter } from '@/app/config/appkit'
import { router } from '@/app/router'
import { LongIndexProvider } from '@/hooks/LongIndexProvider'

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: true, retry: 2 } },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <LongIndexProvider>
          <RouterProvider router={router} />
        </LongIndexProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
