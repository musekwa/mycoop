import BackButton from '@/components/buttons/back-button'
import CustomSafeAreaView from '@/components/layouts/safe-area-view'
import AddGroupManager from '@/features/groups/add-group-manager'
import { useHeaderOptions } from '@/hooks/use-navigation-search'
import { useNavigation } from 'expo-router'
import { useEffect } from 'react'

export default function AddGroupManagerScreen() {

	const navigation = useNavigation()

	useHeaderOptions()
	useEffect(() => {
		navigation.setOptions({
			headerLeft: () => <BackButton />,
			headerTitle: 'Adicionar Representante',
		})
	}, [navigation])
	return (
		<CustomSafeAreaView edges={['bottom']}>
			<AddGroupManager />
		</CustomSafeAreaView>
	)
}
