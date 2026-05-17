import { type MetaFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { json, Link, useLoaderData } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { Icon } from '#app/components/ui/icon.tsx'
import { Input } from '#app/components/ui/input.tsx'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'
import { alkalinityProducts } from '#app/utils/dosing-calculator/alkalinity-products.js'
import { calciumProducts } from '#app/utils/dosing-calculator/calcium-products.js'
import {
	calculateDose,
	formatAmount,
	toGallons,
	alkToMeqL,
} from '#app/utils/dosing-calculator/calculations.js'
import { magnesiumProducts } from '#app/utils/dosing-calculator/magnesium-products.js'
import {
	type AlkUnit,
	type DosingProduct,
	type PhEffect,
	type VolumeUnit,
	type CalculationResult,
} from '#app/utils/dosing-calculator/types.js'

type DosingTab = 'ca' | 'alk' | 'mg'

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request, { redirectTo: '/' })
	const tanks = await prisma.fishTank.findMany({
		select: { id: true, name: true, volume: true },
		where: { userId },
	})
	return json({ tanks })
}

export const meta: MetaFunction = () => [
	{ title: 'ReefChronicles | Dosing Calculator' },
]

function saveProductPref(key: string, code: string) {
	try {
		const saved = localStorage.getItem('dosing-products')
		const prefs = (saved ? JSON.parse(saved) : {}) as Record<string, string>
		prefs[key] = code
		localStorage.setItem('dosing-products', JSON.stringify(prefs))
	} catch {
		// storage unavailable
	}
}

