export type VolumeUnit = 'gallons' | 'liters'

export type AlkUnit = 'dKH' | 'meq/L' | 'ppm'

export type PhEffect =
	| 'minimal'
	| 'somewhat-higher'
	| 'higher'
	| 'substantially-higher'
	| 'somewhat-lower'
	| 'lower'
	| 'largely-unchanged'

export type FormulaType = 'liquid' | 'powder' | 'limewater'

export type PrimaryUnit = 'ml' | 'grams' | 'gallons'

export interface DosingProduct {
	code: string
	name: string
	formulaType: FormulaType
	/** ppm raised per (primaryUnit) per gallon of tank water */
	coefficient: number
	primaryUnit: PrimaryUnit
	phEffect: PhEffect
	warning?: string
	/** Source URL for the dosing data */
	sourceUrl: string
	/** Brief note on where the coefficient came from */
	sourceNote: string
	customFormula?: (deltaValue: number, volumeInGallons: number) => number
}

export interface CalculationResult {
	primaryAmount: number
	primaryUnit: PrimaryUnit
	secondaryAmount: number
	secondaryUnit: string
	tertiaryAmount?: number
	tertiaryUnit?: string
}

export type ParameterCategory = 'calcium' | 'alkalinity' | 'magnesium'
