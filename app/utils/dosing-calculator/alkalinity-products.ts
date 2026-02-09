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
		coefficient: 2.22,
		primaryUnit: 'ml',
		phEffect: 'somewhat-higher',
		warning: 'Dose equal parts A and B. Do not mix A and B before adding to tank',
		sourceUrl: 'https://www.brightwellaquatics.com/products/reefcodebt.php',
		sourceNote:
			'Manufacturer states: "Each ml will increase alkalinity in 1 US-gallon by approximately 2.22 dKH (0.79 meq/L)"',
	},
	{
		code: 'brightwell-reefcode-b-p',
		name: 'Brightwell ReefCode Part B (Powder)',
		formulaType: 'powder',
		coefficient: 8.3,
		primaryUnit: 'grams',
		phEffect: 'somewhat-higher',
		warning: 'Dissolve in RO/DI water before adding. Dose equal parts A and B',
		sourceUrl: 'https://www.brightwellaquatics.com/products/reefcodebpt.php',
		sourceNote:
			'Manufacturer states: "Each g will increase alkalinity in 1 US-gallon by ~8.3 dKH (3 meq/L)"',
	},
	{
		code: 'brightwell-nanocode-b',
		name: 'Brightwell NanoCode B',
		formulaType: 'liquid',
		coefficient: 1.67,
		primaryUnit: 'ml',
		phEffect: 'somewhat-higher',
		warning: 'Dose equal parts A and B',
		sourceUrl: 'https://www.brightwellaquatics.com/products/nanocodebt.php',
		sourceNote:
			'Manufacturer states: "Each ml will increase alkalinity in 1 US-gallon by approximately 1.67 dKH (0.60 meq/L)"',
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
		coefficient: 2.96,
		primaryUnit: 'ml',
		phEffect: 'somewhat-higher',
		warning: 'Do not mix with Ca/Mg/Sr supplements directly',
		sourceUrl: 'https://www.seachem.com/reef-carbonate.php',
		sourceNote:
			'Concentration 4,000 meq/L. 5 ml per 80 L raises alk by 0.25 meq/L. 4 / 3.785 = 1.057 meq/L = 2.96 dKH per ml per gal',
	},
	{
		code: 'seachem-fusion-2',
		name: 'Seachem Fusion Part 2',
		formulaType: 'liquid',
		coefficient: 3.25,
		primaryUnit: 'ml',
		phEffect: 'somewhat-higher',
		warning: 'Max 4 ml per 25 liters. Dose equal parts 1 and 2',
		sourceUrl: 'https://www.seachem.com/reef-fusion.php',
		sourceNote:
			'Concentration 4,400 meq/L. 1 ml per 25 L = 0.176 meq/L. 0.176 * 6.604 gal = 1.162 meq/L/ml/gal = 3.25 dKH',
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
		sourceUrl: 'https://www.esvaquarium.com/',
		sourceNote:
			'1/4 strength of standard B-Ionic (2.07 dKH/ml/gal). No direct manufacturer coefficient published',
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
		coefficient: 2.07,
		primaryUnit: 'ml',
		phEffect: 'somewhat-higher',
		warning: 'Dose equal parts A and B',
		sourceUrl: 'https://www.kentmarine.com/products/kent-tech-cb-part-b.htm',
		sourceNote:
			'Label states 7840 dKH concentration. 7.84 / 3.785 = 2.07 dKH per ml per gal',
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
		sourceUrl: 'https://www.continuumaquatics.com/marine_ph/reefbasis_khbuffer.php',
		sourceNote:
			'Manufacturer multiplier 0.357: ml = gal * dKH * 0.357. Coefficient = 1/0.357 = 2.80',
	},
	{
		code: 'continuum-reef-basis-kh-p',
		name: 'Continuum Reef Basis KH Buffer (Powder)',
		formulaType: 'powder',
		coefficient: 8.77,
		primaryUnit: 'grams',
		phEffect: 'somewhat-higher',
		sourceUrl: 'https://www.continuumaquatics.com/marine_ph/reefbasis_khbuffer_d.php',
		sourceNote:
			'Manufacturer multiplier 0.114: g = gal * dKH * 0.114. Coefficient = 1/0.114 = 8.77',
	},
	{
		code: 'continuum-reef-sculpture-b',
		name: 'Continuum Reef Sculpture Part B',
		formulaType: 'liquid',
		coefficient: 2.21,
		primaryUnit: 'ml',
		phEffect: 'somewhat-higher',
		warning: 'Dose equal parts A and B',
		sourceUrl: 'https://www.continuumaquatics.com/marine_ca/reef_sculpture.php',
		sourceNote:
			'No separate manufacturer coefficient found for Part B. Value from reef.diesyst.com. May be diluted vs standalone KH Buffer',
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
		sourceUrl: 'https://www.tropic-marin-smartinfo.com/bio-calcium?lang=en',
		sourceNote:
			'1 scoop per 10 gal raises alk by 4 dKH. Coefficient depends on scoop weight (~10.2 g implied). Also raises Ca',
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
		sourceUrl: 'http://www.salifert.com/sup/ca.htm',
		sourceNote:
			'No direct manufacturer dKH/ml coefficient published. Value from reef.diesyst.com calculator',
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
		sourceUrl: 'http://www.warnermarine.com/products/c-max-a/',
		sourceNote:
			'No manufacturer coefficient published. Value from reef.diesyst.com calculator',
	},

	// ── Aquaforest ───────────────────────────────────────────────
	{
		code: 'aquaforest-kh-plus',
		name: 'Aquaforest KH Plus',
		formulaType: 'liquid',
		coefficient: 1.321,
		primaryUnit: 'ml',
		phEffect: 'somewhat-higher',
		sourceUrl: 'https://aquaforest.eu/en/products/seawater/water-treatment/kh-plus-2/',
		sourceNote:
			'10 ml raises KH by 0.5 dKH in 100 L. 0.5 / 10 * 26.42 = 1.321',
	},
	{
		code: 'aquaforest-kh-buffer',
		name: 'Aquaforest KH Buffer (Powder)',
		formulaType: 'powder',
		coefficient: 8.72,
		primaryUnit: 'grams',
		phEffect: 'somewhat-lower',
		warning: 'Dissolve in RO/DI water before adding. Do not raise more than 1.4 dKH per day',
		sourceUrl: 'https://aquaforest.eu/en/products/seawater/water-treatment/kh-buffer/',
		sourceNote:
			'10 g in 100 L raises KH by 3.3 dKH. 3.3 / 10 * 26.42 = 8.72',
	},

	// ── MEcoral ──────────────────────────────────────────────────
	{
		code: 'mecoral-alkalinity',
		name: 'MEcoral Alkalinity',
		formulaType: 'liquid',
		coefficient: 2.0,
		primaryUnit: 'ml',
		phEffect: 'somewhat-higher',
		sourceUrl: 'https://mecoral.com/product/me-alkalinity-gallon/',
		sourceNote:
			'Manufacturer: "5 ml per 100 gal raises KH by 0.10 dKH." 0.10 * 100 / 5 = 2.0',
	},

	// ── Oceans Blend ─────────────────────────────────────────────
	{
		code: 'oceans-blend-part-2',
		name: 'Oceans Blend Part 2',
		formulaType: 'liquid',
		coefficient: 1.4,
		primaryUnit: 'ml',
		phEffect: 'somewhat-higher',
		sourceUrl: 'https://www.oceansblend.com/2_part.html',
		sourceNote:
			'No manufacturer coefficient published. Value from reef.diesyst.com calculator',
	},

	// ── Randy Holmes-Farley DIY ──────────────────────────────────
	{
		code: 'randys-recipe-1-alk',
		name: "Randy's Recipe #1 (Alkalinity)",
		formulaType: 'liquid',
		coefficient: 1.4,
		primaryUnit: 'ml',
		phEffect: 'higher',
		warning:
			'DIY soda ash solution — 594 g baking soda baked at 300°F for 1 hour, dissolved to 1 US gallon',
		sourceUrl: 'https://reefkeeping.com/issues/2006-02/rhf/index.php',
		sourceNote:
			'Randy Holmes-Farley original recipe. Stated concentration ~5,300 dKH. 5300 / 3785 / (1/0.357) = 1.4',
	},
	{
		code: 'randys-recipe-2-alk',
		name: "Randy's Recipe #2 (Alkalinity)",
		formulaType: 'liquid',
		coefficient: 0.7,
		primaryUnit: 'ml',
		phEffect: 'somewhat-lower',
		warning:
			'DIY baking soda solution — 297 g NaHCO3 dissolved to 1 US gallon. For high pH (>8.3) aquaria',
		sourceUrl: 'https://reefkeeping.com/issues/2006-02/rhf/index.php',
		sourceNote:
			'Randy Holmes-Farley original recipe. Stated concentration ~2,660 dKH. 2660 / 3785 / (1/0.357) = 0.7',
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
		sourceUrl: 'https://fritzaquatics.com/products/fritzpro-sodium-bicarbonate',
		sourceNote:
			'Stoichiometric: NaHCO3 MW 84.01, 1 mol = 1 meq. 1 g/gal = 3.144 meq/L = 8.81 dKH. Fritz label: 5 g/45 gal = 1 dKH (= 9.0, rounded)',
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
		sourceUrl: 'https://fritzaquatics.com/products/fritzpro-sodium-carbonate',
		sourceNote:
			'Stoichiometric: Na2CO3 MW 105.99, 1 mol = 2 meq. 1 g/gal = 4.984 meq/L = 13.96 dKH. Fritz label: 5 g/65 gal = 1 dKH (= 13.0, rounded)',
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
		coefficient: 0.03,
		primaryUnit: 'ml',
		phEffect: 'substantially-higher',
		warning:
			'pH ~12.4 — add very slowly via ATO only. Also raises calcium. Not the preferred method for alkalinity',
		sourceUrl:
			'https://www.bulkreefsupply.com/content/post/using-kalkwasser',
		sourceNote:
			'Stoichiometric: Ca(OH)2 saturated ~1.5 g/L, MW 74.09. 1 mL in 1 gal: 0.04049 meq / 3.785 L = 0.0107 meq/L = 0.030 dKH',
	},
]
