import React, { useEffect, useState, useCallback } from 'react'
import { Text, View, TouchableOpacity, ScrollView } from 'react-native'
import { Href, useRouter } from 'expo-router'
import { Fontisto } from '@expo/vector-icons'
import { useFarmerRegistrationStore } from '@/store/farmer-registration'
import { useFarmerStore } from '@/store/farmer'
import { useAddressStore } from '@/store/address'
import { useUserDetails } from '@/hooks/queries'
import { colors } from '@/constants/colors'
import ErrorAlert from '@/components/alerts/error-alert'
import SuccessAlert from '@/components/alerts/success-alert'

import SubmitButton from '@/components/buttons/submit-button'
import PersonInfoSegmentModal from './segments/PersonInfoSegmentModal'
import CategoriesSegmentModal from './segments/CategoriesSegmentModal'
import BirthDateSegmentModal from './segments/BirthDateSegmentModal'
import BirthPlaceSegmentModal from './segments/BirthPlaceSegmentModal'
import AddressSegmentModal from './segments/AddressSegmentModal'
import ContactSegmentModal from './segments/ContactSegmentModal'
import DocumentationSegmentModal from './segments/DocumentationSegmentModal'
import { insertFarmer } from '@/library/powersync/sql-statements'

export type SegmentId =
	| 'person'
	// | 'categories'
	| 'birthDate'
	| 'birthPlace'
	| 'address'
	| 'contact'
	| 'documentation'

const SEGMENTS: { id: SegmentId; title: string }[] = [
	{ id: 'person', title: 'Informação Pessoal' },
	// { id: 'categories', title: 'Categorias' },
	{ id: 'birthDate', title: 'Data de Nascimento' },
	{ id: 'birthPlace', title: 'Naturalidade' },
	{ id: 'address', title: 'Endereço' },
	{ id: 'contact', title: 'Contacto' },
	{ id: 'documentation', title: 'Documentação' },
]

function useSegmentCompletion() {
	const {
		person,
		// categories,
		birthDate,
		birthPlace,
		address,
		contact,
		documentation,
	} = useFarmerRegistrationStore()

	const isPersonComplete = Boolean(
		person?.surname &&
			person.surname.trim().length >= 2 &&
			person.otherNames &&
			person.otherNames.trim().length >= 2 &&
			person.gender &&
			person.familySize
	)

	// const isCategoriesComplete = Boolean(
	// 	categories?.isServiceProvider && categories?.isSmallScale
	// )

	const isBirthDateComplete = Boolean(
		birthDate?.birthDate && !isNaN(new Date(birthDate.birthDate).getTime())
	)

	const isBirthPlaceComplete = (() => {
		if (!birthPlace) return false
		if (birthPlace.nationality === 'NATIONAL') {
			const fa = birthPlace.fullAddress ?? {
				provinceId: null,
				districtId: null,
				adminPostId: null,
				villageId: null,
			}
			return Boolean(fa.provinceId && fa.districtId && fa.adminPostId && fa.villageId)
		}
		if (birthPlace.nationality === 'FOREIGN') {
			return Boolean(birthPlace.countryId && birthPlace.countryId.trim() !== '')
		}
		return false
	})()

	const isAddressComplete = Boolean(
		address?.adminPostId &&
			address.adminPostId.trim() !== '' &&
			address.villageId &&
			address.villageId.trim() !== ''
	)

	const isContactComplete = Boolean(
		(contact?.primaryPhone && contact.primaryPhone.trim() !== '') ||
			(contact?.secondaryPhone && contact.secondaryPhone.trim() !== '')
	)

	const isDocumentationComplete = Boolean(
		documentation?.docType &&
			documentation.docType.trim().length >= 2 &&
			(documentation.docType === 'Não tem' || (documentation.docNumber && documentation.docNumber.trim() !== ''))
	)

	return {
		person: isPersonComplete,
		// categories: isCategoriesComplete,
		birthDate: isBirthDateComplete,
		birthPlace: isBirthPlaceComplete,
		address: isAddressComplete,
		contact: isContactComplete,
		documentation: isDocumentationComplete,
	}
}

