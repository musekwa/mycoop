import { Ionicons } from '@expo/vector-icons'
import { Pressable, Text } from 'react-native'

interface TagProps {
	onPress: () => void
	title: string
	selected: boolean
	iconName: keyof typeof Ionicons.glyphMap
}

export default function Tag({ onPress, title, selected, iconName }: TagProps) {
	return (
		<Pressable
			onPress={onPress}
			className={(`flex flex-row items-center justify-center px-1 py-1 rounded-lg overflow-x-hidden border min-w-25 space-x-2 ${selected ? 'border-[#008000] ': 'border-gray-300'}`)}
		>
			{iconName && <Ionicons name={iconName} size={18} color={`${selected ? '#008000' : 'black'}`} />}
			<Text className={`text-sm font-[12px] ${selected ? 'text-[#008000]' : 'text-black'}`}>{title}</Text>
		</Pressable>
	)
}
