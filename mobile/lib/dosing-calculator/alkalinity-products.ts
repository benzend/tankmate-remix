import { type DosingProduct } from './types'

/**
 * Alkalinity products use dKH as the base unit for coefficients.
 * coefficient = dKH raised per (primaryUnit) per gallon of tank water.
 * The calculation engine converts user's chosen unit (dKH/meq/L/ppm) to dKH first.
 */
export const alkalinityProducts: DosingProduct[] = [
	// ── Brightwell ──────────────────────────────────────────────
	{
		code: 'brightwell-alkalin83',
		name: 'Brightwell Alkalin8.3',
		formulaType: 'liquid',
		coefficient: 3.1,
		primaryUnit: 'ml',
		phEffect: 'somewhat-higher',
		warning: 'Do not exceed 5 ml per 10 gallons per day when below 7 dKH',
		sourceUrl: 'https://www.brightwellaquatics.com/products/alkalin83t.php',
		sourceNote: '1 ml per 1 gal raises alk by 3.1 dKH (1.1 meq/L)',
	},
	{
		code: 'brightwell-alkalin83-p',
		name: 'Brightwell Alkalin8.3-P',
		formulaType: 'powder',
		coefficient: 12,
		primaryUnit: 'grams',
		phEffect: 'somewhat-higher',
		warning: 'Dissolve in freshwater before adding. Do not add directly to aquarium',
		sourceUrl: 'https://www.brightwellaquatics.com/products/alkalin83pt.php',
		sourceNote: '1 g per 1 gal raises alk by 12 dKH (4.2 meq/L)',
	},
	{
		code: 'brightwell-reefcode-b',
		name: 'Brightwell ReefCode Part B',
		formulaType: 'liquid',
		coefficient: 2.21,
		primaryUnit: 'ml',
		phEffect: 'somewhat-higher',
		warning: 'Dose equal parts A and B. Do not mix A and B before adding to tank',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: '1 ml per 1 gal raises alk by 0.79 meq/L (2.21 dKH)',
	},
	{
		code: 'brightwell-reefcode-b-p',
		name: 'Brightwell ReefCode Part B (Powder)',
		formulaType: 'powder',
		coefficient: 8.29,
		primaryUnit: 'grams',
		phEffect: 'somewhat-higher',
		warning: 'Dissolve in RO/DI water before adding. Dose equal parts A and B',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: '1 g per 1 gal raises alk by 2.96 meq/L (8.29 dKH)',
	},
	{
		code: 'brightwell-nanocode-b',
		name: 'Brightwell NanoCode B',
		formulaType: 'liquid',
		coefficient: 1.67,
		primaryUnit: 'ml',
		phEffect: 'somewhat-higher',
		warning: 'Dose equal parts A and B',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: '1 ml per 1 gal raises alk by 0.596 meq/L (1.67 dKH)',
	},

	// ── Seachem ─────────────────────────────────────────────────
	{
		code: 'seachem-reef-builder',
		name: 'Seachem Reef Builder',
		formulaType: 'powder',
		coefficient: 9.33,
		primaryUnit: 'grams',
		phEffect: 'minimal',
		warning:
			'Do not exceed 12 g per 40 gal per day. Do not mix with Ca/Mg supplements directly',
		sourceUrl: 'https://www.seachem.com/reef-builder.php',
		sourceNote: '3 g per 40 gal raises alk by 0.7 dKH (0.7 * 40 / 3 = 9.33)',
	},
	{
		code: 'seachem-reef-buffer',
		name: 'Seachem Reef Buffer',
		formulaType: 'powder',
		coefficient: 11.2,
		primaryUnit: 'grams',
		phEffect: 'somewhat-higher',
		warning: 'Raises pH toward 8.3. Do not mix with Ca/Mg/Sr supplements directly',
		sourceUrl: 'https://www.seachem.com/reef-buffer.php',
		sourceNote:
			'5 g per 40 gal raises alk by 1.4 dKH / 0.5 meq/L (1.4 * 40 / 5 = 11.2)',
	},
	{
		code: 'seachem-marine-buffer',
		name: 'Seachem Marine Buffer',
		formulaType: 'powder',
		coefficient: 11.2,
		primaryUnit: 'grams',
		phEffect: 'higher',
		warning:
			'Significantly raises pH to 8.3. Intended for fish-only marine tanks, not reef-specific',
		sourceUrl: 'https://www.seachem.com/marine-buffer.php',
		sourceNote: '5 g per 20 gal raises alk by 2.8 dKH / 1 meq/L (2.8 * 20 / 5 = 11.2)',
	},
	{
		code: 'seachem-reef-carbonate',
		name: 'Seachem Reef Carbonate',
		formulaType: 'liquid',
		coefficient: 2.8,
		primaryUnit: 'ml',
		phEffect: 'somewhat-higher',
		warning: 'Do not mix with Ca/Mg/Sr supplements directly',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: '1 ml per 1 gal raises alk by 1 meq/L (2.8 dKH)',
	},
	{
		code: 'seachem-fusion-2',
		name: 'Seachem Fusion Part 2',
		formulaType: 'liquid',
		coefficient: 3.28,
		primaryUnit: 'ml',
		phEffect: 'somewhat-higher',
		warning: 'Max 4 ml per 25 liters. Dose equal parts 1 and 2',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: '1 ml per 1 gal raises alk by 1.17 meq/L (3.28 dKH)',
	},

	// ── ESV ──────────────────────────────────────────────────────
	{
		code: 'esv-bionic-alkalinity',
		name: 'ESV B-Ionic Alkalinity Buffer',
		formulaType: 'liquid',
		coefficient: 2.07,
		primaryUnit: 'ml',
		phEffect: 'somewhat-higher',
		warning:
			'Do not exceed 1 ml per gallon per day. Dose Ca and Alk at least 1 hour apart',
		sourceUrl: 'https://www.esvaquarium.com/',
		sourceNote: '1 ml per 1 gal raises alk by 2.07 dKH (0.74 meq/L)',
	},
	{
		code: 'esv-bionic-bicarbonate-1',
		name: 'ESV B-Ionic Bicarbonate System Part 1',
		formulaType: 'liquid',
		coefficient: 0.52,
		primaryUnit: 'ml',
		phEffect: 'somewhat-lower',
		warning: 'Dose equal parts 1 and 2',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: '1 ml per 1 gal raises alk by 0.185 meq/L (0.52 dKH)',
	},

	// ── Red Sea ──────────────────────────────────────────────────
	{
		code: 'red-sea-foundation-b-liquid',
		name: 'Red Sea Foundation B (Liquid)',
		formulaType: 'liquid',
		coefficient: 2.5,
		primaryUnit: 'ml',
		phEffect: 'somewhat-higher',
		warning: 'Max daily increase of 1.4 dKH. Spread larger adjustments over multiple days',
		sourceUrl: 'https://www.bulkreefsupply.com/reef-foundation-b-alk-red-sea.html',
		sourceNote: '1 ml per 25 gal raises alk by 0.1 dKH (0.1 * 25 = 2.5)',
	},
	{
		code: 'red-sea-foundation-b-powder',
		name: 'Red Sea Foundation B (Powder)',
		formulaType: 'powder',
		coefficient: 8.25,
		primaryUnit: 'grams',
		phEffect: 'somewhat-higher',
		warning: 'Max daily increase of 1.4 dKH. Spread larger adjustments over multiple days',
		sourceUrl: 'https://www.bulkreefsupply.com/reef-foundation-b-alk-red-sea.html',
		sourceNote: '1 g per 25 gal raises alk by 0.33 dKH (0.33 * 25 = 8.25)',
	},

	// ── Kent Marine ──────────────────────────────────────────────
	{
		code: 'kent-tech-cb-b',
		name: 'Kent Tech-CB Part B',
		formulaType: 'liquid',
		coefficient: 2.06,
		primaryUnit: 'ml',
		phEffect: 'somewhat-higher',
		warning: 'Dose equal parts A and B',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: '1 ml per 1 gal raises alk by 0.735 meq/L (2.06 dKH)',
	},

	// ── Two Little Fishies ───────────────────────────────────────
	{
		code: 'tlf-c-balance-b',
		name: 'Two Little Fishies C-Balance Part B',
		formulaType: 'liquid',
		coefficient: 1.4,
		primaryUnit: 'ml',
		phEffect: 'somewhat-higher',
		warning:
			'Dose equal parts A and B. Divide max dose into at least 2 daily doses to prevent pH spikes',
		sourceUrl: 'https://www.bulkreefsupply.com/c-balance-two-little-fishies.html',
		sourceNote: '1 ml per 1 gal raises alk by 1.4 dKH (0.5 meq/L)',
	},

	// ── Continuum ────────────────────────────────────────────────
	{
		code: 'continuum-reef-basis-kh',
		name: 'Continuum Reef Basis KH Buffer',
		formulaType: 'liquid',
		coefficient: 2.8,
		primaryUnit: 'ml',
		phEffect: 'somewhat-higher',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: '1 ml per 1 gal raises alk by 1 meq/L (2.8 dKH)',
	},
	{
		code: 'continuum-reef-basis-kh-p',
		name: 'Continuum Reef Basis KH Buffer (Powder)',
		formulaType: 'powder',
		coefficient: 8.75,
		primaryUnit: 'grams',
		phEffect: 'somewhat-higher',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: '1 g per 1 gal raises alk by 3.125 meq/L (8.75 dKH)',
	},
	{
		code: 'continuum-reef-sculpture-b',
		name: 'Continuum Reef Sculpture Part B',
		formulaType: 'liquid',
		coefficient: 2.21,
		primaryUnit: 'ml',
		phEffect: 'somewhat-higher',
		warning: 'Dose equal parts A and B',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: '1 ml per 1 gal raises alk by 0.79 meq/L (2.21 dKH)',
	},

	// ── Tropic Marin ─────────────────────────────────────────────
	{
		code: 'tropic-marin-bio-calcium-alk',
		name: 'Tropic Marin Bio-Calcium (Alk)',
		formulaType: 'powder',
		coefficient: 3.92,
		primaryUnit: 'grams',
		phEffect: 'somewhat-higher',
		warning:
			'Balanced additive — also raises Ca. Do not use for alkalinity-only corrections',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: '1 ml per 1 gal raises alk by 1.4 meq/L (3.92 dKH). Also raises Ca',
	},

	// ── Salifert ─────────────────────────────────────────────────
	{
		code: 'salifert-all-in-one-alk',
		name: 'Salifert All in One (Alkalinity)',
		formulaType: 'liquid',
		coefficient: 1.85,
		primaryUnit: 'ml',
		phEffect: 'minimal',
		warning: 'Maintenance only — not for large corrections',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: '1 ml per 1 gal raises alk by 0.66 meq/L (1.85 dKH)',
	},

	// ── Warner Marine ────────────────────────────────────────────
	{
		code: 'warner-calxmax-b',
		name: 'Warner Marine CalxMax Part B',
		formulaType: 'liquid',
		coefficient: 2.1,
		primaryUnit: 'ml',
		phEffect: 'somewhat-higher',
		warning: 'Dose equal parts A and B',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: '1 ml per 1 gal raises alk by 0.75 meq/L (2.1 dKH)',
	},

	// ── Aquaforest ───────────────────────────────────────────────
	{
		code: 'aquaforest-kh-plus',
		name: 'Aquaforest KH Plus',
		formulaType: 'liquid',
		coefficient: 0.66,
		primaryUnit: 'ml',
		phEffect: 'somewhat-higher',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: '1 ml per 1 gal raises alk by 0.236 meq/L (0.66 dKH)',
	},
	{
		code: 'aquaforest-kh-buffer',
		name: 'Aquaforest KH Buffer (Powder)',
		formulaType: 'powder',
		coefficient: 8.72,
		primaryUnit: 'grams',
		phEffect: 'somewhat-lower',
		warning: 'Dissolve in RO/DI water before adding. Do not raise more than 1.4 dKH per day',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: '1 g per 1 gal raises alk by 3.11 meq/L (8.72 dKH)',
	},

	// ── MEcoral ──────────────────────────────────────────────────
	{
		code: 'mecoral-alkalinity',
		name: 'MEcoral Alkalinity',
		formulaType: 'liquid',
		coefficient: 2.0,
		primaryUnit: 'ml',
		phEffect: 'somewhat-higher',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: '1 ml per 1 gal raises alk by 0.714 meq/L (2.0 dKH)',
	},

	// ── Oceans Blend ─────────────────────────────────────────────
	{
		code: 'oceans-blend-part-2',
		name: 'Oceans Blend Part 2',
		formulaType: 'liquid',
		coefficient: 1.4,
		primaryUnit: 'ml',
		phEffect: 'somewhat-higher',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: '1 ml per 1 gal raises alk by 0.5 meq/L (1.4 dKH)',
	},

	// ── Randy Holmes-Farley DIY ──────────────────────────────────
	{
		code: 'randys-recipe-1-alk',
		name: "Randy's Recipe #1 (Alkalinity)",
		formulaType: 'liquid',
		coefficient: 1.4,
		primaryUnit: 'ml',
		phEffect: 'higher',
		warning: 'DIY soda ash solution — for normal-to-low pH aquaria',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: '1 ml per 1 gal raises alk by 0.5 meq/L (1.4 dKH)',
	},
	{
		code: 'randys-recipe-2-alk',
		name: "Randy's Recipe #2 (Alkalinity)",
		formulaType: 'liquid',
		coefficient: 0.7,
		primaryUnit: 'ml',
		phEffect: 'somewhat-lower',
		warning: 'DIY baking soda solution — for high pH (>8.3) aquaria',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: '1 ml per 1 gal raises alk by 0.25 meq/L (0.7 dKH)',
	},

	// ── Fritz ────────────────────────────────────────────────────
	{
		code: 'fritz-sodium-bicarbonate',
		name: 'Fritz Sodium Bicarbonate',
		formulaType: 'powder',
		coefficient: 8.8,
		primaryUnit: 'grams',
		phEffect: 'somewhat-lower',
		warning: 'Do not raise more than 1.4 dKH per day. Dissolve in RO/DI water first',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: 'Same as baking soda: 1 g per 1 gal raises alk by 8.8 dKH',
	},
	{
		code: 'fritz-sodium-carbonate',
		name: 'Fritz Sodium Carbonate',
		formulaType: 'powder',
		coefficient: 13.96,
		primaryUnit: 'grams',
		phEffect: 'higher',
		warning:
			'Significantly raises pH. Do not raise more than 1.4 dKH per day',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: 'Same as soda ash: 1 g per 1 gal raises alk by 13.96 dKH',
	},

	// ── Generic / DIY ────────────────────────────────────────────
	{
		code: 'sodium-bicarbonate',
		name: 'Sodium Bicarbonate (Baking Soda)',
		formulaType: 'powder',
		coefficient: 8.8,
		primaryUnit: 'grams',
		phEffect: 'somewhat-lower',
		warning: 'Do not raise more than 1.4 dKH per day. Dissolve in RO/DI water first',
		sourceUrl:
			'https://www.bulkreefsupply.com/content/post/brs-pharma-sodium-bicarbonate-mixing-and-dosing-instructions',
		sourceNote:
			'Stoichiometric: MW 84.01 g/mol, 1 dKH = 0.357 meq/L. 0.1136 g/gal = 1 dKH (1/0.1136 = 8.8)',
	},
	{
		code: 'sodium-carbonate',
		name: 'Sodium Carbonate (Soda Ash)',
		formulaType: 'powder',
		coefficient: 13.96,
		primaryUnit: 'grams',
		phEffect: 'higher',
		warning:
			'Significantly raises pH. Do not raise more than 1.4 dKH per day. Monitor pH — avoid changes > 0.2',
		sourceUrl:
			'https://www.bulkreefsupply.com/content/post/brs-pharma-soda-ash-mixing-and-dosing-instructions',
		sourceNote:
			'Stoichiometric: MW 105.99, provides 2 meq/mol. 0.07165 g/gal = 1 dKH (1/0.07165 = 13.96)',
	},
	{
		code: 'kalkwasser-alk',
		name: 'Kalkwasser (Saturated Ca(OH)2)',
		formulaType: 'limewater',
		coefficient: 0.148,
		primaryUnit: 'ml',
		phEffect: 'substantially-higher',
		warning:
			'pH ~12.4 — add very slowly via ATO only. Also raises calcium. Not the preferred method for alkalinity',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote:
			'1 gal (3785 ml) saturated solution per 40 gal raises alk by ~1.4 dKH (1.4 * 40 / 3785 = 0.148)',
	},
]
