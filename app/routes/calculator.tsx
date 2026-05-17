import { Link, type MetaFunction } from '@remix-run/react'
import { DosingCalculatorWidget } from '#app/components/dosing-calculator-widget.tsx'

export const meta: MetaFunction = () => [
	{ title: 'ReefChronicles | Free Dosing Calculator for Reef Tanks' },
	{
		name: 'description',
		content:
			'Free online dosing calculator for saltwater reef aquariums. Calculate exact doses for Calcium, Alkalinity, and Magnesium using real commercial products.',
	},
]

export default function CalculatorPage() {
	return (
		<div className="min-h-screen bg-slate-950 text-gray-100">
			<main className="container mx-auto px-4 py-12">
				<div className="mx-auto max-w-3xl text-center">
					<h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
						Free Reef Tank Dosing Calculator
					</h1>
					<p className="mb-4 text-lg text-slate-400">
						Calculate exact doses for Calcium, Alkalinity, and Magnesium.
						No signup required — bookmark and use anytime.
					</p>
					<p className="mb-10 text-sm text-slate-500">
						Supports popular products from Brightwell, Seachem, Red Sea, ESV,
						Tropic Marin, and more.
					</p>
				</div>

				<DosingCalculatorWidget />

				{/* Signup CTA */}
				<div className="mx-auto mt-12 max-w-2xl rounded-xl border border-slate-700 bg-slate-900/50 p-8 text-center">
					<h2 className="mb-3 text-2xl font-bold text-white">
						Want to track your parameters over time?
					</h2>
					<p className="mb-6 text-slate-400">
						Sign up for free to log your water parameters, view trend charts,
						and get alerts when values drift outside ideal ranges.
					</p>
					<Link
						to="/signup"
						className="inline-block rounded bg-indigo-600 px-8 py-3 font-bold text-white transition hover:bg-indigo-500 hover:scale-105"
					>
						Create Free Account
					</Link>
				</div>
			</main>
		</div>
	)
}
