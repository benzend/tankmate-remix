import { useState, useMemo, useEffect } from 'react'
import {
	View,
	Text,
	ScrollView,
	Pressable,
	Modal,
	FlatList,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Input } from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { colors } from '../theme/colors'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTanks } from '../hooks/useTanks'
import { type Tank } from '../lib/api'
import { calciumProducts } from '../lib/dosing-calculator/calcium-products'
import { alkalinityProducts } from '../lib/dosing-calculator/alkalinity-products'
import { magnesiumProducts } from '../lib/dosing-calculator/magnesium-products'
import {
	calculateDose,
	formatAmount,
	toGallons,
	alkToMeqL,
} from '../lib/dosing-calculator/calculations'
import {
	type AlkUnit,
	type DosingProduct,
	type PhEffect,
	type VolumeUnit,
	type CalculationResult,
} from '../lib/dosing-calculator/types'

const phLabels: Record<PhEffect, string> = {
	minimal: 'pH: Minimal impact',
	'somewhat-higher': 'pH: Somewhat higher',
	higher: 'pH: Higher',
	'substantially-higher': 'pH: Substantially higher',
	'somewhat-lower': 'pH: Somewhat lower',
	lower: 'pH: Lower',
	'largely-unchanged': 'pH: Largely unchanged',
}

const phBadgeVariant: Record<PhEffect, 'success' | 'warning' | 'destructive' | 'default'> = {
	minimal: 'success',
	'somewhat-higher': 'warning',
	higher: 'warning',
	'substantially-higher': 'destructive',
	'somewhat-lower': 'warning',
	lower: 'warning',
	'largely-unchanged': 'success',
}

const alkUnitOptions: { value: AlkUnit; label: string }[] = [
	{ value: 'dKH', label: 'dKH' },
	{ value: 'meq/L', label: 'meq/L' },
	{ value: 'ppm', label: 'ppm CaCO3' },
]

const volumeUnitOptions: { value: VolumeUnit; label: string }[] = [
	{ value: 'gallons', label: 'Gallons' },
	{ value: 'liters', label: 'Liters' },
]

