import { RelativePathString, useNavigation } from 'expo-router'
import { useEffect, useState } from 'react'
import BackButton from '@/components/buttons/back-button'
import GroupDataPreview from '@/features/groups/group-data-preview'
import ErrorAlert from '@/components/alerts/error-alert'
import SuccessAlert from '@/components/alerts/success-alert'
import CustomSafeAreaView from '@/components/layouts/safe-area-view'

import AddAssociationForm from '@/features/groups/add-association'
import { useHeaderOptions } from '@/hooks/use-navigation-search'
import { useActionStore } from '@/store/actions/actions'
import {
	AssociationFormDataType,
	useAssociationStore,
} from '@/store/organizations'

import { ActionType, OrganizationTypes } from '@/types'



export default function AssociationRegistrationScreen() {
	const navigation = useNavigation()
	const [activeOrg, setActiveOrg] = useState<OrganizationTypes>(OrganizationTypes.ASSOCIATION)
	const { getAddActionType, resetAddActionType } = useActionStore()

	useHeaderOptions()
	useEffect(() => {
		navigation.setOptions({
			headerLeft: () => <BackButton />,
			headerTitle: 'Registo de Associaçãogg',
		})

		// if (getAddActionType() !== ActionType.UNKNOWN) {
		// 	setActiveOrg(OrganizationTypes.ASSOCIATION)
		// 	resetAddActionType()
		// }
	}, [])


	 return <AddAssociationForm />
	// const addOrganizationForm = () => (
	// 			/>
	// 		)
		
	// const org = useAssociationStore().getFormData() as AssociationFormDataType

	// return (
	// 	<CustomSafeAreaView edges={['bottom']}>

	// 		{addOrganizationForm()}

	// 		<GroupDataPreview
	// 			hasError={hasError}
	// 			errorMessage={errorMessage}
	// 			previewData={previewData}
	// 			setPreviewData={setPreviewData}
	// 			org={org}
	// 			setErrorMessage={setErrorMessage}
	// 			setHasError={setHasError}
	// 			setSuccess={setSuccess}
	// 			setRouteSegment={setRouteSegment}
	// 			organizationType={activeOrg}
	// 		/>
	// 		<ErrorAlert
	// 			visible={hasError}
	// 			setVisible={setHasError}
	// 			title="Erro"
	// 			message={errorMessage}
	// 			setMessage={setErrorMessage}
	// 		/>
	// 		<SuccessAlert visible={success} setVisible={setSuccess} route={routeSegment as RelativePathString | undefined} />
	// 	</CustomSafeAreaView>
	// )
}
