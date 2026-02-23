import React, { useEffect, useState } from 'react'
import SingleFloatingButton from '@/components/buttons/single-floating-button'
import OrganizationsList from '@/components/group-list'
import CustomSafeAreaView from '@/components/layouts/safe-area-view'
import ListFilteringOptionsModal from '@/components/bottom-sheets/list-filtering-options-modal'
import { useNavigationSearch } from '@/hooks/use-navigation-search'
import { useActorsHeader } from '@/hooks/use-actor-header'
import { useLocationName } from '@/hooks/use-location-name'
import { useOrganizationList } from '@/hooks/use-organization-list'
import { useSearchOptions, useUserDetails } from '@/hooks/queries'
import { OrganizationTypes } from '@/types'
import { useActionStore } from '@/store/actions/actions'

const CONFIG = {
	organizationType: OrganizationTypes.COOP_UNION,
	searchPlaceholder: 'Procurar Uniões das Cooperativas',
	subtitle: 'Uniões',
	registrationRoute: '/(tabs)/actors/registration/coop-union' as const,
}

export default function CoopUnionsScreen() {
	const { userDetails } = useUserDetails()
	const { resetCurrentResource } = useActionStore()
	const locationName = useLocationName()
	const { search } = useNavigationSearch({
		searchBarOptions: { placeholder: CONFIG.searchPlaceholder },
	})
	const [adminPostFilter, setAdminPostFilter] = useState<string>('')
	const { searchKeys, loadSearchKeys } = useSearchOptions(userDetails?.district_id || '')

	const { bottomSheetModalRef, handleModalPress } = useActorsHeader({
		locationName,
		subtitle: CONFIG.subtitle,
		onResetResource: resetCurrentResource,
		showOptionsButton: true,
	})

	const { items } = useOrganizationList(
		CONFIG.organizationType,
		search,
		adminPostFilter || undefined,
		userDetails?.district_id ?? undefined,
	)

	const handleFilterSelect = (value: string) => {
		handleModalPress()
		setAdminPostFilter(value === 'All' ? '' : value)
		if (value === 'All') {
			// Clear search when selecting "All" - optional, matches farmers behavior
		}
	}

	useEffect(() => {
		loadSearchKeys()
	}, [loadSearchKeys])

	return (
		<CustomSafeAreaView edges={['bottom']} style={{ paddingTop: 0 }}>
			<OrganizationsList items={items} organizationType={CONFIG.organizationType} />
			<ListFilteringOptionsModal
				bottomSheetModalRef={bottomSheetModalRef}
				handleDismissModalPress={handleModalPress}
				searchKeys={searchKeys}
				selectedValue={adminPostFilter || 'All'}
				onSelect={handleFilterSelect}
			/>
			<SingleFloatingButton route={CONFIG.registrationRoute} />
		</CustomSafeAreaView>
	)
}
