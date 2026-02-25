import { useNavigation } from "expo-router";
import { useEffect } from "react";

import BackButton from "@/components/buttons/back-button";
import AddFarmerForm from "@/features/farmers/add-farmer";
import { useHeaderOptions } from "@/hooks/use-navigation-search";

export default function ActorRegistrationScreen() {
	const navigation = useNavigation()

	useHeaderOptions()
	useEffect(() => {
		navigation.setOptions({
			headerLeft: () => <BackButton />,
			headerTitle: `Registo de Produtor`,
		})
	}, [])

	return <AddFarmerForm />
}
