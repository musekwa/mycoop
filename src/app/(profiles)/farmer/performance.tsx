import { Text } from 'react-native'
import React, { useEffect } from 'react'
import { PopMenuOption } from '@/types'
import NoContentPlaceholder from '@/components/no-content-placeholder'
import Animated, { SlideInDown } from 'react-native-reanimated'
import { Href, useNavigation, useRouter } from 'expo-router'
import CustomPopUpMenu from '@/components/custom-popup-menu'
import { FontAwesome } from '@expo/vector-icons'
import { useActionStore } from '@/store/actions/actions'

export default function FarmerProfileScreen() {
	const navigation = useNavigation()
	const router = useRouter()
	const { currentResource } = useActionStore()

	
	useEffect(() => {
		const menuOptions: PopMenuOption[] = [
			{
				label: 'Actualizar Dados',
				icon: <FontAwesome name="edit" size={18} />,
				action: () =>
					router.navigate(`/(actions)/edit?resourceName=${currentResource.name}&id=${currentResource.id}` as Href),
			},
		]
		navigation.setOptions({
			headerRight: () => <CustomPopUpMenu title="Menu" options={menuOptions} />,
		})
	}, [ currentResource, navigation, router])

	return (
		<Animated.ScrollView
			entering={SlideInDown.duration(500)}
			className="flex-1 bg-white dark:bg-black"
			contentContainerStyle={{
				flexGrow: 1,
				justifyContent: 'center',
				alignItems: 'center',
				paddingHorizontal: 16,
			}}
		>
			<NoContentPlaceholder message='Nenhum conteúdo' />
			<Text className="text-center text-sm text-gray-600 dark:text-gray-400 italic">
				Este é o ecrã de perfil do Produtor. O seu UI será desenvolvido assim que for definido o que pode ser associado
				a um Produtor.
			</Text>
		</Animated.ScrollView>
	)
}
