import { useNavigation } from 'expo-router'
import { useEffect } from 'react'
import BackButton from '@/components/buttons/back-button'
import AddCoopUnionForm from '@/features/groups/add-coop-union'
import { useHeaderOptions } from '@/hooks/use-navigation-search'

export default function CoopUnionRegistrationScreen() {
	const navigation = useNavigation()

	useHeaderOptions({}, 'Registo de União de Cooperativas')
	useEffect(() => {
		navigation.setOptions({
			headerLeft: () => <BackButton />,
		})
	}, [])

	return (
		<AddCoopUnionForm />
	)
}
