import { Form, Link, useLocation } from '@remix-run/react'
import { Button } from './button'
import { Logo } from './logo'
import { useEffect, useState } from 'react'
import { useOptionalUser } from '#app/utils/user.js'

export const MarketingNav = () => {
  const location = useLocation();
  const user = useOptionalUser();
	const [navOpen, setNavOpen] = useState(false)

	useEffect(() => {
		if (navOpen) setNavOpen(false)
	}, [location.pathname])

	return (
		<header className="px-10 py-6 bg-gradient-to-r bg-black from-blue-800">
			{navOpen && (
				<nav className="z-2 fixed left-0 top-0 h-screen w-screen bg-accent-background px-10">
					<header className="flex h-20 justify-between"></header>

					<div className="flex h-[calc(100vh-100px)] flex-col justify-between">
						<div className="text-center">
							<Button variant="outline" size="wide">
								<Link to="/dashboard">Dashboard</Link>
							</Button>
						</div>

						<div>
							<Form method="POST" action="/logout" className="text-center">
								<Button variant="default" size="full" type="submit">
									Logout
								</Button>
							</Form>
						</div>
					</div>
				</nav>
			)}
			<nav className="flex flex-wrap items-center justify-between gap-4 sm:flex-nowrap md:gap-8">
				<Logo />
				<div className="flex items-center gap-10">
					{location.pathname.includes('dashboard') ? (
						<button
							className="group relative block md:hidden"
							onClick={() => setNavOpen((prev) => !prev)}
						>
							<div
								className={`relative flex h-[50px] w-[50px] transform items-center justify-center overflow-hidden rounded-full shadow-md ring-0 ring-gray-300 ring-opacity-30 transition-all duration-200`}
							>
								<div className="flex h-[20px] w-[20px] origin-center transform flex-col justify-between overflow-hidden transition-all duration-300">
									<div
										className={`h-[2px] w-7 origin-left transform bg-foreground transition-all delay-100 duration-300 ${navOpen ? 'translate-y-6' : ''}`}
									></div>
									<div
										className={`h-[2px] w-7 transform rounded bg-foreground transition-all delay-75 duration-300 ${navOpen ? 'translate-y-6' : ''}`}
									></div>
									<div
										className={`h-[2px] w-7 origin-left transform bg-foreground transition-all duration-300 ${navOpen ? 'translate-y-6' : ''}`}
									></div>

									<div
										className={`absolute top-2.5 flex w-0 -translate-x-10 transform items-center justify-between transition-all duration-500 ${navOpen ? 'w-12 translate-x-0' : ''}`}
									>
										<div
											className={`absolute h-[2px] w-5 rotate-0 transform bg-foreground transition-all delay-300 duration-500 ${navOpen ? 'rotate-45' : ''}`}
										></div>
										<div
											className={`absolute h-[2px] w-5 -rotate-0 transform bg-foreground transition-all delay-300 duration-500 ${navOpen ? '-rotate-45' : ''}`}
										></div>
									</div>
								</div>
							</div>
						</button>
					) : (
						<>
							{user ? (
								<button className="font-bold text-white">
									<Link to="/dashboard">Go to Dashboard</Link>
								</button>
							) : (
                <span>
                  <Button
                    asChild
                    variant="link"
                    size="lg"
                    className="font-bold"
                  >
                    <Link to="/login">Sign in</Link>
                  </Button>

                  <Button
                    asChild
                    variant="default"
                    size="lg"
                    className="font-bold"
                  >
                    <Link to="/signup">Create an Account</Link>
                  </Button>
                </span>
							)}
						</>
					)}
				</div>
			</nav>
		</header>
	)
}
