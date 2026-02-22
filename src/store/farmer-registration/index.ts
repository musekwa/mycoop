import { create } from 'zustand'

export type PersonSegmentData = {
	surname: string
	otherNames: string
	gender?: 'Masculino' | 'Feminino'
	familySize?: number | string
}

export type CategoriesSegmentData = {
	isServiceProvider?: 'YES' | 'NO'
	isSmallScale?: 'YES' | 'NO'
}

export type BirthDateSegmentData = {
	birthDate: Date
}

export type BirthPlaceSegmentData = {
	nationality: 'NATIONAL' | 'FOREIGN'
	fullAddress?: {
		provinceId: string | null
		districtId: string | null
		adminPostId: string | null
		villageId: string | null
	}
	countryId?: string | null
}

export type AddressSegmentData = {
	adminPostId: string
	villageId: string
	districtId?: string
}

export type ContactSegmentData = {
	primaryPhone?: string
	secondaryPhone?: string
}

export type DocumentationSegmentData = {
	docType: string
	docNumber?: string
	nuit?: string
}

export type FarmerRegistrationStore = {
	person: PersonSegmentData | null
	categories: CategoriesSegmentData | null
	birthDate: BirthDateSegmentData | null
	birthPlace: BirthPlaceSegmentData | null
	address: AddressSegmentData | null
	contact: ContactSegmentData | null
	documentation: DocumentationSegmentData | null

	setPerson: (data: PersonSegmentData) => void
	setCategories: (data: CategoriesSegmentData) => void
	setBirthDate: (data: BirthDateSegmentData) => void
	setBirthPlace: (data: BirthPlaceSegmentData) => void
	setAddress: (data: AddressSegmentData) => void
	setContact: (data: ContactSegmentData) => void
	setDocumentation: (data: DocumentationSegmentData) => void

	resetAll: () => void

	/**
	 * Syncs segment data into farmer store and address store for save-farmer.
	 * Call before navigating to save-farmer.
	 */
	syncToFarmerAndAddressStores: (
		setFarmerFormData: (data: any) => void,
		addressActions: {
			setPartialAdminPostId: (id?: string) => void
			setPartialVillageId: (id?: string) => void
			setPartialDistrictId: (id?: string) => void
			setFullProvinceId: (id?: string) => void
			setFullDistrictId: (id?: string) => void
			setFullAdminPostId: (id?: string) => void
			setFullVillageId: (id?: string) => void
			setCountryId: (id?: string) => void
			setNationality: (nationality: 'NATIONAL' | 'FOREIGN') => void
		}
	) => void
}

const initialPerson: PersonSegmentData | null = null
const initialCategories: CategoriesSegmentData | null = null
const initialBirthDate: BirthDateSegmentData | null = null
const initialBirthPlace: BirthPlaceSegmentData | null = null
const initialAddress: AddressSegmentData | null = null
const initialContact: ContactSegmentData | null = null
const initialDocumentation: DocumentationSegmentData | null = null

export const useFarmerRegistrationStore = create<FarmerRegistrationStore>((set, get) => ({
	person: initialPerson,
	categories: initialCategories,
	birthDate: initialBirthDate,
	birthPlace: initialBirthPlace,
	address: initialAddress,
	contact: initialContact,
	documentation: initialDocumentation,

	setPerson: (data) => set({ person: data }),
	setCategories: (data) => set({ categories: data }),
	setBirthDate: (data) => set({ birthDate: data }),
	setBirthPlace: (data) => set({ birthPlace: data }),
	setAddress: (data) => set({ address: data }),
	setContact: (data) => set({ contact: data }),
	setDocumentation: (data) => set({ documentation: data }),

	resetAll: () =>
		set({
			person: initialPerson,
			categories: initialCategories,
			birthDate: initialBirthDate,
			birthPlace: initialBirthPlace,
			address: initialAddress,
			contact: initialContact,
			documentation: initialDocumentation,
		}),

	syncToFarmerAndAddressStores: (setFarmerFormData, addressActions) => {
		const state = get()
		const person = state.person
		const categories = state.categories
		const birthDateSeg = state.birthDate
		const birthPlace = state.birthPlace
		const address = state.address
		const contact = state.contact
		const documentation = state.documentation

		if (!person || !documentation) return

		const birthDate = birthDateSeg?.birthDate ?? new Date()

		setFarmerFormData({
			surname: person.surname,
			otherNames: person.otherNames,
			gender: person.gender,
			familySize: person.familySize,
			isServiceProvider: categories?.isServiceProvider,
			isSmallScale: categories?.isSmallScale,
			birthDate,
			primaryPhone: contact?.primaryPhone,
			secondaryPhone: contact?.secondaryPhone,
			docType: documentation.docType,
			docNumber: documentation.docNumber,
			nuit: documentation.nuit,
		})

		if (address) {
			addressActions.setPartialAdminPostId(address.adminPostId)
			addressActions.setPartialVillageId(address.villageId)
			if (address.districtId) {
				addressActions.setPartialDistrictId(address.districtId)
			}
		}

		if (birthPlace) {
			addressActions.setNationality(birthPlace.nationality)
			if (birthPlace.nationality === 'NATIONAL' && birthPlace.fullAddress) {
				addressActions.setFullProvinceId(birthPlace.fullAddress.provinceId ?? undefined)
				addressActions.setFullDistrictId(birthPlace.fullAddress.districtId ?? undefined)
				addressActions.setFullAdminPostId(birthPlace.fullAddress.adminPostId ?? undefined)
				addressActions.setFullVillageId(birthPlace.fullAddress.villageId ?? undefined)
			}
			if (birthPlace.nationality === 'FOREIGN' && birthPlace.countryId) {
				addressActions.setCountryId(birthPlace.countryId)
			}
		}
	},
}))
