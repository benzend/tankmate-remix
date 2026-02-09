import { type DosingProduct } from './types'

export const magnesiumProducts: DosingProduct[] = [
	// ── Brightwell ──────────────────────────────────────────────
	{
		code: 'brightwell-magnesion',
		name: 'Brightwell Magnesion',
		formulaType: 'liquid',
		coefficient: 26,
		primaryUnit: 'ml',
		phEffect: 'minimal',
		warning: 'Do not exceed 10 ml per 20 gallons per day',
		sourceUrl: 'https://brightwellaquatics.com/products/magnesiont.php',
		sourceNote: '1 ml per 1 gal raises Mg by 26 ppm',
	},
	{
		code: 'brightwell-magnesion-p',
		name: 'Brightwell Magnesion-P',
		formulaType: 'powder',
		coefficient: 64,
		primaryUnit: 'grams',
		phEffect: 'minimal',
		warning: 'Do not exceed 5 g per 20 gallons per day',
		sourceUrl: 'https://www.brightwellaquatics.com/products/magnesionpt.php',
		sourceNote:
			'Formula: grams = delta_ppm * gallons / 64. So coefficient = 64 ppm/g/gal',
	},

	// ── Seachem ─────────────────────────────────────────────────
	{
		code: 'seachem-reef-advantage-magnesium',
		name: 'Seachem Reef Advantage Magnesium',
		formulaType: 'powder',
		coefficient: 20,
		primaryUnit: 'grams',
		phEffect: 'minimal',
		warning:
			'Do not exceed 25 g per 20 gal per day. Do not mix with carbonate supplements directly',
		sourceUrl: 'https://www.seachem.com/reef-adv-magnesium.php',
		sourceNote:
			'5 g per 20 gal raises Mg by 5 ppm. Expert formula: g = v * m / 80 (5 * 20 / 5 = 20)',
	},

	// ── Kent Marine ──────────────────────────────────────────────
	{
		code: 'kent-marine-tech-m',
		name: 'Kent Marine Tech M',
		formulaType: 'liquid',
		coefficient: 18.3,
		primaryUnit: 'ml',
		phEffect: 'largely-unchanged',
		warning: 'Add 1 ml per gallon per day maximum',
		sourceUrl: 'https://www.kentmarine.com/products/kent-tech-m-magnesium.htm',
		sourceNote: '1 ml per 1 gal raises Mg by 18.3 ppm',
	},

	// ── ESV ──────────────────────────────────────────────────────
	{
		code: 'esv-bionic-magnesium',
		name: 'ESV B-Ionic Magnesium',
		formulaType: 'liquid',
		coefficient: 10,
		primaryUnit: 'ml',
		phEffect: 'largely-unchanged',
		warning: 'Do not exceed 1.5 ml per gallon per day',
		sourceUrl: 'https://www.bulkreefsupply.com/esv-b-ionic-magnesium.html',
		sourceNote: '1 ml per 1 gal raises Mg by 10 ppm. Concentration: 36,000 ppm',
	},

	// ── Red Sea ──────────────────────────────────────────────────
	{
		code: 'red-sea-foundation-c-liquid',
		name: 'Red Sea Foundation C (Liquid)',
		formulaType: 'liquid',
		coefficient: 25,
		primaryUnit: 'ml',
		phEffect: 'largely-unchanged',
		warning: 'Do not raise more than 10 ppm per day',
		sourceUrl: 'https://www.bulkreefsupply.com/reef-foundation-c-mg-red-sea.html',
		sourceNote: '1 ml per 25 gal raises Mg by 1 ppm (1 * 25 = 25)',
	},
	{
		code: 'red-sea-foundation-c-powder',
		name: 'Red Sea Foundation C (Powder)',
		formulaType: 'powder',
		coefficient: 33.5,
		primaryUnit: 'grams',
		phEffect: 'largely-unchanged',
		warning: 'Do not raise more than 10 ppm per day',
		sourceUrl: 'https://www.bulkreefsupply.com/1-kg-red-sea-reef-foundation-c-mg.html',
		sourceNote: '1 g per 25 gal raises Mg by 1.34 ppm (1.34 * 25 = 33.5)',
	},

	// ── Tropic Marin ─────────────────────────────────────────────
	{
		code: 'tropic-marin-bio-magnesium-liquid',
		name: 'Tropic Marin Bio-Magnesium (Liquid)',
		formulaType: 'liquid',
		coefficient: 14,
		primaryUnit: 'ml',
		phEffect: 'largely-unchanged',
		warning: 'Do not exceed 15 ml per 10 gallons per day',
		sourceUrl: 'https://calulator.tropic-marin.com/en/minerals/bio-magnesium-liquid.html',
		sourceNote: '15 ml per 10 gal raises Mg by 21 ppm (21 * 10 / 15 = 14)',
	},

	// ── Continuum ────────────────────────────────────────────────
	{
		code: 'continuum-reef-basis-magnesium',
		name: 'Continuum Reef Basis Magnesium',
		formulaType: 'liquid',
		coefficient: 18.76,
		primaryUnit: 'ml',
		phEffect: 'largely-unchanged',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: '1 ml per 1 gal raises Mg by 18.76 ppm',
	},
	{
		code: 'continuum-reef-basis-magnesium-p',
		name: 'Continuum Reef Basis Magnesium (Powder)',
		formulaType: 'powder',
		coefficient: 111.1,
		primaryUnit: 'grams',
		phEffect: 'largely-unchanged',
		warning: 'May need up to 70% more product than calculated',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: '1 g per 1 gal raises Mg by 111.1 ppm',
	},

	// ── Warner Marine ────────────────────────────────────────────
	{
		code: 'warner-balanced-magnesium',
		name: 'Warner Marine Balanced Magnesium',
		formulaType: 'liquid',
		coefficient: 21,
		primaryUnit: 'ml',
		phEffect: 'largely-unchanged',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: '1 ml per 1 gal raises Mg by 21 ppm',
	},

	// ── Aquaforest ───────────────────────────────────────────────
	{
		code: 'aquaforest-magnesium-p',
		name: 'Aquaforest Magnesium (Powder)',
		formulaType: 'powder',
		coefficient: 30.86,
		primaryUnit: 'grams',
		phEffect: 'largely-unchanged',
		warning: 'Dissolve in RO/DI water before adding. Max 100 ppm/day',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: '1 g per 1 gal raises Mg by 30.86 ppm',
	},
	{
		code: 'aquaforest-mg-plus',
		name: 'Aquaforest Mg Plus',
		formulaType: 'liquid',
		coefficient: 19.82,
		primaryUnit: 'ml',
		phEffect: 'largely-unchanged',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: '1 ml per 1 gal raises Mg by 19.82 ppm',
	},

	// ── Salifert ─────────────────────────────────────────────────
	{
		code: 'salifert-liquid-magnesium',
		name: 'Salifert Liquid Magnesium',
		formulaType: 'liquid',
		coefficient: 6.6,
		primaryUnit: 'ml',
		phEffect: 'largely-unchanged',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: '1 ml per 1 gal raises Mg by 6.6 ppm',
	},

	// ── MEcoral ──────────────────────────────────────────────────
	{
		code: 'mecoral-magnesium',
		name: 'MEcoral Magnesium',
		formulaType: 'liquid',
		coefficient: 12.5,
		primaryUnit: 'ml',
		phEffect: 'largely-unchanged',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: '1 ml per 1 gal raises Mg by 12.5 ppm',
	},

	// ── Oceans Blend ─────────────────────────────────────────────
	{
		code: 'oceans-blend-magnesium',
		name: 'Oceans Blend Magnesium',
		formulaType: 'liquid',
		coefficient: 15,
		primaryUnit: 'ml',
		phEffect: 'largely-unchanged',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: '1 ml per 1 gal raises Mg by 15 ppm',
	},

	// ── Randy Holmes-Farley DIY ──────────────────────────────────
	{
		code: 'randys-recipe-mg',
		name: "Randy's Recipes #1 & #2 (Magnesium)",
		formulaType: 'liquid',
		coefficient: 12.4,
		primaryUnit: 'ml',
		phEffect: 'largely-unchanged',
		warning: 'DIY MgCl2/MgSO4 solution',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: '1 ml per 1 gal raises Mg by 12.4 ppm',
	},

	// ── Fritz ────────────────────────────────────────────────────
	{
		code: 'fritz-magnesium-sulfate',
		name: 'Fritz Magnesium Sulfate (MgSO4·7H2O)',
		formulaType: 'powder',
		coefficient: 26.78,
		primaryUnit: 'grams',
		phEffect: 'largely-unchanged',
		warning: 'Raises sulfate levels. Use with MgCl2 for balanced dosing. Max 100 ppm/day',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: '1 g per 1 gal raises Mg by 26.78 ppm',
	},
	{
		code: 'fritz-mag-flake',
		name: 'Fritz Mag Flake (MgCl2·6H2O)',
		formulaType: 'powder',
		coefficient: 30.86,
		primaryUnit: 'grams',
		phEffect: 'largely-unchanged',
		warning: 'Raises chloride levels. Use with MgSO4 for balanced dosing. Max 100 ppm/day',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: '1 g per 1 gal raises Mg by 30.86 ppm',
	},

	// ── Generic / DIY ────────────────────────────────────────────
	{
		code: 'magnesium-chloride',
		name: 'Magnesium Chloride (MgCl2·6H2O)',
		formulaType: 'powder',
		coefficient: 31.6,
		primaryUnit: 'grams',
		phEffect: 'largely-unchanged',
		warning:
			'Raises chloride levels. Best used with MgSO4 in ~10:1 ratio. Max 100 ppm/day',
		sourceUrl: 'https://www.bulkreefsupply.com/reef-calculator/reef-magnesium-calculator',
		sourceNote:
			'Stoichiometric: MW 203.30, Mg fraction 11.96%. 1 g/gal = 0.1196 * 1000 / 3.785 = 31.6 ppm',
	},
	{
		code: 'magnesium-chloride-anhydrous',
		name: 'Magnesium Chloride Anhydrous (MgCl2)',
		formulaType: 'powder',
		coefficient: 65.87,
		primaryUnit: 'grams',
		phEffect: 'largely-unchanged',
		warning: 'Raises chloride levels. Use with MgSO4 for balanced dosing. Max 100 ppm/day',
		sourceUrl: 'https://reef.diesyst.com/chemcalc/chemcalc.html',
		sourceNote: '1 g per 1 gal raises Mg by 65.87 ppm (anhydrous)',
	},
	{
		code: 'magnesium-sulfate',
		name: 'Magnesium Sulfate (MgSO4·7H2O / Epsom Salt)',
		formulaType: 'powder',
		coefficient: 26,
		primaryUnit: 'grams',
		phEffect: 'largely-unchanged',
		warning:
			'Raises sulfate levels. Use with MgCl2 for balanced dosing. Max 100 ppm/day',
		sourceUrl: 'https://en.wikipedia.org/wiki/Magnesium_sulfate',
		sourceNote:
			'Stoichiometric: MW 246.47, Mg fraction 9.86%. 1 g/gal = 0.0986 * 1000 / 3.785 = 26.0 ppm',
	},
]
