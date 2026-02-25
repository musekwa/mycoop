import { useEffect, useState } from 'react'
import { getDistrictById } from '@/library/sqlite/selects'
import { useUserDetails } from './queries'

export default function useUserDistrict() {
	const { userDetails } = useUserDetails()
	const [districtName, setDistrictName] = useState<string>('')

	useEffect(() => {
		const fetchDistrictName = async () => {
			if (!userDetails?.district_id) return
			const districtName = await getDistrictById(userDetails.district_id)
			if (districtName && districtName !== null) {
				setDistrictName(districtName)
			}
		}
		fetchDistrictName()
	}, [userDetails?.district_id])
	return { districtName }
}