export default function DosingScreen() {
	const router = useRouter()
	const { data: tanks } = useTanks()

	const [selectedTankId, setSelectedTankId] = useState<string | null>(null)
	const [volume, setVolume] = useState('')
	const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>('gallons')

	const handleTankSelect = (tank: Tank) => {
		setSelectedTankId(tank.id)
		if (tank.volume) {
			setVolume(String(tank.volume))
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
		AsyncStorage.getItem('dosing-products').then((saved) => {
			if (!saved) return
			try {
				const prefs = JSON.parse(saved) as Record<string, string>
				if (prefs.ca) setCaProduct(prefs.ca)
				if (prefs.alk) setAlkProduct(prefs.alk)
				if (prefs.mg) setMgProduct(prefs.mg)
			} catch {
				// ignore corrupt data
			}
		})
	}, [])

	const saveProductPref = (key: string, code: string) => {
		AsyncStorage.getItem('dosing-products').then((saved) => {
			const prefs = (saved ? JSON.parse(saved) : {}) as Record<string, string>
			prefs[key] = code
			AsyncStorage.setItem('dosing-products', JSON.stringify(prefs))
		}).catch(() => {})
	}

	const handleCaProductChange = (code: string) => {
		setCaProduct(code)
		saveProductPref('ca', code)
	}
	const handleAlkProductChange = (code: string) => {
		setAlkProduct(code)
		saveProductPref('alk', code)
	}
	const handleMgProductChange = (code: string) => {
		setMgProduct(code)
		saveProductPref('mg', code)
	}

	const volumeGal = toGallons(Number(volume) || 0, volumeUnit)

	const selectedCa = useMemo(
		() => calciumProducts.find((p) => p.code === caProduct)!,
		[caProduct],
	)
	const caDelta = (Number(caDesired) || 0) - (Number(caCurrent) || 0)
	const caResult = calculateDose(selectedCa, caDelta, volumeGal)

	const selectedAlk = useMemo(
		() => alkalinityProducts.find((p) => p.code === alkProduct)!,
		[alkProduct],
	)
	const alkCurrentMeq = alkToMeqL(Number(alkCurrent) || 0, alkUnit)
	const alkDesiredMeq = alkToMeqL(Number(alkDesired) || 0, alkUnit)
	const alkDeltaDkh = (alkDesiredMeq - alkCurrentMeq) * 2.8
	const alkResult = calculateDose(selectedAlk, alkDeltaDkh, volumeGal)

	const selectedMg = useMemo(
		() => magnesiumProducts.find((p) => p.code === mgProduct)!,
		[mgProduct],
	)
	const mgDelta = (Number(mgDesired) || 0) - (Number(mgCurrent) || 0)
	const mgResult = calculateDose(selectedMg, mgDelta, volumeGal)

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
			{/* Header */}
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					paddingHorizontal: 16,
					paddingVertical: 12,
					gap: 12,
					borderBottomWidth: 1,
					borderBottomColor: colors.border,
				}}
			>
				<Pressable onPress={() => router.back()}>
					<Ionicons name="arrow-back" size={24} color={colors.foreground} />
				</Pressable>
				<Text
					style={{
						fontSize: 18,
						fontWeight: '600',
						color: colors.foreground,
					}}
				>
					Dosing Calculator
				</Text>
			</View>

			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
				automaticallyAdjustKeyboardInsets
				keyboardShouldPersistTaps="handled"
			>
				{/* Tank Picker */}
				{tanks && tanks.length > 0 ? (
					<View style={{ marginBottom: 16 }}>
						<Text
							style={{
								color: colors.foreground,
								fontSize: 14,
								fontWeight: '500',
								marginBottom: 8,
							}}
						>
							Select Tank
						</Text>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={{ gap: 8 }}
						>
							{tanks.map((tank) => (
								<Pressable
									key={tank.id}
									onPress={() => handleTankSelect(tank)}
									style={{
										paddingHorizontal: 14,
										paddingVertical: 10,
										borderRadius: 10,
										borderWidth: 1,
										borderColor:
											selectedTankId === tank.id
												? colors.primary
												: colors.border,
										backgroundColor:
											selectedTankId === tank.id
												? colors.primary
												: colors.accent,
									}}
								>
									<Text
										style={{
											color:
												selectedTankId === tank.id
													? colors.primaryForeground
													: colors.foreground,
											fontSize: 14,
											fontWeight: selectedTankId === tank.id ? '600' : '400',
										}}
										numberOfLines={1}
									>
										{tank.name}
									</Text>
									{tank.volume ? (
										<Text
											style={{
												color:
													selectedTankId === tank.id
														? colors.primaryForeground
														: colors.mutedForeground,
												fontSize: 12,
												marginTop: 2,
												opacity: selectedTankId === tank.id ? 0.8 : 1,
											}}
										>
											{tank.volume} gal
										</Text>
									) : null}
								</Pressable>
							))}
						</ScrollView>
					</View>
				) : null}

				{/* Volume Section */}
				<View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
					<Input
						label="Tank Volume"
						value={volume}
						onChangeText={setVolume}
						keyboardType="decimal-pad"
						placeholder="0"
						containerStyle={{ flex: 1 }}
					/>
					<OptionPicker
						label="Unit"
						options={volumeUnitOptions}
						selectedValue={volumeUnit}
						onSelect={(v) => setVolumeUnit(v as VolumeUnit)}
						style={{ minWidth: 160 }}
					/>
				</View>

				{/* Calcium */}
				<ParameterSection
					title="Calcium"
					color={colors.chart.calcium}
					unit="ppm"
					current={caCurrent}
					desired={caDesired}
					onCurrentChange={setCaCurrent}
					onDesiredChange={setCaDesired}
					products={calciumProducts}
					selectedProductCode={caProduct}
					onProductChange={handleCaProductChange}
					result={caResult}
					product={selectedCa}
				/>

				{/* Alkalinity */}
				<Card style={{ marginBottom: 16 }}>
					<CardContent>
						<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
							<View
								style={{
									width: 4,
									height: 20,
									backgroundColor: colors.chart.alk,
									borderRadius: 2,
									marginRight: 8,
								}}
							/>
							<Text style={{ fontSize: 18, fontWeight: '600', color: colors.foreground }}>
								Alkalinity
							</Text>
						</View>

						<OptionPicker
							label="Unit"
							options={alkUnitOptions}
							selectedValue={alkUnit}
							onSelect={(v) => setAlkUnit(v as AlkUnit)}
							style={{ marginBottom: 12 }}
						/>

						<View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
							<Input
								label={`Current (${alkUnit})`}
								value={alkCurrent}
								onChangeText={setAlkCurrent}
								keyboardType="decimal-pad"
								placeholder="0"
								containerStyle={{ width: '47%' }}
							/>
							<Input
								label={`Desired (${alkUnit})`}
								value={alkDesired}
								onChangeText={setAlkDesired}
								keyboardType="decimal-pad"
								placeholder="0"
								containerStyle={{ width: '47%' }}
							/>
						</View>

						<ProductPicker
							products={alkalinityProducts}
							selectedCode={alkProduct}
							onSelect={handleAlkProductChange}
						/>

						<ResultDisplay result={alkResult} product={selectedAlk} />
					</CardContent>
				</Card>

				{/* Magnesium */}
				<ParameterSection
					title="Magnesium"
					color={colors.chart.magnesium}
					unit="ppm"
					current={mgCurrent}
					desired={mgDesired}
					onCurrentChange={setMgCurrent}
					onDesiredChange={setMgDesired}
					products={magnesiumProducts}
					selectedProductCode={mgProduct}
					onProductChange={handleMgProductChange}
					result={mgResult}
					product={selectedMg}
				/>
			</ScrollView>
		</SafeAreaView>
	)
}

