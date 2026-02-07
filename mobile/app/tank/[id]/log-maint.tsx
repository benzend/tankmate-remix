import { useState } from 'react'
import { View, Text, ScrollView, Alert, Pressable } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useCreateMaintenanceLog } from '../../../hooks/useMaintenance'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { colors } from '../../../theme/colors'

const MAINTENANCE_TYPES = [
	{ key: 'water_change', label: 'Water Change', icon: 'water-outline' as const },
	{ key: 'filter_change', label: 'Filter Change', icon: 'funnel-outline' as const },
	{ key: 'sand_change', label: 'Sand Change', icon: 'layers-outline' as const },
	{ key: 'general', label: 'General', icon: 'build-outline' as const },
	{ key: 'custom', label: 'Other', icon: 'ellipsis-horizontal-outline' as const },
]

export default function LogMaintenanceScreen() {
	const { id } = useLocalSearchParams<{ id: string }>()
	const router = useRouter()
	const createLog = useCreateMaintenanceLog(id)
	const [selectedType, setSelectedType] = useState<string | null>(null)
	const [extraDetails, setExtraDetails] = useState('')

	const handleSubmit = async () => {
		if (!selectedType) {
			Alert.alert('Select Type', 'Please select a maintenance type.')
			return
		}

		try {
			await createLog.mutateAsync({
				maintenanceType: selectedType,
				extraDetails: extraDetails.trim() || undefined,
			})
			router.back()
		} catch (error: any) {
			Alert.alert('Error', error?.data?.error || 'Failed to log maintenance')
		}
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
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
					Log Maintenance
				</Text>
				<Button
					size="sm"
					onPress={handleSubmit}
					isLoading={createLog.isPending}
					disabled={!selectedType}
				>
					Save
				</Button>
			</View>

			<ScrollView
				contentContainerStyle={{ padding: 16 }}
				keyboardShouldPersistTaps="handled"
			>
				{/* Type selector */}
				<Text style={{ color: colors.foreground, fontSize: 14, fontWeight: '500', marginBottom: 12 }}>
					Maintenance Type
				</Text>
				<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
					{MAINTENANCE_TYPES.map((type) => {
						const isSelected = selectedType === type.key
						return (
							<Pressable
								key={type.key}
								onPress={() => setSelectedType(type.key)}
								style={{
									width: '47%',
									paddingVertical: 20,
									paddingHorizontal: 12,
									borderRadius: 12,
									borderWidth: 2,
									borderColor: isSelected ? colors.primary : colors.border,
									backgroundColor: isSelected ? colors.accent : 'transparent',
									alignItems: 'center',
									gap: 8,
								}}
							>
								<Ionicons
									name={type.icon}
									size={28}
									color={isSelected ? colors.foreground : colors.mutedForeground}
								/>
								<Text
									style={{
										color: isSelected ? colors.foreground : colors.mutedForeground,
										fontSize: 14,
										fontWeight: isSelected ? '600' : '400',
									}}
								>
									{type.label}
								</Text>
							</Pressable>
						)
					})}
				</View>

				{/* Details */}
				<Input
					label="Details (optional)"
					value={extraDetails}
					onChangeText={setExtraDetails}
					placeholder="25% water change, cleaned skimmer..."
					multiline
					numberOfLines={4}
					style={{ minHeight: 100, textAlignVertical: 'top' }}
				/>
			</ScrollView>
		</SafeAreaView>
	)
}
