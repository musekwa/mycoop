import { useNavigation } from 'expo-router'
import { useEffect } from 'react'
import BackButton from '@/components/buttons/back-button'
import { useHeaderOptions } from '@/hooks/use-navigation-search'
import AddAssociationForm from '@/features/groups/add-association'

export default function AssociationRegistrationScreen() {
	const navigation = useNavigation()

	useHeaderOptions()
	useEffect(() => {
		navigation.setOptions({
			headerLeft: () => <BackButton />,
			headerTitle: 'Registo de Associaçãogg',
		})
	}, [])


	 return <AddAssociationForm />
	
}