function ParameterSection({
	title,
	color,
	unit,
	current,
	desired,
	onCurrentChange,
	onDesiredChange,
	products,
	selectedProductCode,
	onProductChange,
	result,
	product,
}: {
	title: string
	color: string
	unit: string
	current: string
	desired: string
	onCurrentChange: (v: string) => void
	onDesiredChange: (v: string) => void
	products: DosingProduct[]
	selectedProductCode: string
	onProductChange: (code: string) => void
	result: CalculationResult | null
	product: DosingProduct
}) {
	return (
		<Card style={{ marginBottom: 16 }}>
			<CardContent>
				<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
					<View
						style={{
							width: 4,
							height: 20,
							backgroundColor: color,
							borderRadius: 2,
							marginRight: 8,
						}}
					/>
					<Text style={{ fontSize: 18, fontWeight: '600', color: colors.foreground }}>
						{title}
					</Text>
				</View>

				<View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
					<Input
						label={`Current (${unit})`}
						value={current}
						onChangeText={onCurrentChange}
						keyboardType="decimal-pad"
						placeholder="0"
						containerStyle={{ width: '47%' }}
					/>
					<Input
						label={`Desired (${unit})`}
						value={desired}
						onChangeText={onDesiredChange}
						keyboardType="decimal-pad"
						placeholder="0"
						containerStyle={{ width: '47%' }}
					/>
				</View>

				<ProductPicker
					products={products}
					selectedCode={selectedProductCode}
					onSelect={onProductChange}
				/>

				<ResultDisplay result={result} product={product} />
			</CardContent>
		</Card>
	)
}

function ProductPicker({
	products,
	selectedCode,
	onSelect,
}: {
	products: DosingProduct[]
	selectedCode: string
	onSelect: (code: string) => void
}) {
	const [visible, setVisible] = useState(false)
	const selected = products.find((p) => p.code === selectedCode)

	return (
		<View style={{ marginBottom: 12 }}>
			<Text
				style={{
					color: colors.foreground,
					fontSize: 14,
					fontWeight: '500',
					marginBottom: 6,
				}}
			>
				Product
			</Text>
			<Pressable
				onPress={() => setVisible(true)}
				style={{
					backgroundColor: colors.accent,
					borderWidth: 1,
					borderColor: colors.border,
					borderRadius: 8,
					paddingHorizontal: 14,
					paddingVertical: 12,
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'space-between',
					minHeight: 44,
				}}
			>
				<Text
					style={{ color: colors.foreground, fontSize: 16, flex: 1 }}
					numberOfLines={1}
				>
					{selected?.name ?? 'Select product'}
				</Text>
				<Ionicons name="chevron-down" size={18} color={colors.mutedForeground} />
			</Pressable>

			<Modal
				visible={visible}
				animationType="slide"
				presentationStyle="pageSheet"
				onRequestClose={() => setVisible(false)}
			>
				<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'space-between',
							paddingHorizontal: 16,
							paddingVertical: 12,
							borderBottomWidth: 1,
							borderBottomColor: colors.border,
						}}
					>
						<Text style={{ fontSize: 18, fontWeight: '600', color: colors.foreground }}>
							Select Product
						</Text>
						<Pressable onPress={() => setVisible(false)}>
							<Ionicons name="close" size={24} color={colors.foreground} />
						</Pressable>
					</View>
					<FlatList
						data={products}
						keyExtractor={(item) => item.code}
						contentContainerStyle={{ padding: 16 }}
						renderItem={({ item }) => (
							<Pressable
								onPress={() => {
									onSelect(item.code)
									setVisible(false)
								}}
								style={({ pressed }) => ({
									backgroundColor:
										item.code === selectedCode
											? colors.accent
											: pressed
												? colors.accent
												: 'transparent',
									borderRadius: 10,
									padding: 14,
									marginBottom: 4,
									flexDirection: 'row',
									alignItems: 'center',
									gap: 10,
								})}
							>
								<View style={{ flex: 1 }}>
									<Text
										style={{
											color: colors.foreground,
											fontSize: 16,
											fontWeight: item.code === selectedCode ? '600' : '400',
										}}
									>
										{item.name}
									</Text>
									<Text style={{ color: colors.mutedForeground, fontSize: 13, marginTop: 2 }}>
										{item.formulaType === 'liquid' ? 'Liquid' : item.formulaType === 'powder' ? 'Powder' : 'Limewater'}
									</Text>
								</View>
								{item.code === selectedCode ? (
									<Ionicons name="checkmark" size={20} color={colors.primary} />
								) : null}
							</Pressable>
						)}
					/>
				</SafeAreaView>
			</Modal>
		</View>
	)
}

