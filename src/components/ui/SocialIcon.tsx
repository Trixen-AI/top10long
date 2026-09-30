// X's official mark, stored byte-for-byte and inlined unmodified.
//   Source: https://about.x.com/content/dam/about-twitter/x/brand-toolkit/x-logo.zip (logo.svg)
//   The kit ships the SVG in white and a black variant as PNG; the black kit variant is
//   applied through CSS (.social-icon--x.social-icon--light path) on light backgrounds.
import xSvg from '@/assets/social/x-logo.svg?raw'
import type { SocialKey } from '@/data/site'

type Tone = 'light' | 'dark'

const SVGS: Record<SocialKey, string> = { x: xSvg }

export function SocialIcon({ platform, tone = 'light', className = '' }: { platform: SocialKey; tone?: Tone; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`social-icon social-icon--${platform} social-icon--${tone} ${className}`}
      dangerouslySetInnerHTML={{ __html: SVGS[platform] }}
    />
  )
}
