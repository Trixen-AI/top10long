// Looping scenes for the three mechanism cards. SVG + CSS keyframes (see components.css).
import { MARK } from '@/brand/paths'
import { formatRank } from '@/data/tokens'

const TEN = Array.from({ length: 10 }, (_, i) => i)

/** One coin at the centre of an orbit that carries ten market slabs. Focal point on the left. */
function HoldScene() {
  return (
    <svg className="h-full w-full" viewBox="0 0 1000 440" preserveAspectRatio="xMinYMid slice" aria-hidden="true">
      <rect width="1000" height="440" fill="#f8f6ee" />
      <g stroke="#0b0b0c" strokeOpacity=".06">
        {Array.from({ length: 26 }, (_, i) => (
          <path key={`v${i}`} d={`M${i * 40} 0V440`} />
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <path key={`h${i}`} d={`M0 ${i * 40}H1000`} />
        ))}
      </g>
      <g transform="translate(300 230)">
        <circle r="168" fill="none" stroke="#0b0b0c" strokeOpacity=".22" strokeDasharray="4 10" />
        <circle r="124" fill="none" stroke="#0b0b0c" strokeOpacity=".1" />
        <g className="art-orbit">
          {TEN.map((i) => {
            const a = (i / 10) * Math.PI * 2
            return (
              <g key={i} transform={`translate(${Math.cos(a) * 168} ${Math.sin(a) * 168})`}>
                <g className="art-orbit__counter">
                  <rect x="-30" y="-15" width="60" height="30" rx="15" fill={i % 3 === 0 ? '#0b0b0c' : '#ffffff'} stroke="#0b0b0c" strokeOpacity=".12" />
                  <text
                    y="5"
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="700"
                    fill={i % 3 === 0 ? '#ffd23f' : '#0b0b0c'}
                    fontFamily="Geist Variable, sans-serif"
                  >
                    {formatRank(i + 1)}
                  </text>
                </g>
              </g>
            )
          })}
        </g>
        <circle r="92" fill="#f2b705" />
        <circle r="86" fill="#ffd23f" className="art-coin" />
        <g transform="translate(-44 -44) scale(1.375)" fill="#0b0b0c">
          <path d={MARK.ring} />
          <path d={MARK.arrow} />
        </g>
      </g>
    </svg>
  )
}

/** Ten tokens drop one after another into a wallet tray. Focal point on the right. */
function ClaimScene() {
  return (
    <svg className="h-full w-full" viewBox="0 0 1000 440" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="claim-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbf9f1" />
          <stop offset="1" stopColor="#ffe89a" />
        </linearGradient>
      </defs>
      <rect width="1000" height="440" fill="url(#claim-bg)" />
      <g transform="translate(700 0)">
        {TEN.map((i) => {
          const col = i % 5
          const row = Math.floor(i / 5)
          const x = -120 + col * 60
          const y = 318 - row * 46
          return (
            <g key={i} className="art-drop" style={{ animationDelay: `${i * 0.28}s` }}>
              <g transform={`translate(${x} ${y})`}>
                <circle r="22" fill={i === 0 ? '#0b0b0c' : '#ffd23f'} stroke="#0b0b0c" strokeWidth="2" />
                <text
                  y="5"
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="700"
                  fill={i === 0 ? '#ffd23f' : '#0b0b0c'}
                  fontFamily="Geist Variable, sans-serif"
                >
                  {formatRank(i + 1)}
                </text>
              </g>
            </g>
          )
        })}
        <path d="M-190 330h340a24 24 0 0 1 24 24v42a24 24 0 0 1-24 24h-340a24 24 0 0 1-24-24v-42a24 24 0 0 1 24-24Z" fill="#0b0b0c" />
        <rect x="-150" y="366" width="120" height="10" rx="5" fill="#ffd23f" />
        <rect x="-150" y="386" width="70" height="8" rx="4" fill="#ffffff" fillOpacity=".35" />
        <circle cx="110" cy="375" r="14" fill="#ffd23f" />
      </g>
      <g fill="#0b0b0c" fillOpacity=".08">
        <circle cx="120" cy="90" r="56" />
        <circle cx="220" cy="330" r="30" />
      </g>
    </svg>
  )
}

/** A leaderboard of ten bars that keeps reshuffling. Focal point on the left. */
function RankScene() {
  const widths = [520, 440, 400, 350, 320, 280, 250, 210, 180, 150]
  return (
    <svg className="h-full w-full" viewBox="0 0 1000 440" preserveAspectRatio="xMinYMid slice" aria-hidden="true">
      <rect width="1000" height="440" fill="#0b0b0c" />
      <g transform="translate(70 42)">
        {TEN.map((i) => (
          <g key={i} transform={`translate(0 ${i * 36})`}>
            <text y="19" fontSize="15" fontWeight="600" fill="#ffd23f" fillOpacity={1 - i * 0.06} fontFamily="Geist Variable, sans-serif">
              {formatRank(i + 1)}
            </text>
            <rect x="44" y="4" width="560" height="20" rx="10" fill="#ffffff" fillOpacity=".06" />
            <rect
              className="art-bar"
              style={{ animationDelay: `${(i * 0.37) % 2.4}s` }}
              x="44"
              y="4"
              width={widths[i]}
              height="20"
              rx="10"
              fill={i === 0 ? '#ffd23f' : '#ffffff'}
              fillOpacity={i === 0 ? 1 : 0.85 - i * 0.06}
            />
          </g>
        ))}
      </g>
    </svg>
  )
}

export function StackArt({ kind }: { kind: 'hold' | 'claim' | 'rank' }) {
  if (kind === 'hold') return <HoldScene />
  if (kind === 'claim') return <ClaimScene />
  return <RankScene />
}
