import React from 'react'
import FarmerRegistrationSegments from './registration/farmer-segmented-data-form'
import CustomSafeAreaView from '@/components/layouts/safe-area-view'

export default function AddFarmerForm() {
	return (
		<CustomSafeAreaView edges={['bottom']}>
			<FarmerRegistrationSegments />
		</CustomSafeAreaView>
	)
}
