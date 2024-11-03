import { Link } from "@remix-run/react"

export const Logo = ({ mode = 'stuck' } : { mode?: 'stuck' | 'follow-theme' }) => {
  return (
		<Link to="/" className="group grid leading-snug">
			<span className={`text-2xl font-extrabold ${mode === 'stuck' ? 'text-white' : 'text-foreground' }`}>
				TankMate
			</span>
		</Link>
  )
}
