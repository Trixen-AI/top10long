import { useState } from 'react'
import { Header } from '@/components/sections/Header'
import { Hero } from '@/components/sections/Hero'
import { TickerTape } from '@/components/sections/TickerTape'
import { Mechanism } from '@/components/sections/Mechanism'
import { Flow } from '@/components/sections/Flow'
import { SidewaysRun } from '@/components/sections/SidewaysRun'
import { LongIndexProvider } from '@/hooks/LongIndexProvider'

export default function App() {
  // The rest of the page mounts once the hero intro has played, and the
  // sideways run mounts once the card stack has been scrolled through.
  const [introDone, setIntroDone] = useState(false)
  const [stackDone, setStackDone] = useState(false)

  return (
    <LongIndexProvider>
      <Header />
      <main className="bg-paper">
        <Hero onIntroComplete={() => setIntroDone(true)} />
        {introDone && (
          <>
            <TickerTape />
            <div className="mt-0 mb-0 lg:mx-[2.4rem] lg:mt-[.84rem]">
              <Mechanism onStackComplete={() => setStackDone(true)} />
            </div>
            <Flow />
            {stackDone ? <SidewaysRun /> : <div className="hidden h-[300vh] w-full lg:block" />}
          </>
        )}
      </main>
    </LongIndexProvider>
  )
}
