import { Text, Pressable, FlatList } from 'react-native'
import NoContentPlaceholder from '@/components/no-content-placeholder'

interface SectionListProps {
	data: { id: string; title: string; photo?: string; phone_number?: string; number_of_members?: number }[]
	callback?: (id: string, title: string) => void
	renderItem?: (item: { id: string; title: string; photo?: string; phone_number?: string; number_of_members?: number }) => React.ReactNode
	bottomPadding?: number
}

export default function SectionList({ data, callback, renderItem, bottomPadding = 0 }: SectionListProps) {
	return (
		<FlatList
			keyExtractor={(item: { id: string; title: string }) => item.id.toString()}
			contentContainerStyle={{
				paddingHorizontal: 15,
				paddingTop: 10,
				paddingBottom: bottomPadding,
			}}
			ListEmptyComponent={() => <NoContentPlaceholder message={'Nenhum conteúdo'} />}
			showsVerticalScrollIndicator={false}
			data={data}
			renderItem={({ item }: { item: { id: string; title: string } }) => {
				return (
					<Pressable
						onPress={() => {
							if (callback) {
								callback(item.id, item.title)
							}
						}}
						style={{ width: '100%' }}
					>
						{renderItem ? renderItem(item) : <Text>{item.title}</Text>}
					</Pressable>
				)
			}}
		/>
	)
}
