import { useState } from 'react'
import { View, Text, ScrollView, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useCreateTank } from '../../hooks/useTanks'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useToast } from '../../components/ui/Toast'
import { colors } from '../../theme/colors'

export default function NewTankScreen() {
	const router = useRouter()
	const createTank = useCreateTank()
	const toast = useToast()
	const [name, setName] = useState('')
	const [volume, setVolume] = useState('')
	const [waterType, setWaterType] = useState<'saltwater' | 'freshwater'>('saltwater')

	const handleCreate = async () => {
		try {
			const result = await createTank.mutateAsync({
				name: name || 'My fish tank',
				waterType,
				volume: volume ? Number(volume) : undefined,
			})
			toast.success('Tank created')
			router.replace(`/tank/${result.tank.id}`)
		} catch (error: any) {
			toast.error(error?.data?.error || 'Failed to create tank')
		}
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
			<ScrollView contentContainerStyle={{ padding: 16 }}>
				<Text
					style={{
						color: colors.foreground,
						fontSize: 28,
						fontWeight: '700',
						fontFamily: 'Jost-Bold',
						marginBottom: 32,
					}}
				>
					Add New Tank
				</Text>

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

					<View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
						<Button variant="outline" onPress={() => router.back()} style={{ flex: 1 }}>
							Cancel
						</Button>
						<Button
							onPress={handleCreate}
							isLoading={createTank.isPending}
							style={{ flex: 1 }}
						>
							Create Tank
						</Button>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}
