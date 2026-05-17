import { useState } from 'react'
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
	type VolumeUnit,
	type PhEffect,
	type CalculationResult,
	type DosingProduct,
} from '#app/utils/dosing-calculator/types.js'

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

export function DosingCalculatorWidget() {
	const [activeTab, setActiveTab] = useState<'ca' | 'alk' | 'mg'>('ca')

	const [volume, setVolume] = useState('')
	const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>('gallons')

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

	const tabs = [
		{ key: 'ca' as const, label: 'Calcium', unit: 'ppm' },
		{ key: 'alk' as const, label: 'Alkalinity', unit: alkUnit },
		{ key: 'mg' as const, label: 'Magnesium', unit: 'ppm' },
	]

	return (
		<div className="mx-auto w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-sm">
			<div className="mb-6 flex flex-wrap items-end gap-4">
				<div>
					<label className="mb-1 block text-sm font-medium text-slate-300">
						Tank Volume
					</label>
					<input
						type="number"
						min="0"
						step="any"
						placeholder="0"
						value={volume}
						onChange={(e) => setVolume(e.target.value)}
						className="h-10 w-32 rounded-md border border-slate-600 bg-slate-800 px-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
					/>
				</div>
				<div>
					<select
						value={volumeUnit}
						onChange={(e) => setVolumeUnit(e.target.value as VolumeUnit)}
						className="h-10 rounded-md border border-slate-600 bg-slate-800 px-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
					>
						<option value="gallons">Gallons</option>
						<option value="liters">Liters</option>
					</select>
				</div>
			</div>

			<div className="mb-6 flex gap-1 rounded-lg bg-slate-800 p-1">
				{tabs.map((tab) => (
					<button
						key={tab.key}
						onClick={() => setActiveTab(tab.key)}
						className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
							activeTab === tab.key
								? 'bg-indigo-600 text-white'
								: 'text-slate-400 hover:text-white'
						}`}
					>
						{tab.label}
					</button>
				))}
			</div>

			{activeTab === 'ca' && (
				<ParameterForm
					unit="ppm"
					current={caCurrent}
					desired={caDesired}
					onCurrentChange={setCaCurrent}
					onDesiredChange={setCaDesired}
					products={calciumProducts}
					selectedProduct={caProduct}
					onProductChange={setCaProduct}
					result={caResult}
					product={selectedCa}
				/>
			)}

			{activeTab === 'alk' && (
				<div className="space-y-4">
					<div>
						<label className="mb-1 block text-sm text-slate-400">Unit</label>
						<select
							value={alkUnit}
							onChange={(e) => setAlkUnit(e.target.value as AlkUnit)}
							className="h-10 w-full rounded-md border border-slate-600 bg-slate-800 px-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
						>
							<option value="dKH">dKH</option>
							<option value="meq/L">meq/L</option>
							<option value="ppm">ppm CaCO3</option>
						</select>
					</div>
					<ParameterForm
						unit={alkUnit}
						current={alkCurrent}
						desired={alkDesired}
						onCurrentChange={setAlkCurrent}
						onDesiredChange={setAlkDesired}
						products={alkalinityProducts}
						selectedProduct={alkProduct}
						onProductChange={setAlkProduct}
						result={alkResult}
						product={selectedAlk}
					/>
				</div>
			)}

			{activeTab === 'mg' && (
				<ParameterForm
					unit="ppm"
					current={mgCurrent}
					desired={mgDesired}
					onCurrentChange={setMgCurrent}
					onDesiredChange={setMgDesired}
					products={magnesiumProducts}
					selectedProduct={mgProduct}
					onProductChange={setMgProduct}
					result={mgResult}
					product={selectedMg}
				/>
			)}
		</div>
	)
}

function ParameterForm({
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
		<div className="space-y-4">
			<div className="grid grid-cols-2 gap-4">
				<div>
					<label className="mb-1 block text-sm text-slate-400">
						Current ({unit})
					</label>
					<input
						type="number"
						min="0"
						step="any"
						placeholder="0"
						value={current}
						onChange={(e) => onCurrentChange(e.target.value)}
						className="h-10 w-full rounded-md border border-slate-600 bg-slate-800 px-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
					/>
				</div>
				<div>
					<label className="mb-1 block text-sm text-slate-400">
						Desired ({unit})
					</label>
					<input
						type="number"
						min="0"
						step="any"
						placeholder="0"
						value={desired}
						onChange={(e) => onDesiredChange(e.target.value)}
						className="h-10 w-full rounded-md border border-slate-600 bg-slate-800 px-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
					/>
				</div>
			</div>

			<div>
				<label className="mb-1 block text-sm text-slate-400">Product</label>
				<select
					value={selectedProduct}
						onChange={(e) => onProductChange(e.target.value)}
						className="h-10 w-full rounded-md border border-slate-600 bg-slate-800 px-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
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
		<div className="space-y-3">
			{result ? (
				<div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-4">
					<p className="text-2xl font-bold text-white">
						{formatAmount(result.primaryAmount)} {result.primaryUnit}
					</p>
					{result.secondaryAmount > 0.01 && (
						<p className="text-sm text-slate-400">
							≈ {formatAmount(result.secondaryAmount)} {result.secondaryUnit}
						</p>
					)}
					{result.tertiaryAmount &&
						result.tertiaryUnit &&
						result.tertiaryAmount > 0.01 && (
							<p className="text-sm text-slate-400">
								≈ {formatAmount(result.tertiaryAmount)} {result.tertiaryUnit}
							</p>
						)}
				</div>
			) : (
				<div className="rounded-lg border border-dashed border-slate-600 p-4 text-center text-sm text-slate-500">
					Enter your current and desired values to calculate the dose
				</div>
			)}

			<div className="flex flex-wrap items-center gap-2">
				<PhBadge effect={product.phEffect} />
			</div>

			{product.warning && (
				<p className="text-xs text-yellow-400">
					⚠ {product.warning}
				</p>
			)}
		</div>
	)
}

function PhBadge({ effect }: { effect: PhEffect }) {
	return (
		<span
			className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${phColors[effect]}`}
		>
			{phLabels[effect]}
		</span>
	)
}
