import { colors } from '../theme/colors'

export const PARAM_KEYS = [
	'pH',
	'alk',
	'calcium',
	'magnesium',
	'nitrate',
	'phosphate',
	'temp',
	'salinity',
] as const

export type ParamKey = (typeof PARAM_KEYS)[number]

export const PARAMETER_CONFIG: Record<
	ParamKey,
	{
		label: string
		unit: string
		color: string
		successRange: { lower: number; upper: number }
		yBounds: { min: number; max: number }
	}
> = {
	pH: {
		label: 'pH',
		unit: '',
		color: colors.chart.pH,
		successRange: { lower: 8.0, upper: 8.4 },
		yBounds: { min: 7.5, max: 8.8 },
	},
	alk: {
		label: 'Alkalinity',
		unit: 'dKH',
		color: colors.chart.alk,
		successRange: { lower: 8.0, upper: 12.0 },
		yBounds: { min: 6.0, max: 15.0 },
	},
	calcium: {
		label: 'Calcium',
		unit: 'ppm',
		color: colors.chart.calcium,
		successRange: { lower: 350, upper: 450 },
		yBounds: { min: 300, max: 500 },
	},
	magnesium: {
		label: 'Magnesium',
		unit: 'ppm',
		color: colors.chart.magnesium,
		successRange: { lower: 1180, upper: 1460 },
		yBounds: { min: 1000, max: 1600 },
	},
	nitrate: {
		label: 'Nitrate',
		unit: 'ppm',
		color: colors.chart.nitrate,
		successRange: { lower: 5, upper: 10 },
		yBounds: { min: 0, max: 20 },
	},
	phosphate: {
		label: 'Phosphate',
		unit: 'ppm',
		color: colors.chart.phosphate,
		successRange: { lower: 0.03, upper: 0.05 },
		yBounds: { min: 0, max: 1.0 },
	},
	temp: {
		label: 'Temperature',
		unit: '°F',
		color: colors.chart.temp,
		successRange: { lower: 76, upper: 82 },
		yBounds: { min: 70, max: 86 },
	},
	salinity: {
		label: 'Salinity',
		unit: 'sg',
		color: colors.chart.salinity,
		successRange: { lower: 1.024, upper: 1.027 },
		yBounds: { min: 1.015, max: 1.035 },
	},
}