export default function DosingCalculatorPage() {
	const { tanks } = useLoaderData<typeof loader>()
	const [activeTab, setActiveTab] = useState<DosingTab>('ca')
	const [selectedTankId, setSelectedTankId] = useState<string | null>(null)
	const [volume, setVolume] = useState('')
	const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>('gallons')

	function handleTankSelect(tankId: string) {
		if (selectedTankId === tankId) {
			setSelectedTankId(null)
			return
		}
		const tank = tanks.find((t) => t.id === tankId)
		if (tank?.volume) {
			setSelectedTankId(tankId)
			setVolume(String(tank.volume))
			setVolumeUnit('gallons')
		}
	}

	const [caCurrent, setCaCurrent] = useState('')
	const [caDesired, setCaDesired] = useState('')
	const [caProduct, setCaProduct] = useState('brightwell-calcion')

	const [alkUnit, setAlkUnit] = useState<AlkUnit>('dKH')
	const [alkCurrent, setAlkCurrent] = useState('')
	const [alkDesired, setAlkDesired] = useState('')
	const [alkProduct, setAlkProduct] = useState('brightwell-alkalin83')

	const [mgCurrent, setMgCurrent] = useState('')
	const [mgDesired, setMgDesired] = useState('')
	const [mgProduct, setMgProduct] = useState('brightwell-magnesion')

	useEffect(() => {
		const saved = localStorage.getItem('dosing-products')
		if (!saved) return
		try {
			const prefs = JSON.parse(saved) as Record<string, string>
			if (prefs.ca) setCaProduct(prefs.ca)
			if (prefs.alk) setAlkProduct(prefs.alk)
			if (prefs.mg) setMgProduct(prefs.mg)
		} catch {
			// ignore corrupt data
		}
	}, [])

	function handleCaProductChange(code: string) {
		setCaProduct(code)
		saveProductPref('ca', code)
	}
	function handleAlkProductChange(code: string) {
		setAlkProduct(code)
		saveProductPref('alk', code)
	}
	function handleMgProductChange(code: string) {
		setMgProduct(code)
		saveProductPref('mg', code)
	}

	const volumeGal = toGallons(Number(volume) || 0, volumeUnit)

	const selectedCa = calciumProducts.find((p) => p.code === caProduct)!
	const caDelta = (Number(caDesired) || 0) - (Number(caCurrent) || 0)
	const caResult = calculateDose(selectedCa, caDelta, volumeGal)

	const selectedAlk = alkalinityProducts.find((p) => p.code === alkProduct)!
	const alkCurrentMeq = alkToMeqL(Number(alkCurrent) || 0, alkUnit)
	const alkDesiredMeq = alkToMeqL(Number(alkDesired) || 0, alkUnit)
	const alkDeltaDkh = (alkDesiredMeq - alkCurrentMeq) * 2.8
	const alkResult = calculateDose(selectedAlk, alkDeltaDkh, volumeGal)

	const selectedMg = magnesiumProducts.find((p) => p.code === mgProduct)!
	const mgDelta = (Number(mgDesired) || 0) - (Number(mgCurrent) || 0)
	const mgResult = calculateDose(selectedMg, mgDelta, volumeGal)

	const tabs: Array<{ key: DosingTab; label: string }> = [
		{ key: 'ca', label: 'Calcium' },
		{ key: 'alk', label: 'Alkalinity' },
		{ key: 'mg', label: 'Magnesium' },
	]

	return (
		<div>
			<header className="mb-8">
				<Link to="/dashboard">
					<span className="flex gap-1 text-muted-foreground">
						<Icon name="arrow-left" /> Back to Dashboard
					</span>
				</Link>
				<h1 className="mt-4 text-3xl font-bold text-foreground">
					Dosing Calculator
				</h1>
				<p className="text-muted-foreground">
					Calculate how much product to dose based on your current and target
					water parameters
				</p>
			</header>

			{tanks.length > 0 && (
				<div className="mb-4">
					<label className="mb-2 block text-sm font-medium text-foreground">
						Select a Tank
					</label>
					<div className="flex flex-wrap gap-2">
						{tanks.map((tank) => (
							<button
								key={tank.id}
								type="button"
								onClick={() => handleTankSelect(tank.id)}
								className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
									selectedTankId === tank.id
										? 'border-primary bg-primary text-primary-foreground'
										: 'border-input bg-background text-foreground hover:bg-accent'
								}`}
							>
								{tank.name}
								{tank.volume ? ` (${tank.volume} gal)` : ''}
							</button>
						))}
					</div>
				</div>
			)}

			<div className="mb-8 flex flex-wrap items-end gap-4">
				<div>
					<label className="mb-1 block text-sm font-medium text-foreground">
						Tank Volume
					</label>
					<Input
						type="number"
						min="0"
						step="any"
						placeholder="0"
						value={volume}
						onChange={(e) => {
							setVolume(e.target.value)
							setSelectedTankId(null)
						}}
						className="w-32"
					/>
				</div>
				<div>
					<select
						value={volumeUnit}
						onChange={(e) =>
							setVolumeUnit(e.target.value as VolumeUnit)
						}
						className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
					>
						<option value="gallons">Gallons</option>
						<option value="liters">Liters</option>
					</select>
				</div>
			</div>

			<div className="rounded-lg border p-4">
				<div
					aria-label="Dosing parameter"
					className="mb-4 grid grid-cols-3 gap-1 rounded-md bg-muted p-1"
					role="tablist"
				>
					{tabs.map((tab) => (
						<button
							key={tab.key}
							type="button"
							id={`dosing-tab-${tab.key}`}
							aria-controls={`dosing-panel-${tab.key}`}
							aria-selected={activeTab === tab.key}
							role="tab"
							onClick={() => setActiveTab(tab.key)}
							className={`rounded px-3 py-2 text-sm font-medium transition-colors ${
								activeTab === tab.key
									? 'bg-background text-foreground shadow-sm'
									: 'text-muted-foreground hover:text-foreground'
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>

				{activeTab === 'ca' && (
					<div
						id="dosing-panel-ca"
						aria-labelledby="dosing-tab-ca"
						role="tabpanel"
					>
						<ParameterPanel
							unit="ppm"
							current={caCurrent}
							desired={caDesired}
							onCurrentChange={setCaCurrent}
							onDesiredChange={setCaDesired}
							products={calciumProducts}
							selectedProduct={caProduct}
							onProductChange={handleCaProductChange}
							result={caResult}
							product={selectedCa}
						/>
					</div>
				)}

				{activeTab === 'alk' && (
					<div
						id="dosing-panel-alk"
						aria-labelledby="dosing-tab-alk"
						role="tabpanel"
					>
						<AlkalinityPanel
							alkUnit={alkUnit}
							onAlkUnitChange={setAlkUnit}
							current={alkCurrent}
							desired={alkDesired}
							onCurrentChange={setAlkCurrent}
							onDesiredChange={setAlkDesired}
							selectedProduct={alkProduct}
							onProductChange={handleAlkProductChange}
							result={alkResult}
							product={selectedAlk}
						/>
					</div>
				)}

				{activeTab === 'mg' && (
					<div
						id="dosing-panel-mg"
						aria-labelledby="dosing-tab-mg"
						role="tabpanel"
					>
						<ParameterPanel
							unit="ppm"
							current={mgCurrent}
							desired={mgDesired}
							onCurrentChange={setMgCurrent}
							onDesiredChange={setMgDesired}
							products={magnesiumProducts}
							selectedProduct={mgProduct}
							onProductChange={handleMgProductChange}
							result={mgResult}
							product={selectedMg}
						/>
					</div>
				)}
			</div>
		</div>
	)
}

function AlkalinityPanel({
	alkUnit,
	onAlkUnitChange,
	current,
	desired,
	onCurrentChange,
	onDesiredChange,
	selectedProduct,
	onProductChange,
	result,
	product,
}: {
	alkUnit: AlkUnit
	onAlkUnitChange: (v: AlkUnit) => void
	current: string
	desired: string
	onCurrentChange: (v: string) => void
	onDesiredChange: (v: string) => void
	selectedProduct: string
	onProductChange: (v: string) => void
	result: CalculationResult | null
	product: DosingProduct
}) {
	return (
		<div className="space-y-3">
			<div>
				<label className="mb-1 block text-sm text-muted-foreground">
					Unit
				</label>
				<select
					value={alkUnit}
					onChange={(e) => onAlkUnitChange(e.target.value as AlkUnit)}
					className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
				>
					<option value="dKH">dKH</option>
					<option value="meq/L">meq/L</option>
					<option value="ppm">ppm CaCO3</option>
				</select>
			</div>
			<ParameterPanel
				unit={alkUnit}
				current={current}
				desired={desired}
				onCurrentChange={onCurrentChange}
				onDesiredChange={onDesiredChange}
				products={alkalinityProducts}
				selectedProduct={selectedProduct}
				onProductChange={onProductChange}
				result={result}
				product={product}
			/>
		</div>
	)
}

function ParameterPanel({
	unit,
	current,
	desired,
	onCurrentChange,
	onDesiredChange,
	products,
	selectedProduct,
	onProductChange,
	result,
	product,
}: {
	unit: string
	current: string
	desired: string
	onCurrentChange: (v: string) => void
	onDesiredChange: (v: string) => void
	products: DosingProduct[]
	selectedProduct: string
	onProductChange: (v: string) => void
	result: CalculationResult | null
	product: DosingProduct
}) {
	return (
		<div className="space-y-3">
			<div className="grid gap-3 md:grid-cols-2">
				<div>
					<label className="mb-1 block text-sm text-muted-foreground">
						Current ({unit})
					</label>
					<Input
						type="number"
						min="0"
						step="any"
						placeholder="0"
						value={current}
						onChange={(e) => onCurrentChange(e.target.value)}
					/>
				</div>
				<div>
					<label className="mb-1 block text-sm text-muted-foreground">
						Desired ({unit})
					</label>
					<Input
						type="number"
						min="0"
						step="any"
						placeholder="0"
						value={desired}
						onChange={(e) => onDesiredChange(e.target.value)}
					/>
				</div>
			</div>
			<div>
				<label className="mb-1 block text-sm text-muted-foreground">
					Product
				</label>
				<select
					value={selectedProduct}
					onChange={(e) => onProductChange(e.target.value)}
					className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
				>
					{products.map((p) => (
						<option key={p.code} value={p.code}>
							{p.name}
						</option>
					))}
				</select>
			</div>
			<ResultDisplay result={result} product={product} />
		</div>
	)
}

function ResultDisplay({
	result,
	product,
}: {
	result: CalculationResult | null
	product: DosingProduct
}) {
	return (
		<>
			{result ? (
				<div className="rounded border bg-accent/30 p-3">
					<p className="text-lg font-bold text-foreground">
						{formatAmount(result.primaryAmount)} {result.primaryUnit}
					</p>
					{result.secondaryAmount > 0.01 && (
						<p className="text-sm text-muted-foreground">
							({formatAmount(result.secondaryAmount)}{' '}
							{result.secondaryUnit})
						</p>
					)}
					{result.tertiaryAmount &&
						result.tertiaryUnit &&
						result.tertiaryAmount > 0.01 && (
							<p className="text-sm text-muted-foreground">
								({formatAmount(result.tertiaryAmount)}{' '}
								{result.tertiaryUnit})
							</p>
						)}
				</div>
			) : (
				<div className="rounded border border-dashed p-3 text-center text-sm text-muted-foreground">
					Enter values above to calculate
				</div>
			)}
			<div className="flex items-center gap-2">
				<PhBadge effect={product.phEffect} />
			</div>
			{product.warning && (
				<p className="text-xs text-yellow-500">⚠ {product.warning}</p>
			)}
		</>
	)
}

const phLabels: Record<PhEffect, string> = {
	minimal: 'pH: Minimal impact',
	'somewhat-higher': 'pH: Somewhat higher',
	higher: 'pH: Higher',
	'substantially-higher': 'pH: Substantially higher',
	'somewhat-lower': 'pH: Somewhat lower',
	lower: 'pH: Lower',
	'largely-unchanged': 'pH: Largely unchanged',
}

const phColors: Record<PhEffect, string> = {
	minimal: 'bg-green-500/20 text-green-400',
	'somewhat-higher': 'bg-yellow-500/20 text-yellow-400',
	higher: 'bg-orange-500/20 text-orange-400',
	'substantially-higher': 'bg-red-500/20 text-red-400',
	'somewhat-lower': 'bg-yellow-500/20 text-yellow-400',
	lower: 'bg-orange-500/20 text-orange-400',
	'largely-unchanged': 'bg-green-500/20 text-green-400',
}

function PhBadge({ effect }: { effect: PhEffect }) {
	return (
		<span
			className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${phColors[effect]}`}
		>
			{phLabels[effect]}
		</span>
	)
}
