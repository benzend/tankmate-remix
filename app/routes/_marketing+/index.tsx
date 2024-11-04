// app/routes/index.tsx
import { Link } from '@remix-run/react'

export default function Index() {
	return (
		<div className="min-h-screen bg-background text-gray-100">
			{/* Hero Section */}
			<section className="hero-section relative flex h-screen items-center justify-center bg-[url('/img/marketing/hero.jpg')] bg-cover bg-center text-white">
				<div className="absolute inset-0 opacity-70"></div>
				<div className="flex justify-between">
					<div></div>
					<div className="relative px-4 md:w-1/2">
						<h1 className="font-serif leading-normal lg:leading-snug mb-6 text-4xl font-extrabold drop-shadow-lg lg:text-6xl">
							Dive into the Future of Aquarium Care
						</h1>
						<p className="mx-auto mb-10 max-w-xl text-xl drop-shadow-lg">
							AI-powered aquarium tracking that analyzes fish counts, tank
							health, and more. Your underwater ecosystem, optimized with the
							latest tech.
						</p>
						<Link
							to="/signup"
							className="inline-block transform rounded bg-indigo-500 px-10 py-2 font-bold text-white transition duration-300 hover:scale-105 hover:bg-indigo-400"
						>
							Get Started
						</Link>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section
				className="features-section bg-slate-950 bg-gradient-to-br from-blue-800 py-20 text-foreground"
				id="features"
			>
				<div className="container mx-auto max-w-7xl px-8 text-center">
					<h2 className="font-serif mb-20 text-4xl font-bold text-white md:text-5xl">
						Why TankMate?
					</h2>
					<div className="grid grid-cols-1 gap-12 md:grid-cols-3">
						<FeatureCard
							title="AI-Powered Insights"
							description="Analyze fish counts, species, and tank conditions using AI-powered image recognition."
							icon="🐠"
							imageUrl="/img/marketing/features-ai.webp"
						/>
						<FeatureCard
							title="Real-time Stats"
							description="Track water parameters, plant health, and sand quality in real time."
							icon="📊"
							imageUrl="/img/marketing/features-realtime-stats.webp"
						/>
						<FeatureCard
							title="Custom Notifications"
							description="Receive alerts for maintenance and care based on your tank’s conditions."
							icon="🔔"
							imageUrl="/img/marketing/features-custom-notifications.webp"
						/>
					</div>
				</div>
			</section>

			{/* Prototype Section */}
			<section className="prototype-section bg-slate-950 bg-gradient-to-l from-blue-900 py-24 text-gray-100">
				<div className="container mx-auto px-4 text-center">
					<h2 className="font-serif mb-20 text-4xl font-bold text-white md:text-5xl">
						Get an In-depth Analysis
					</h2>
					<img
						src="/img/marketing/prototype-example.png"
						alt="TankMate Prototype"
						className="mx-auto mb-8 w-full max-w-lg rounded-lg shadow-lg"
					/>
					<Link
						to="/prototype"
						className="inline-block transform rounded bg-indigo-500 px-10 py-2 font-bold text-white transition duration-300 hover:scale-105 hover:bg-indigo-400"
					>
						Try the Prototype
					</Link>
				</div>
			</section>

			{/* Call to Action Section */}
			<section className="cta-section from-bg-indigo-200 bg-indigo-600 bg-gradient-to-br py-20 text-white">
				<div className="container mx-auto text-center">
					<h2 className="font-serif mx-auto mb-3 max-w-lg text-4xl font-bold text-white md:text-5xl leading-relaxed md:leading-relaxed">
						Keep your tank healthy with TankMate!
					</h2>
					<p className="mx-auto mb-10 max-w-lg text-2xl">
						Join the aquarium enthusiasts who are using AI to revolutionize
						their tank care.
					</p>
					<Link
						to="/signup"
						className="inline-block transform rounded bg-blue-950 px-10 py-2 font-bold text-white transition duration-300 hover:scale-105 hover:bg-blue-900"
					>
						Start Tracking Now
					</Link>
				</div>
			</section>
		</div>
	)
}

// FeatureCard Component
function FeatureCard({
	title,
	description,
	icon,
	imageUrl,
}: {
	title: string
	description: string
	icon: string
	imageUrl: string
}) {
	return (
		<div className="feature-card rounded-lg bg-gradient-to-tl from-blue-950 to-slate-900 p-8 text-white shadow-md transition-all duration-300 hover:shadow-lg">
			<img
				src={imageUrl}
				alt={title}
				className="mb-4 h-48 w-full rounded-lg object-cover"
			/>
			<div className="mb-6 text-5xl">{icon}</div>
			<h3 className="mb-4 text-2xl font-bold">{title}</h3>
			<p>{description}</p>
		</div>
	)
}
