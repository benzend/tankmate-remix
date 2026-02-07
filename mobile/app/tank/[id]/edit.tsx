import { useState, useEffect } from 'react'
import { View, Text, ScrollView, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTank, useUpdateTank, useDeleteTank } from '../../../hooks/useTanks'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Skeleton } from '../../../components/ui/Skeleton'
import { colors } from '../../../theme/colors'

export default function EditTankScreen() {
	const { id } = useLocalSearchParams<{ id: string }>()
	const router = useRouter()
	const { data: tank, isLoading } = useTank(id)
	const updateTank = useUpdateTank(id)
	const deleteTank = useDeleteTank()

	const [name, setName] = useState('')
	const [volume, setVolume] = useState('')
	const [waterType, setWaterType] = useState<'saltwater' | 'freshwater'>('saltwater')

	useEffect(() => {
		if (tank) {
			setName(tank.name || '')
			setVolume(tank.volume ? String(tank.volume) : '')
			setWaterType((tank.waterType as 'saltwater' | 'freshwater') || 'saltwater')
		}
	}, [tank])

	const handleSave = async () => {
		try {
			await updateTank.mutateAsync({
				name: name || undefined,
				waterType,
				volume: volume ? Number(volume) : undefined,
			})
			router.back()
		} catch (error: any) {
			Alert.alert('Error', error?.data?.error || 'Failed to update tank')
		}
	}

	const handleDelete = () => {
		Alert.alert(
			'Delete Tank',
			`Are you sure you want to delete "${tank?.name}"? This cannot be undone.`,
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					style: 'destructive',
					onPress: async () => {
						try {
							await deleteTank.mutateAsync(id)
							router.replace('/(tabs)')
						} catch (error: any) {
							Alert.alert('Error', error?.data?.error || 'Failed to delete tank')
						}
					},
				},
			],
		)
	}

	if (isLoading) {
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
				<View style={{ padding: 16, gap: 16 }}>
					<Skeleton width={200} height={32} />
					<Skeleton width="100%" height={48} borderRadius={8} />
					<Skeleton width="100%" height={48} borderRadius={8} />
				</View>
			</SafeAreaView>
		)
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
					Edit Tank
				</Text>
				<Button
					size="sm"
					onPress={handleSave}
					isLoading={updateTank.isPending}
				>
					Save
				</Button>
			</View>

			<ScrollView contentContainerStyle={{ padding: 16 }}>
				<View style={{ gap: 20 }}>
					<Input
						label="Tank Name"
						value={name}
						onChangeText={setName}
						placeholder="Living Room Tank"
					/>

					<Input
						label="Volume (Gallons)"
						value={volume}
						onChangeText={setVolume}
						placeholder="20"
						keyboardType="numeric"
					/>

					{/* Water type toggle */}
					<View>
						<Text style={{ color: colors.foreground, fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
							Water Type
						</Text>
						<View style={{ flexDirection: 'row', gap: 12 }}>
							{(['saltwater', 'freshwater'] as const).map((type) => (
								<Button
									key={type}
									variant={waterType === type ? 'default' : 'outline'}
									onPress={() => setWaterType(type)}
									style={{ flex: 1 }}
								>
									{type === 'saltwater' ? 'Saltwater' : 'Freshwater'}
								</Button>
							))}
						</View>
					</View>

					{/* Delete button */}
					<View style={{ marginTop: 32 }}>
						<Button
							variant="destructive"
							onPress={handleDelete}
							isLoading={deleteTank.isPending}
						>
							<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
								<Ionicons name="trash-outline" size={18} color="#ffffff" />
								<Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>Delete Tank</Text>
							</View>
						</Button>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}
