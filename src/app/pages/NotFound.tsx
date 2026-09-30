import { Link } from 'react-router'
import { Notice } from '@/app/components/ui'

export default function NotFound() {
  return (
    <div className="pt-[.3rem]">
      <Notice
        title="This dashboard page does not exist"
        action={
          <Link to="/" className="rounded-full bg-ink px-[.2rem] py-[.1rem] text-[.13rem] font-bold text-white lg:px-[.28rem] lg:py-[.14rem] lg:text-[.17rem]">
            Back to overview
          </Link>
        }
      >
        Pick a section from the menu above.
      </Notice>
    </div>
  )
}
