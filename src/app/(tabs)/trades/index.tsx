// React and React Native imports
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Text, View, useColorScheme } from 'react-native'


// Navigation
import { useNavigation, useRouter } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'

// Third party libraries
import { Ionicons } from '@expo/vector-icons'
import BottomSheet from '@gorhom/bottom-sheet'

// Components
import CustomPopUpMenu from '@/components/custom-popup-menu'
import PdfDisplayer from '@/components/pdf-displayer'
import DistrictOverview from '@/components/district-overview'

// Hooks and Store
import { useActionStore } from '@/store/actions/actions'
import { useHeaderOptions } from '@/hooks/use-navigation-search'

// Constants and Types
import { colors } from '@/constants/colors'
import { useUserDetails } from '@/hooks/queries'

// Helpers
import { commercializationCampainsdateRange } from '@/helpers/dates'
import { getAdminPostsByDistrictId } from '@/library/sqlite/selects'
import RouteProtection from '@/features/auth/route-protection'
import { ActorDetailRecord, WarehouseDetailRecord } from '@/library/powersync/app-schemas'

interface Address {
	province: string
	district: string
	admin_post: string
	village: string
}

export default function TradesScreen() {
	const { setPdfUri, pdfUri } = useActionStore()
	const { userDetails } = useUserDetails()
	const navigation = useNavigation()
	const isDark = useColorScheme() === 'dark'
	const [reportHint, setReportHint] = useState('')
	const [warehousesByType, setWarehousesByType] = useState<{
		buyingPoints: (WarehouseDetailRecord & Address)[]
		aggregationPoints: (WarehouseDetailRecord & Address)[]
		destinationPoints: (WarehouseDetailRecord & Address)[]
	} | null>(null)
	const [orgsByType, setOrgsByType] = useState<{
		associations: (ActorDetailRecord & Address)[]
		cooperatives: (ActorDetailRecord & Address)[]
		coop_unions: (ActorDetailRecord & Address)[]
	} | null>(null)
	const [tradersByType, setTradersByType] = useState<{
		primaries: (ActorDetailRecord & Address)[]
		secondaries: (ActorDetailRecord & Address)[]
		finals: (ActorDetailRecord & Address)[]
	} | null>(null)

	const [foundAdminPosts, setFoundAdminPosts] = useState<
		{
			name: string
			id: string
		}[]
	>([])
	const [, setRefresh] = useState({})

	// Scrollable BottomSheet Modal
	const sheetRef = useRef<BottomSheet>(null)

	// Handle BottomSheet Snap Press
	const handleSnapPress = useCallback((index: number) => {
		sheetRef.current?.snapToIndex(index)
	}, [])

	// Handle BottomSheet Close Press
	const handleClosePress = useCallback(() => {
		sheetRef.current?.close()
		setReportHint('')
	}, [])

	useFocusEffect(
		useCallback(() => {
			setRefresh({})
		}, []),
	)

	useHeaderOptions()
	useEffect(() => {
		navigation.setOptions({
			headerTitle: () => <HeaderTitle title="Comercialização" />,
			headerRight: () => <HeaderRight />,
		})

		// Get admin posts by district id
		if (userDetails?.district_id) {
			getAdminPostsByDistrictId(userDetails?.district_id).then((adminPosts) => {
				if (adminPosts) {
					setFoundAdminPosts(adminPosts)
				} else {
					setFoundAdminPosts([{ name: 'N/A', id: 'N/A' }])
				}
			})
		}
	}, [userDetails, navigation])

	if (pdfUri) {
		return <PdfDisplayer />
	}

	return (
		<RouteProtection>
			<View style={{ flex: 1 }}>
				<View className="flex-1 bg-white dark:bg-black">
					<DistrictOverview
						tradersByType={tradersByType}
						setTradersByType={setTradersByType}
						setOrgsByType={setOrgsByType}
						warehousesByType={warehousesByType}
						setWarehousesByType={setWarehousesByType}
						handleSnapPress={handleSnapPress}
						reportHint={reportHint}
						setReportHint={setReportHint}
					/>
				</View>
			</View>
		</RouteProtection>
	)
}

const HeaderTitle = ({ title }: { title: string }) => {
	return (
		<View className="items-center ">
			<Text className="text-black dark:text-white text-[14px] font-bold " ellipsizeMode="tail" numberOfLines={1}>
				{title}
			</Text>
			<Text className="text-gray-600 dark:text-gray-400 font-mono text-[12px]">
				{commercializationCampainsdateRange}
			</Text>
		</View>
	)
}

const HeaderRight = () => {
	const router = useRouter()
	const isDark = useColorScheme() === 'dark'
	return (
    <CustomPopUpMenu
      options={[
        {
          label: "Cooperativas",
          icon: (
            <Ionicons
              name="people-outline"
              size={18}
              color={isDark ? colors.white : colors.black}
            />
          ),
          action: () => router.push("/(tabs)/trades/organization-points"),
        },
        {
          label: "Associações",
          icon: (
            <Ionicons
              name="people-outline"
              size={18}
              color={isDark ? colors.white : colors.black}
            />
          ),
          action: () => router.push("/(tabs)/trades/organization-points"),
        },
        {
          label: "Uniões das Cooperativas",
          icon: (
            <Ionicons
              name="people-outline"
              size={18}
              color={isDark ? colors.white : colors.black}
            />
          ),
          action: () => router.push("/(tabs)/trades/organization-points"),
        },
      ]}
    />
  );
}