function OptionPicker<T extends string>({
	label,
	options,
	selectedValue,
	onSelect,
	style,
}: {
	label: string
	options: { value: T; label: string }[]
	selectedValue: T
	onSelect: (value: T) => void
	style?: object
}) {
	return (
		<View style={style}>
			<Text
				style={{
					color: colors.foreground,
					fontSize: 14,
					fontWeight: '500',
					marginBottom: 6,
				}}
			>
				{label}
			</Text>
			<View
				style={{
					flexDirection: 'row',
					backgroundColor: colors.accent,
					borderRadius: 8,
					borderWidth: 1,
					borderColor: colors.border,
					overflow: 'hidden',
				}}
			>
				{options.map((opt) => (
					<Pressable
						key={opt.value}
						onPress={() => onSelect(opt.value)}
						style={{
							flex: 1,
							paddingVertical: 10,
							alignItems: 'center',
							backgroundColor:
								opt.value === selectedValue ? colors.primary : 'transparent',
						}}
					>
						<Text
							style={{
								fontSize: 14,
								fontWeight: opt.value === selectedValue ? '600' : '400',
								color:
									opt.value === selectedValue
										? colors.primaryForeground
										: colors.foreground,
							}}
						>
							{opt.label}
						</Text>
					</Pressable>
				))}
			</View>
		</View>
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
		<View>
			{result ? (
				<View
					style={{
						backgroundColor: colors.accent,
						borderRadius: 10,
						padding: 14,
						marginBottom: 10,
					}}
				>
					<Text
						style={{
							fontSize: 20,
							fontWeight: '700',
							color: colors.foreground,
						}}
					>
						{formatAmount(result.primaryAmount)} {result.primaryUnit}
					</Text>
					{result.secondaryAmount > 0.01 ? (
						<Text style={{ color: colors.mutedForeground, fontSize: 14, marginTop: 2 }}>
							({formatAmount(result.secondaryAmount)} {result.secondaryUnit})
						</Text>
					) : null}
					{result.tertiaryAmount &&
					result.tertiaryUnit &&
					result.tertiaryAmount > 0.01 ? (
						<Text style={{ color: colors.mutedForeground, fontSize: 14, marginTop: 2 }}>
							({formatAmount(result.tertiaryAmount)} {result.tertiaryUnit})
						</Text>
					) : null}
				</View>
			) : (
				<View
					style={{
						borderWidth: 1,
						borderColor: colors.border,
						borderStyle: 'dashed',
						borderRadius: 10,
						padding: 14,
						marginBottom: 10,
						alignItems: 'center',
					}}
				>
					<Text style={{ color: colors.mutedForeground, fontSize: 14 }}>
						Enter values above to calculate
					</Text>
				</View>
			)}
			<Badge variant={phBadgeVariant[product.phEffect]}>
				{phLabels[product.phEffect]}
			</Badge>
			{product.warning ? (
				<Text style={{ color: colors.neutralYellow, fontSize: 13, marginTop: 8 }}>
					{product.warning}
				</Text>
			) : null}
		</View>
	)
}