export default function FarmerSegmentedDataForm() {
	const router = useRouter()
	const { userDetails } = useUserDetails()
	const { resetAll, syncToFarmerAndAddressStores } = useFarmerRegistrationStore()
	const { setFormData, resetFormData } = useFarmerStore()
	const {
		setPartialAdminPostId,
		setPartialVillageId,
		setPartialDistrictId,
		setFullProvinceId,
		setFullDistrictId,
		setFullAdminPostId,
		setFullVillageId,
		setCountryId,
		setNationality,
		reset: resetAddress,
	} = useAddressStore()
	const [activeSegment, setActiveSegment] = useState<SegmentId | null>(null)
	const [isSaving, setIsSaving] = useState(false)
	const [hasError, setHasError] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [success, setSuccess] = useState(false)
	const completion = useSegmentCompletion()

	// Submit button visible when all required segments complete; contact is optional
	const allComplete =
		completion.person &&
		// completion.categories &&
		completion.birthDate &&
		completion.birthPlace &&
		completion.address &&
		completion.documentation

	useEffect(() => {
		resetAll()
		resetAddress()
	}, [resetAll, resetAddress])

	const handleSegmentPress = (id: SegmentId) => {
		setActiveSegment(id)
	}

	const handleSegmentClose = () => {
		setActiveSegment(null)
	}

	const handleSubmit = useCallback(async () => {
		if (!userDetails?.district_id || !userDetails?.province_id) {
			setErrorMessage('Por favor, verifique os dados do usuário')
			setHasError(true)
			return
		}

		setIsSaving(true)
		setHasError(false)
		setErrorMessage('')

		syncToFarmerAndAddressStores(setFormData, {
			setPartialAdminPostId,
			setPartialVillageId,
			setPartialDistrictId,
			setFullProvinceId,
			setFullDistrictId,
			setFullAdminPostId,
			setFullVillageId,
			setCountryId,
			setNationality,
		})

		const farmer = useFarmerStore.getState().formData
		const partialAddress = useAddressStore.getState().partialAddress ?? {}

		const result = await insertFarmer({
			farmer,
			userDistrictId: userDetails.district_id,
			userProvinceId: userDetails.province_id,
			partialAddress,
		})

		setIsSaving(false)

		if (result.success) {
			resetFormData()
			resetAddress()
			resetAll()
			setSuccess(true)
			setTimeout(() => {
				router.replace('/(tabs)/actors/farmers' as Href)
			}, 400)
		} else {
			setErrorMessage(result.message)
			setHasError(true)
		}
	}, [
		userDetails,
		syncToFarmerAndAddressStores,
		setFormData,
		setPartialAdminPostId,
		setPartialVillageId,
		setPartialDistrictId,
		setFullProvinceId,
		setFullDistrictId,
		setFullAdminPostId,
		setFullVillageId,
		setCountryId,
		setNationality,
		resetFormData,
		resetAddress,
		resetAll,
		router,
	])

	return (
		<View className="flex-1">
			<ScrollView
				contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: 200 }}
				showsVerticalScrollIndicator={false}
			>
				<Text className="text-xs italic text-gray-600 dark:text-gray-400 mb-6">
					Toque em cada segmento para adicionar ou alterar os dados. Quando todos os dados obrigatórios forem
					preenchidos, o botão para guardar permanentemente aparecerá abaixo.
				</Text>

				{SEGMENTS.map((segment) => {
					const isComplete = completion[segment.id]
					return (
						<TouchableOpacity
							key={segment.id}
							onPress={() => handleSegmentPress(segment.id)}
							activeOpacity={0.7}
							className="flex-row items-center justify-between py-4 px-4 mb-2 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
						>
							<Text
								className={`text-base font-medium flex-1 ${
									isComplete ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-white'
								}`}
							>
								{segment.title}
							</Text>
							<View className="w-10 h-10 rounded-full items-center justify-center bg-white dark:bg-gray-700">
								{isComplete ? (
									<Fontisto name="check" size={20} color={colors.primary} />
								) : (
									<Fontisto name="plus-a" size={18} color={colors.primary} />
								)}
							</View>
						</TouchableOpacity>
					)
				})}
			</ScrollView>
			{allComplete && (
				<View className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-black">
					<SubmitButton
						onPress={handleSubmit}
						title="Guardar no Banco de Dados"
						isSubmitting={isSaving}
						disabled={isSaving}
					/>
				</View>
			)}

			<ErrorAlert
				visible={hasError}
				title="Erro ao gravar dados"
				message={errorMessage}
				setMessage={setErrorMessage}
				setVisible={setHasError}
			/>
			<SuccessAlert visible={success} setVisible={setSuccess} route={'/(tabs)/actors/farmers' as Href} />

			<PersonInfoSegmentModal
				visible={activeSegment === 'person'}
				onClose={handleSegmentClose}
			/>
			{/* <CategoriesSegmentModal
				visible={activeSegment === 'categories'}
				onClose={handleSegmentClose}
			/> */}
			<BirthDateSegmentModal
				visible={activeSegment === 'birthDate'}
				onClose={handleSegmentClose}
			/>
			<BirthPlaceSegmentModal
				visible={activeSegment === 'birthPlace'}
				onClose={handleSegmentClose}
			/>
			<AddressSegmentModal
				visible={activeSegment === 'address'}
				onClose={handleSegmentClose}
			/>
			<ContactSegmentModal
				visible={activeSegment === 'contact'}
				onClose={handleSegmentClose}
			/>
			<DocumentationSegmentModal
				visible={activeSegment === 'documentation'}
				onClose={handleSegmentClose}
			/>
		</View>
	)
}
