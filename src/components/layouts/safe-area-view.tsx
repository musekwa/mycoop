import { View, useColorScheme } from 'react-native'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'

type CustomSafeAreaViewProps = {
	children: React.ReactNode
	edges?: Edge[]
	mode?: 'padding' | 'margin'
	style?: React.ComponentProps<typeof View>['style']
}

// SafeAreaView with background color based on dark mode and custom edges and mode
export default function CustomSafeAreaView({ children, edges, mode, style }: CustomSafeAreaViewProps) {
	const isDark = useColorScheme() === 'dark'
	const backgroundColor = isDark ? 'black' : 'white'
	// Filter out 'top' from edges to prevent top padding
	const filteredEdges = edges?.filter((edge) => edge !== 'top') || edges

	return (
		<SafeAreaView
			edges={filteredEdges}
			mode={mode}
			style={[{ flex: 1, backgroundColor, paddingTop: -10 }, style]}
		>
			<View style={{ paddingTop: 0, paddingBottom: 0, flex: 1, width: '100%',minHeight: '100%' }}>{children}</View>
		</SafeAreaView>
	)
}
