import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState, useCallback, useRef } from 'react'
import {
	View,
	Text,
	TextInput,
	FlatList,
	Pressable,
	ActivityIndicator,
	Keyboard,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FadeIn } from '../components/ui/Animated'
import { useSearch } from '../hooks/useSearch'
import { type SearchResult } from '../lib/api'
import { colors } from '../theme/colors'

export default function SearchScreen() {
	const router = useRouter()
	const inputRef = useRef<TextInput>(null)
	const [query, setQuery] = useState('')
	const { data, isLoading } = useSearch(query)
	const results = data?.results ?? []

	const handleResultPress = useCallback(
		(result: SearchResult) => {
			Keyboard.dismiss()
			if (result.url) {
				// If the result has a URL path, try to navigate to it
				// URLs might be like /tanks/123 or /coral-analyses/456
				const path = result.url.startsWith('/') ? result.url : `/${result.url}`
				router.push(path as any)
			}
		},
		[router],
	)

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
			{/* Search header */}
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
				<View
					style={{
						flex: 1,
						flexDirection: 'row',
						alignItems: 'center',
						backgroundColor: colors.accent,
						borderRadius: 10,
						paddingHorizontal: 12,
						height: 44,
					}}
				>
					<Ionicons name="search" size={18} color={colors.mutedForeground} />
					<TextInput
						ref={inputRef}
						value={query}
						onChangeText={setQuery}
						placeholder="Ask about reef keeping..."
						placeholderTextColor={colors.mutedForeground}
						autoFocus
						returnKeyType="search"
						style={{
							flex: 1,
							marginLeft: 8,
							fontSize: 16,
							color: colors.foreground,
						}}
					/>
					{query.length > 0 ? (
						<Pressable onPress={() => setQuery('')}>
							<Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
						</Pressable>
					) : null}
				</View>
			</View>

			{/* Content */}
			{query.length < 2 ? (
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
					<Ionicons name="search-outline" size={48} color={colors.border} />
					<Text style={{ color: colors.mutedForeground, fontSize: 16, textAlign: 'center', marginTop: 16 }}>
						Search for anything about aquarium care, water chemistry, coral health, and more
					</Text>
					<Text style={{ color: colors.mutedForeground, fontSize: 13, textAlign: 'center', marginTop: 8 }}>
						Powered by AI
					</Text>
				</View>
			) : isLoading ? (
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					<ActivityIndicator size="large" color={colors.primary} />
					<Text style={{ color: colors.mutedForeground, fontSize: 15, marginTop: 12 }}>
						Searching...
					</Text>
				</View>
			) : results.length === 0 ? (
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
					<Text style={{ color: colors.mutedForeground, fontSize: 16, textAlign: 'center' }}>
						No results found for "{query}"
					</Text>
				</View>
			) : (
				<FlatList
					data={results}
					keyExtractor={(_, i) => String(i)}
					contentContainerStyle={{ padding: 16 }}
					keyboardShouldPersistTaps="handled"
					renderItem={({ item, index }) => (
						<FadeIn delay={index * 40}>
							<Pressable
								onPress={() => handleResultPress(item)}
								style={({ pressed }) => ({
									backgroundColor: pressed ? colors.accent : 'transparent',
									borderRadius: 12,
									padding: 16,
									marginBottom: 8,
									borderWidth: 1,
									borderColor: colors.border,
								})}
							>
								<Text
									style={{
										color: colors.foreground,
										fontSize: 16,
										fontWeight: '600',
										marginBottom: 6,
									}}
									numberOfLines={2}
								>
									{item.title}
								</Text>
								{item.content ? (
									<Text
										style={{
											color: colors.mutedForeground,
											fontSize: 14,
											lineHeight: 20,
										}}
										numberOfLines={4}
									>
										{item.content}
									</Text>
								) : null}
							</Pressable>
						</FadeIn>
					)}
				/>
			)}
		</SafeAreaView>
	)
}
