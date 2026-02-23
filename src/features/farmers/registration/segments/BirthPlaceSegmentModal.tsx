import React, { useState, useEffect, useRef } from 'react'
import { View, Text } from 'react-native'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFarmerRegistrationStore } from '@/store/farmer-registration'
import { useAddressStore } from '@/store/address'
import { AddressLevel } from '@/types'
import SelectAddress from '@/components/form-items/pick-address'
import RadioButton from '@/components/buttons/radio-button'
import FormItemDescription from '@/components/form-items/form-item-description'

import SegmentModalLayout from './SegmentModalLayout'

const BirthPlaceSchema = z.object({
	provinceId: z.string().optional(),
	districtId: z.string().optional(),
	adminPostId: z.string().optional(),
	villageId: z.string().optional(),
	countryId: z.string().optional(),
})

type BirthPlaceFormData = z.infer<typeof BirthPlaceSchema>

type Props = {
	visible: boolean
	onClose: () => void
}

export default function BirthPlaceSegmentModal({ visible, onClose }: Props) {
	const { birthPlace: savedBirthPlace, setBirthPlace } = useFarmerRegistrationStore()
	const {
		setNationality,
		nationality,
		validateByAddressLevel,
		fullAddress,
		countryId,
		setFullProvinceId,
		setFullDistrictId,
		setFullAdminPostId,
		setFullVillageId,
		setCountryId,
		resetFullProvinceId,
		resetFullDistrictId,
		resetFullAdminPostId,
		resetFullVillageId,
	} = useAddressStore()
	const [birthAddressLevel, setBirthAddressLevel] = useState(AddressLevel.FROM_PROVINCES)
	const [addressError, setAddressError] = useState('')
	const hasHydratedRef = useRef(false)

	const {
		control,
		reset,
	} = useForm<BirthPlaceFormData>({
		defaultValues: {
			provinceId: '',
			districtId: '',
			adminPostId: '',
			villageId: '',
			countryId: '',
		},
		resolver: zodResolver(BirthPlaceSchema),
	})

	useEffect(() => {
		if (visible) {
			if (!hasHydratedRef.current) {
				hasHydratedRef.current = true
				if (savedBirthPlace) {
					setBirthAddressLevel(
						savedBirthPlace.nationality === 'NATIONAL' ? AddressLevel.FROM_PROVINCES : AddressLevel.FROM_COUNTRIES
					)
					setNationality(savedBirthPlace.nationality)
					if (savedBirthPlace.nationality === 'NATIONAL' && savedBirthPlace.fullAddress) {
						setFullProvinceId(savedBirthPlace.fullAddress.provinceId ?? undefined)
						setFullDistrictId(savedBirthPlace.fullAddress.districtId ?? undefined)
						setFullAdminPostId(savedBirthPlace.fullAddress.adminPostId ?? undefined)
						setFullVillageId(savedBirthPlace.fullAddress.villageId ?? undefined)
					}
					if (savedBirthPlace.nationality === 'FOREIGN' && savedBirthPlace.countryId) {
						setCountryId(savedBirthPlace.countryId)
					} else if (savedBirthPlace?.nationality === 'NATIONAL') {
						setCountryId(undefined)
					}
				} else {
					setCountryId(undefined)
				}
				const fa = savedBirthPlace?.fullAddress ?? fullAddress ?? {}
				reset({
					provinceId: fa.provinceId ?? '',
					districtId: fa.districtId ?? '',
					adminPostId: fa.adminPostId ?? '',
					villageId: fa.villageId ?? '',
					countryId: savedBirthPlace?.countryId ?? countryId ?? '',
				})
			}
		} else {
			hasHydratedRef.current = false
		}
	}, [
		visible,
		savedBirthPlace,
		fullAddress,
		countryId,
		reset,
		setNationality,
		setFullProvinceId,
		setFullDistrictId,
		setFullAdminPostId,
		setFullVillageId,
		setCountryId,
	])

	const onSave = () => {
		setAddressError('')
		const birthResult = validateByAddressLevel(birthAddressLevel)
		if (!birthResult.success) {
			setAddressError(birthResult.message)
			return
		}
		// Read latest from store at save time to avoid stale closure
		const storeState = useAddressStore.getState()
		const fa = storeState.fullAddress ?? {}
		setBirthPlace({
			nationality: storeState.nationality ?? nationality,
			fullAddress:
				(storeState.nationality ?? nationality) === 'NATIONAL'
					? {
							provinceId: fa.provinceId ?? null,
							districtId: fa.districtId ?? null,
							adminPostId: fa.adminPostId ?? null,
							villageId: fa.villageId ?? null,
						}
					: undefined,
			countryId: (storeState.nationality ?? nationality) === 'FOREIGN' ? (storeState.countryId ?? countryId ?? null) : undefined,
		})
		onClose()
	}

	return (
		<SegmentModalLayout visible={visible} title="Naturalidade" onClose={onClose} onSave={onSave}>
			<FormItemDescription description="Indica o local de nascimento do produtor" />

			<View className="mt-4">
				<Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Naturalidade</Text>
				<View className="flex-row space-x-4">
					<RadioButton
						label="Moçambicana"
						value="NATIONAL"
						checked={nationality === 'NATIONAL'}
						onChange={() => {
							setBirthAddressLevel(AddressLevel.FROM_PROVINCES)
							setNationality('NATIONAL')
							setCountryId(undefined)
						}}
					/>
					<RadioButton
						label="Estrangeira"
						value="FOREIGN"
						checked={nationality === 'FOREIGN'}
						onChange={() => {
							setBirthAddressLevel(AddressLevel.FROM_COUNTRIES)
							setNationality('FOREIGN')
							resetFullProvinceId()
							resetFullDistrictId()
							resetFullAdminPostId()
							resetFullVillageId()
						}}
					/>
				</View>
			</View>

			<View className="mt-4">
				<SelectAddress
					control={control}
					errors={{}}
					customErrors={{}}
					clearFieldError={() => setAddressError('')}
					addressLevel={birthAddressLevel}
					description="Indica o local de nascimento"
				/>
				{addressError ? (
					<Text className="text-xs text-red-500 mt-1">{addressError}</Text>
				) : null}
			</View>
		</SegmentModalLayout>
	)
}
