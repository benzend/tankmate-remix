/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
	presets: [require('nativewind/preset')],
	theme: {
		extend: {
			colors: {
				// Core palette — matches web extended-theme.ts
				background: 'hsl(222.2, 84%, 4.9%)',
				foreground: 'hsl(210, 40%, 98%)',
				primary: {
					DEFAULT: 'hsl(210, 40%, 98%)',
					foreground: 'hsl(222.2, 47.4%, 11.2%)',
				},
				muted: {
					DEFAULT: 'hsl(217.2, 32.6%, 17.5%)',
					foreground: 'hsl(215, 20.2%, 65.1%)',
				},
				accent: {
					DEFAULT: 'hsl(217.2, 32.6%, 10%)',
					foreground: 'hsl(210, 40%, 98%)',
				},
				destructive: {
					DEFAULT: 'hsl(0, 62.8%, 30.6%)',
					foreground: 'hsl(210, 40%, 98%)',
				},
				card: {
					DEFAULT: 'hsl(222.2, 84%, 4.9%)',
					foreground: 'hsl(210, 40%, 98%)',
				},
				border: 'hsl(217.2, 32.6%, 17.5%)',
				ring: 'hsl(212.7, 26.8%, 83.9%)',
				// Semantic
				'positive-green': 'hsl(106, 76%, 68%)',
				'neutral-yellow': 'hsl(62, 76%, 68%)',
				'negative-red': 'hsl(0, 76%, 68%)',
				'negative-orange': 'hsl(26, 76%, 68%)',
				// Chart colors
				chart: {
					ph: '#60A5FA',
					alk: '#34D399',
					calcium: '#A78BFA',
					magnesium: '#FBBF24',
					nitrate: '#EC4899',
					phosphate: '#6366F1',
					temp: '#F87171',
					salinity: '#F87171',
				},
			},
			fontFamily: {
				sans: ['Jost'],
				serif: ['GowunBatang'],
			},
		},
	},
	plugins: [],
}
