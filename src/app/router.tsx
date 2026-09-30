import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/app/layout/AppLayout'

// Each page loads on demand; the layout (header, nav, wallet button) ships with the entry.
const page = (load: () => Promise<{ default: React.ComponentType }>) => async () => ({ Component: (await load()).default })

export const router = createBrowserRouter(
  [
    {
      path: '/',
      Component: AppLayout,
      // Shown while the first page's code loads.
      HydrateFallback: () => (
        <div className="flex min-h-screen items-center justify-center bg-paper text-[.16rem] text-ink/50 lg:text-[.2rem]">Loading dashboard…</div>
      ),
      children: [
        { index: true, lazy: page(() => import('@/app/pages/Overview')) },
        { path: 'index', lazy: page(() => import('@/app/pages/IndexPage')) },
        { path: 'portfolio', lazy: page(() => import('@/app/pages/Portfolio')) },
        { path: 'claim', lazy: page(() => import('@/app/pages/Claim')) },
        { path: '*', lazy: page(() => import('@/app/pages/NotFound')) },
      ],
    },
  ],
  { basename: '/app' },
)
