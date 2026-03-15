import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { calciumProducts } from './calcium-products'
import { alkalinityProducts } from './alkalinity-products'
import { magnesiumProducts } from './magnesium-products'

const WEB_DIR = path.resolve(__dirname)
const MOBILE_DIR = path.resolve(__dirname, '../../../mobile/lib/dosing-calculator')

const PRODUCT_FILES = [
	'calcium-products.ts',
	'alkalinity-products.ts',
	'magnesium-products.ts',
]

describe('Dosing calculator: web/mobile sync', () => {
	for (const file of PRODUCT_FILES) {
		test(`${file} is identical between web and mobile`, () => {
			const webContent = fs.readFileSync(path.join(WEB_DIR, file), 'utf-8')
			const mobileContent = fs.readFileSync(
				path.join(MOBILE_DIR, file),
				'utf-8',
			)
			expect(mobileContent).toBe(webContent)
		})
	}
})

describe('Dosing calculator: coefficient sanity checks', () => {
	const allProducts = [
		...calciumProducts,
		...alkalinityProducts,
		...magnesiumProducts,
	]

	test('no duplicate product codes', () => {
		const codes = allProducts.map((p) => p.code)
		const duplicates = codes.filter(
			(code, i) => codes.indexOf(code) !== i,
		)
		expect(duplicates, `Duplicate codes: ${duplicates.join(', ')}`).toEqual(
			[],
		)
	})

	test('all coefficients are positive finite numbers', () => {
		for (const product of allProducts) {
			expect(
				product.coefficient,
				`${product.code} has non-positive coefficient`,
			).toBeGreaterThan(0)
			expect(
				Number.isFinite(product.coefficient),
				`${product.code} has non-finite coefficient`,
			).toBe(true)
		}
	})

	test('calcium powder coefficients are in reasonable range (10-200 ppm/g/gal)', () => {
		const powders = calciumProducts.filter((p) => p.formulaType === 'powder')
		for (const product of powders) {
			expect(
				product.coefficient,
				`${product.code}: ${product.coefficient} outside expected range for calcium powder`,
			).toBeGreaterThanOrEqual(10)
			expect(
				product.coefficient,
				`${product.code}: ${product.coefficient} outside expected range for calcium powder`,
			).toBeLessThanOrEqual(200)
		}
	})

	test('calcium liquid coefficients are in reasonable range (0.1-60 ppm/ml/gal)', () => {
		const liquids = calciumProducts.filter((p) => p.formulaType === 'liquid')
		for (const product of liquids) {
			expect(
				product.coefficient,
				`${product.code}: ${product.coefficient} outside expected range for calcium liquid`,
			).toBeGreaterThanOrEqual(0.1)
			expect(
				product.coefficient,
				`${product.code}: ${product.coefficient} outside expected range for calcium liquid`,
			).toBeLessThanOrEqual(60)
		}
	})

	test('alkalinity powder coefficients are in reasonable range (3-20 dKH/g/gal)', () => {
		const powders = alkalinityProducts.filter(
			(p) => p.formulaType === 'powder',
		)
		for (const product of powders) {
			expect(
				product.coefficient,
				`${product.code}: ${product.coefficient} outside expected range for alk powder`,
			).toBeGreaterThanOrEqual(3)
			expect(
				product.coefficient,
				`${product.code}: ${product.coefficient} outside expected range for alk powder`,
			).toBeLessThanOrEqual(20)
		}
	})

	test('alkalinity liquid coefficients are in reasonable range (0.01-5 dKH/ml/gal)', () => {
		const liquids = alkalinityProducts.filter(
			(p) => p.formulaType === 'liquid' || p.formulaType === 'limewater',
		)
		for (const product of liquids) {
			expect(
				product.coefficient,
				`${product.code}: ${product.coefficient} outside expected range for alk liquid`,
			).toBeGreaterThanOrEqual(0.01)
			expect(
				product.coefficient,
				`${product.code}: ${product.coefficient} outside expected range for alk liquid`,
			).toBeLessThanOrEqual(5)
		}
	})

	test('magnesium powder coefficients are in reasonable range (15-150 ppm/g/gal)', () => {
		const powders = magnesiumProducts.filter(
			(p) => p.formulaType === 'powder',
		)
		for (const product of powders) {
			expect(
				product.coefficient,
				`${product.code}: ${product.coefficient} outside expected range for Mg powder`,
			).toBeGreaterThanOrEqual(15)
			expect(
				product.coefficient,
				`${product.code}: ${product.coefficient} outside expected range for Mg powder`,
			).toBeLessThanOrEqual(150)
		}
	})

	test('every product has a sourceUrl and sourceNote', () => {
		for (const product of allProducts) {
			expect(
				product.sourceUrl,
				`${product.code} is missing sourceUrl`,
			).toBeTruthy()
			expect(
				product.sourceNote,
				`${product.code} is missing sourceNote`,
			).toBeTruthy()
		}
	})
})
