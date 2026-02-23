import { RelativePathString, useNavigation } from 'expo-router'
import { useEffect, useState } from 'react'
import BackButton from '@/components/buttons/back-button'
import GroupDataPreview from '@/features/groups/group-data-preview'
import ErrorAlert from '@/components/alerts/error-alert'
import SuccessAlert from '@/components/alerts/success-alert'
import CustomSafeAreaView from '@/components/layouts/safe-area-view'

import AddCooperativeForm from '@/features/groups/add-cooperative'
import { useHeaderOptions } from '@/hooks/use-navigation-search'
import { useActionStore } from '@/store/actions/actions'
import {
	CoopFormDataType,
	useCoopStore,
} from '@/store/organizations'

import { ActionType, OrganizationTypes } from '@/types'



export default function CooperativeRegistrationScreen() {
	const navigation = useNavigation()
	const [activeOrg, setActiveOrg] = useState<OrganizationTypes>(OrganizationTypes.COOPERATIVE)
	const { getAddActionType, resetAddActionType } = useActionStore()

	const [success, setSuccess] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [hasError, setHasError] = useState(false)
	const [previewData, setPreviewData] = useState(false)
	const [routeSegment, setRouteSegment] = useState('')



	useHeaderOptions({}, 'Registo de Cooperativa')
	useEffect(() => {
		navigation.setOptions({
			headerLeft: () => <BackButton />,
		})

		if (getAddActionType() !== ActionType.UNKNOWN) {
			setActiveOrg(OrganizationTypes.COOPERATIVE)
			resetAddActionType()
		}
	}, [])

	const addOrganizationForm = () => (
		<AddCooperativeForm setErrorMessage={setErrorMessage} setPreviewData={setPreviewData} setHasError={setHasError} />
	)

	const org = useCoopStore().getFormData() as CoopFormDataType

	return (
		<CustomSafeAreaView edges={['bottom']}>
				{addOrganizationForm()}

			<GroupDataPreview
				hasError={hasError}
				errorMessage={errorMessage}
				previewData={previewData}
				setPreviewData={setPreviewData}
				org={org}
				setErrorMessage={setErrorMessage}
				setHasError={setHasError}
				setSuccess={setSuccess}
				setRouteSegment={setRouteSegment}
				organizationType={activeOrg}
			/>
			<ErrorAlert
				visible={hasError}
				setVisible={setHasError}
				title="Erro"
				message={errorMessage}
				setMessage={setErrorMessage}
			/>
			<SuccessAlert visible={success} setVisible={setSuccess} route={routeSegment as RelativePathString | undefined} />
		</CustomSafeAreaView>
	)
}
