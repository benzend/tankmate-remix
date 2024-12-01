import { Link } from "@remix-run/react"

export const Logo = ({ mode = 'stuck', to = '/' } : { mode?: 'stuck' | 'follow-theme', to?: string }) => {
  return (
		<Link to={to} className="group grid leading-snug">
			<span className={`text-2xl font-extrabold ${mode === 'stuck' ? 'text-white' : 'text-foreground' }`}>
				TankMate
			</span>
		</Link>
  )
}
