import {
	type AlkUnit,
	type CalculationResult,
	type DosingProduct,
	type VolumeUnit,
} from './types'

const LITERS_PER_GALLON = 3.78541

export function toGallons(volume: number, unit: VolumeUnit): number {
	return unit === 'liters' ? volume / LITERS_PER_GALLON : volume
}

/** Convert alkalinity value to meq/L for internal calculation */
export function alkToMeqL(value: number, unit: AlkUnit): number {
	switch (unit) {
		case 'meq/L':
			return value
		case 'dKH':
			return value / 2.8
		case 'ppm':
			return value / 50
	}
}

/** Convert meq/L back to target unit for display */
export function meqLToAlk(value: number, unit: AlkUnit): number {
	switch (unit) {
		case 'meq/L':
			return value
		case 'dKH':
			return value * 2.8
		case 'ppm':
			return value * 50
	}
}

export function calculateDose(
	product: DosingProduct,
	deltaPpm: number,
	volumeInGallons: number,
): CalculationResult | null {
	if (deltaPpm <= 0 || volumeInGallons <= 0) return null

	let primaryAmount: number

	if (product.customFormula) {
		primaryAmount = product.customFormula(deltaPpm, volumeInGallons)
	} else {
		// coefficient = ppm raised per (primaryUnit) per gallon
		// amount = deltaPpm * volumeInGallons / coefficient
		primaryAmount = (deltaPpm * volumeInGallons) / product.coefficient
	}

	const result: CalculationResult = {
		primaryAmount,
		primaryUnit: product.primaryUnit,
		secondaryAmount: 0,
		secondaryUnit: '',
	}

	// Add secondary conversions
	switch (product.primaryUnit) {
		case 'ml':
			result.secondaryAmount = primaryAmount * 0.033814 // ml to fl oz
			result.secondaryUnit = 'fl oz'
			result.tertiaryAmount = primaryAmount * 0.000264172 // ml to gallons
			result.tertiaryUnit = 'gal'
			break
		case 'grams':
			result.secondaryAmount = primaryAmount * 0.035274 // grams to oz
			result.secondaryUnit = 'oz'
			result.tertiaryAmount = primaryAmount * 0.2 // grams to tsp (approx)
			result.tertiaryUnit = 'tsp (approx)'
			break
		case 'gallons':
			result.secondaryAmount = primaryAmount * LITERS_PER_GALLON
			result.secondaryUnit = 'liters'
			break
	}

	return result
}

export function formatAmount(value: number): string {
	if (value >= 100) return value.toFixed(0)
	if (value >= 10) return value.toFixed(1)
	return value.toFixed(2)
}
