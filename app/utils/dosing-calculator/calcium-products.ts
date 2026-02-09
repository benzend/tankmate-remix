import { type DosingProduct } from './types'

export const calciumProducts: DosingProduct[] = [
	// ── Brightwell ──────────────────────────────────────────────
	{
		code: 'brightwell-calcion',
		name: 'Brightwell Calcion',
		formulaType: 'liquid',
		coefficient: 40,
		primaryUnit: 'ml',
		phEffect: 'minimal',
		warning: 'Do not exceed 10 ml per 20 gallons per day',
		sourceUrl: 'https://www.brightwellaquatics.com/products/calciont.php',
		sourceNote: '1 ml per 1 gal raises Ca by 40 ppm',
	},
	{
		code: 'brightwell-calcion-p',
		name: 'Brightwell Calcion-P',
		formulaType: 'powder',
		coefficient: 95,
		primaryUnit: 'grams',
		phEffect: 'minimal',
		warning: 'Dissolve in freshwater before adding to tank',
		sourceUrl: 'https://www.brightwellaquatics.com/products/calcionpt.php',
		sourceNote: '1 g per 1 gal raises Ca by 95 ppm',
	},
	{
		code: 'brightwell-reefcode-a',
		name: 'Brightwell ReefCode Part A',
		formulaType: 'liquid',
		coefficient: 16,
		primaryUnit: 'ml',
		phEffect: 'minimal',
		warning: 'Dose equal parts A and B. Do not mix A and B before adding to tank',
		sourceUrl: 'https://www.brightwellaquatics.com/products/reefcodeat.php',
		sourceNote:
			'Manufacturer states: "Each ml will increase Ca in 1 US-gallon by approximately 16 ppm"',
	},
	{
		code: 'brightwell-reefcode-a-p',
		name: 'Brightwell ReefCode Part A (Powder)',
		formulaType: 'powder',
		coefficient: 87,
		primaryUnit: 'grams',
		phEffect: 'minimal',
		warning: 'Dissolve in RO/DI water before adding. Dose equal parts A and B',
		sourceUrl: 'https://www.brightwellaquatics.com/products/reefcodeapt.php',
		sourceNote:
			'Manufacturer states: "Each g will increase Ca in 1 US-gallon by ~87 ppm"',
	},
	{
		code: 'brightwell-nanocode-a',
		name: 'Brightwell NanoCode A',
		formulaType: 'liquid',
		coefficient: 11.9,
		primaryUnit: 'ml',
		phEffect: 'minimal',
		warning: 'Dose equal parts A and B',
		sourceUrl: 'https://www.brightwellaquatics.com/products/nanocodeat.php',
		sourceNote:
			'Manufacturer states: "Each ml will increase Ca in 1 US-gallon by approximately 11.9 ppm"',
	},

	// ── Seachem ─────────────────────────────────────────────────
	{
		code: 'seachem-reef-advantage-calcium',
		name: 'Seachem Reef Advantage Calcium',
		formulaType: 'powder',
		coefficient: 9.6,
		primaryUnit: 'grams',
		phEffect: 'minimal',
		warning: 'Do not exceed 10 g per 40 gallons per day. Dissolve in 250 mL freshwater first',
		sourceUrl: 'https://www.seachem.com/reef-adv-calcium.php',
		sourceNote: '5 g per 40 gal raises Ca by 12 ppm (12 * 40 / 5 = 96 -> 9.6 per g per gal)',
	},
	{
		code: 'seachem-reef-complete',
		name: 'Seachem Reef Complete',
		formulaType: 'liquid',
		coefficient: 42.3,
		primaryUnit: 'ml',
		phEffect: 'minimal',
		warning:
			'Do not exceed 12.5 mL per 20 gal per day. Do not mix directly with carbonate supplements',
		sourceUrl: 'https://www.seachem.com/reef-complete.php',
		sourceNote: 'Expert formula m=vc/160; concentration 160,000 ppm Ca (160/3.785 = 42.3)',
	},
	{
		code: 'seachem-reef-calcium',
		name: 'Seachem Reef Calcium',
		formulaType: 'liquid',
		coefficient: 12,
		primaryUnit: 'ml',
		phEffect: 'minimal',
		warning: 'Polygluconate-based — best for maintenance dosing, not large corrections',
		sourceUrl: 'https://www.seachem.com/reef-calcium.php',
		sourceNote:
			'Concentration 50,000 ppm Ca. Label: 5 ml per 20 gal raises Ca by 3 ppm (3 * 20 / 5 = 12)',
	},
	{
		code: 'seachem-fusion-1',
		name: 'Seachem Fusion Part 1',
		formulaType: 'liquid',
		coefficient: 26.42,
		primaryUnit: 'ml',
		phEffect: 'minimal',
		warning: 'Also adds Mg, Sr, and trace elements. Dose equal parts 1 and 2',
		sourceUrl: 'https://www.seachem.com/reef-fusion.php',
		sourceNote:
			'Concentration 100,000 ppm Ca. 1 ml per 6.5 gal raises Ca by 4 ppm (100,000 / 3785 = 26.42)',
	},

	// ── ESV ──────────────────────────────────────────────────────
	{
		code: 'esv-bionic-calcium',
		name: 'ESV B-Ionic Calcium Buffer',
		formulaType: 'liquid',
		coefficient: 16,
		primaryUnit: 'ml',
		phEffect: 'minimal',
		warning: 'Do not exceed 1 ml per gallon per day. Dose alk and Ca at least 1 hour apart',
		sourceUrl: 'https://www.esvaquarium.com/',
		sourceNote: '1 ml per 1 gal raises Ca by 16 ppm',
	},
	{
		code: 'esv-bionic-bicarbonate-2',
		name: 'ESV B-Ionic Bicarbonate System Part 2',
		formulaType: 'liquid',
		coefficient: 4,
		primaryUnit: 'ml',
		phEffect: 'minimal',
		warning: 'Dose equal parts 1 and 2',
		sourceUrl: 'https://www.esvaquarium.com/',
		sourceNote:
			'1/4 strength of standard B-Ionic (16 ppm/ml/gal). No direct manufacturer coefficient published',
	},

	// ── Red Sea ──────────────────────────────────────────────────
	{
		code: 'red-sea-foundation-a-liquid',
		name: 'Red Sea Foundation A (Liquid)',
		formulaType: 'liquid',
		coefficient: 52.8,
		primaryUnit: 'ml',
		phEffect: 'minimal',
		sourceUrl:
			'https://g1.redseafish.com/support/product-support/products/calcium/tabs/faq/Dosing/',
		sourceNote: '1 ml per 100 L (26.42 gal) raises Ca by 2 ppm (2 * 26.42 = 52.8)',
	},
	{
		code: 'red-sea-foundation-a-powder',
		name: 'Red Sea Foundation A (Powder)',
		formulaType: 'powder',
		coefficient: 95.1,
		primaryUnit: 'grams',
		phEffect: 'minimal',
		sourceUrl:
			'https://g1.redseafish.com/support/product-support/products/calcium/tabs/faq/Dosing/',
		sourceNote: '1 g per 100 L (26.42 gal) raises Ca by 3.6 ppm (3.6 * 26.42 = 95.1)',
	},

	// ── Kent Marine ──────────────────────────────────────────────
	{
		code: 'kent-tech-cb-a',
		name: 'Kent Tech-CB Part A',
		formulaType: 'liquid',
		coefficient: 14.7,
		primaryUnit: 'ml',
		phEffect: 'minimal',
		warning: 'Dose equal parts A and B',
		sourceUrl: 'https://www.kentmarine.com/products/kent-tech-cb-part-a.htm',
		sourceNote:
			'Label states 56,000 ppm Ca concentration. 56,000 / 3785 = 14.79, rounded to 14.7',
	},
	{
		code: 'kent-turbo-calcium',
		name: 'Kent Turbo Calcium',
		formulaType: 'powder',
		coefficient: 95.4,
		primaryUnit: 'grams',
		phEffect: 'somewhat-lower',
		warning: 'Anhydrous CaCl2 — exothermic. Dissolve in RO/DI water first. Max 50 ppm/day',
		sourceUrl: 'https://www.kentmarine.com/products/kent-turbo-calcium.htm',
		sourceNote:
			'Pure anhydrous CaCl2. Stoichiometric: MW 110.98, Ca fraction 36.11%. 361.1 / 3.785 = 95.4',
	},
	{
		code: 'kent-liquid-calcium',
		name: 'Kent Liquid Calcium',
		formulaType: 'liquid',
		coefficient: 26.42,
		primaryUnit: 'ml',
		phEffect: 'minimal',
		sourceUrl: 'https://www.kentmarine.com/products/kent-liquid-calcium.htm',
		sourceNote:
			'Label: minimum 10% calcium (100,000 ppm). 100,000 / 3785 = 26.42',
	},

	// ── Two Little Fishies ───────────────────────────────────────
	{
		code: 'tlf-c-balance-a',
		name: 'Two Little Fishies C-Balance Part A',
		formulaType: 'liquid',
		coefficient: 10,
		primaryUnit: 'ml',
		phEffect: 'minimal',
		warning: 'Dose equal parts A and B',
		sourceUrl: 'https://twolittlefishies.com/products/c-balance-250-ml-8-oz',
		sourceNote:
			'No manufacturer coefficient published. Value from reef.diesyst.com calculator. Implies ~37,850 ppm Ca concentration',
	},

	// ── Continuum ────────────────────────────────────────────────
	{
		code: 'continuum-reef-basis-calcium',
		name: 'Continuum Reef Basis Calcium',
		formulaType: 'liquid',
		coefficient: 37,
		primaryUnit: 'ml',
		phEffect: 'minimal',
		sourceUrl: 'https://www.continuumaquatics.com/marine_ca/reefbasis_calcium.php',
		sourceNote:
			'Manufacturer multiplier 0.027: ml = gal * ppm * 0.027. Coefficient = 1/0.027 = 37.04',
	},
	{
		code: 'continuum-reef-basis-calcium-p',
		name: 'Continuum Reef Basis Calcium (Powder)',
		formulaType: 'powder',
		coefficient: 90.9,
		primaryUnit: 'grams',
		phEffect: 'minimal',
		sourceUrl: 'https://continuumaquatics.com/marine_ca/reefbasis_calcium_d.php',
		sourceNote:
			'Manufacturer multiplier 0.011: g = gal * ppm * 0.011. Coefficient = 1/0.011 = 90.91',
	},
	{
		code: 'continuum-reef-sculpture-a',
		name: 'Continuum Reef Sculpture Part A',
		formulaType: 'liquid',
		coefficient: 15,
		primaryUnit: 'ml',
		phEffect: 'minimal',
		warning: 'Dose equal parts A and B',
		sourceUrl: 'https://www.continuumaquatics.com/marine_ca/reef_sculpture.php',
		sourceNote:
			'Manufacturer multiplier 0.0667: ml = gal * ppm * 0.0667. Coefficient = 1/0.0667 = 14.99',
	},

	// ── Tropic Marin ─────────────────────────────────────────────
	{
		code: 'tropic-marin-bio-calcium',
		name: 'Tropic Marin Bio-Calcium',
		formulaType: 'powder',
		coefficient: 40,
		primaryUnit: 'grams',
		phEffect: 'somewhat-higher',
		warning:
			'Also raises alkalinity by ~4 dKH per 7 g per 10 gal. Do not exceed 440 ppm Ca',
		sourceUrl: 'https://www.tropic-marin-smartinfo.com/bio-calcium?lang=en',
		sourceNote: '1 scoop (~7 g) per 10 gal raises Ca by 28 ppm (28 * 10 / 7 = 40)',
	},

	// ── Salifert ─────────────────────────────────────────────────
	{
		code: 'salifert-coral-calcium',
		name: 'Salifert Coral Calcium',
		formulaType: 'liquid',
		coefficient: 42.3,
		primaryUnit: 'ml',
		phEffect: 'minimal',
		warning: 'Never increase calcium by more than 50 ppm per day',
		sourceUrl: 'http://www.salifert.com/sup/cc.htm',
		sourceNote: '5 ml per 100 L (26.42 gal) raises Ca by 8 ppm (8 * 26.42 / 5 = 42.3)',
	},
	{
		code: 'salifert-all-in-one-ca',
		name: 'Salifert All in One (Calcium)',
		formulaType: 'liquid',
		coefficient: 13.2,
		primaryUnit: 'ml',
		phEffect: 'minimal',
		warning: 'Maintenance only — not for large corrections',
		sourceUrl: 'http://www.salifert.com/sup/ca.htm',
		sourceNote:
			'No direct manufacturer coefficient. Value from reef.diesyst.com. Concentration ~55,000 ppm suggests ~14.5',
	},

	// ── Warner Marine ────────────────────────────────────────────
	{
		code: 'warner-calxmax-a',
		name: 'Warner Marine CalxMax Part A',
		formulaType: 'liquid',
		coefficient: 15,
		primaryUnit: 'ml',
		phEffect: 'minimal',
		warning: 'Dose equal parts A and B',
		sourceUrl: 'http://www.warnermarine.com/products/c-max-a/',
		sourceNote:
			'No manufacturer coefficient published. Value from reef.diesyst.com calculator',
	},

	// ── Aquaforest ───────────────────────────────────────────────
	{
		code: 'aquaforest-calcium-p',
		name: 'Aquaforest Calcium (Powder)',
		formulaType: 'powder',
		coefficient: 92.45,
		primaryUnit: 'grams',
		phEffect: 'minimal',
		warning: 'Dissolve in RO/DI water before adding',
		sourceUrl: 'https://aquaforest.eu/en/products/seawater/water-treatment/calcium/',
		sourceNote:
			'10 g in 100 L raises Ca by 35 ppm. 35 / 10 * 26.42 = 92.47',
	},
	{
		code: 'aquaforest-ca-plus',
		name: 'Aquaforest Ca Plus',
		formulaType: 'liquid',
		coefficient: 39.63,
		primaryUnit: 'ml',
		phEffect: 'minimal',
		sourceUrl: 'https://aquaforest.eu/en/products/seawater/water-treatment/ca-plus-2/',
		sourceNote:
			'10 ml raises Ca by 15 ppm in 100 L. 15 / 10 * 26.42 = 39.63',
	},

	// ── Randy Holmes-Farley DIY ──────────────────────────────────
	{
		code: 'randys-recipe-1-ca',
		name: "Randy's Recipe #1 (Calcium)",
		formulaType: 'liquid',
		coefficient: 9.77,
		primaryUnit: 'ml',
		phEffect: 'minimal',
		warning: 'DIY solution — 500 g CaCl2·2H2O dissolved to make 1 US gallon total volume',
		sourceUrl: 'https://reefkeeping.com/issues/2006-02/rhf/index.php',
		sourceNote:
			'Randy Holmes-Farley original recipe. Stated concentration ~37,000 ppm Ca. 37,000 / 3785 = 9.77',
	},
	{
		code: 'randys-recipe-2-ca',
		name: "Randy's Recipe #2 (Calcium)",
		formulaType: 'liquid',
		coefficient: 4.9,
		primaryUnit: 'ml',
		phEffect: 'minimal',
		warning: 'DIY solution — 250 g CaCl2·2H2O dissolved to make 1 US gallon total volume',
		sourceUrl: 'https://reefkeeping.com/issues/2006-02/rhf/index.php',
		sourceNote:
			'Randy Holmes-Farley original recipe. Half concentration of Recipe #1. ~18,500 ppm Ca. 9.77 / 2 = 4.9',
	},

	// ── Fritz ────────────────────────────────────────────────────
	{
		code: 'fritz-anhydrous-cacl2',
		name: 'Fritz ProAquatics Anhydrous CaCl2',
		formulaType: 'powder',
		coefficient: 95.4,
		primaryUnit: 'grams',
		phEffect: 'somewhat-lower',
		warning: 'Exothermic — dissolve in RO/DI water first. Max 50 ppm/day',
		sourceUrl: 'https://fritzaquatics.com/products/fritzpro-calcium-chloride',
		sourceNote:
			'Stoichiometric: pure anhydrous CaCl2, MW 110.98, Ca fraction 36.11%. Fritz label: 1 g per 10 gal = ~10 ppm (rounded)',
	},

	// ── MEcoral ──────────────────────────────────────────────────
	{
		code: 'mecoral-calcium',
		name: 'MEcoral Calcium',
		formulaType: 'liquid',
		coefficient: 10,
		primaryUnit: 'ml',
		phEffect: 'minimal',
		sourceUrl: 'https://mecoral.com/product/me-calcium/',
		sourceNote:
			'Manufacturer: "100 ml per 100 gal raises Ca by 10 ppm." 10 * 100 / 100 = 10',
	},

	// ── Oceans Blend ─────────────────────────────────────────────
	{
		code: 'oceans-blend-part-1',
		name: 'Oceans Blend Part 1',
		formulaType: 'liquid',
		coefficient: 10,
		primaryUnit: 'ml',
		phEffect: 'minimal',
		warning: 'Also contains magnesium',
		sourceUrl: 'https://www.oceansblend.com/2_part.html',
		sourceNote:
			'No manufacturer coefficient published. Value from reef.diesyst.com calculator',
	},

	// ── Generic / DIY ────────────────────────────────────────────
	{
		code: 'calcium-chloride',
		name: 'Calcium Chloride (CaCl2·2H2O)',
		formulaType: 'powder',
		coefficient: 72,
		primaryUnit: 'grams',
		phEffect: 'somewhat-lower',
		warning:
			'Exothermic — dissolve in RO/DI water first. Can deplete alkalinity. Max 50 ppm/day',
		sourceUrl:
			'https://www.bulkreefsupply.com/content/post/brs-pharma-calcium-chloride-mixing-and-dosing-instructions',
		sourceNote:
			'Stoichiometric: MW 147.01, Ca fraction 27.26%. 1 g per 3.785 L = 272.6 mg / 3.785 L = 72 ppm',
	},
	{
		code: 'kalkwasser',
		name: 'Kalkwasser (Saturated Ca(OH)2)',
		formulaType: 'limewater',
		coefficient: 0.254,
		primaryUnit: 'ml',
		phEffect: 'substantially-higher',
		warning:
			'pH ~12.4 — add very slowly via ATO only. Cannot raise Ca rapidly due to low solubility. Also raises alkalinity',
		sourceUrl:
			'https://www.bulkreefsupply.com/content/post/using-kalkwasser',
		sourceNote:
			'1 gal (3785 ml) saturated solution per 40 gal tank raises Ca by 24 ppm (24 * 40 / 3785 = 0.254)',
	},
]
