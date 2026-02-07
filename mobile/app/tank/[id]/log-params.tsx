import { useState } from 'react'
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useCreateParameterLog } from '../../../hooks/useParameters'
import { useTank } from '../../../hooks/useTanks'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { colors } from '../../../theme/colors'

const PARAMETERS = [
	{ key: 'pH', label: 'pH', placeholder: '8.2', step: '0.1', unit: '' },
	{ key: 'alk', label: 'Alkalinity', placeholder: '9.0', step: '0.1', unit: 'dKH' },
	{ key: 'calcium', label: 'Calcium', placeholder: '450', step: '1', unit: 'ppm' },
	{ key: 'magnesium', label: 'Magnesium', placeholder: '1350', step: '1', unit: 'ppm' },
	{ key: 'nitrate', label: 'Nitrate', placeholder: '5.0', step: '0.1', unit: 'ppm' },
	{ key: 'phosphate', label: 'Phosphate', placeholder: '0.03', step: '0.01', unit: 'ppm' },
	{ key: 'temp', label: 'Temperature', placeholder: '78', step: '0.1', unit: '°F' },
	{ key: 'salinity', label: 'Salinity', placeholder: '1.025', step: '0.001', unit: 'sg' },
] as const

type ParamKey = (typeof PARAMETERS)[number]['key']

export default function LogParametersScreen() {
	const { id } = useLocalSearchParams<{ id: string }>()
	const router = useRouter()
	const { data: tank } = useTank(id)
	const createLog = useCreateParameterLog(id)
	const [values, setValues] = useState<Record<string, string>>({})

	const setValue = (key: string, value: string) => {
		setValues((prev) => ({ ...prev, [key]: value }))
	}

	const handleSameAsLast = () => {
		if (!tank?.parameterLogs?.length) return
		const last = tank.parameterLogs[tank.parameterLogs.length - 1]
		const filled: Record<string, string> = {}
		for (const param of PARAMETERS) {
			const val = last[param.key as keyof typeof last]
			if (val != null) filled[param.key] = String(val)
		}
		setValues(filled)
	}

	const handleSubmit = async () => {
		const hasAnyValue = Object.values(values).some((v) => v.trim() !== '')
		if (!hasAnyValue) {
			Alert.alert('No Data', 'Please enter at least one parameter value.')
			return
		}

		const data: Record<string, number | null> = {}
		for (const param of PARAMETERS) {
			const raw = values[param.key]?.trim()
			data[param.key] = raw ? Number(raw) : null
		}

		try {
			await createLog.mutateAsync(data)
			router.back()
		} catch (error: any) {
			Alert.alert('Error', error?.data?.error || 'Failed to log parameters')
		}
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			>
				{/* Header */}
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
					<Button variant="ghost" size="sm" onPress={() => router.back()}>
						<View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
							<Ionicons name="close" size={20} color={colors.foreground} />
							<Text style={{ color: colors.foreground, fontSize: 16 }}>Cancel</Text>
						</View>
					</Button>
					<Text style={{ color: colors.foreground, fontSize: 17, fontWeight: '600' }}>
						Log Parameters
					</Text>
					<Button
						size="sm"
						onPress={handleSubmit}
						isLoading={createLog.isPending}
					>
						Save
					</Button>
				</View>

				<ScrollView
					contentContainerStyle={{ padding: 16 }}
					keyboardShouldPersistTaps="handled"
				>
					{/* Same as last button */}
					{tank?.parameterLogs?.length ? (
						<Button
							variant="outline"
							size="sm"
							onPress={handleSameAsLast}
							style={{ alignSelf: 'flex-start', marginBottom: 20 }}
						>
							<View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
								<Ionicons name="copy-outline" size={16} color={colors.foreground} />
								<Text style={{ color: colors.foreground, fontSize: 14 }}>Same as last</Text>
							</View>
						</Button>
					) : null}

					{/* Parameter grid — 2 columns */}
					<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
						{PARAMETERS.map((param) => (
							<View key={param.key} style={{ width: '47%' }}>
								<Input
									label={`${param.label}${param.unit ? ` (${param.unit})` : ''}`}
									value={values[param.key] || ''}
									onChangeText={(v) => setValue(param.key, v)}
									placeholder={param.placeholder}
									keyboardType="decimal-pad"
									returnKeyType="next"
								/>
							</View>
						))}
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}
