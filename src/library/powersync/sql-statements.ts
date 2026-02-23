import {
	ActorCategoryRecord,
	ActorDetailRecord,
	ActorDocumentRecord,
	ActorRecord,
	AddressDetailRecord,
	AdminPostRecord,
	BirthDateRecord,
	ContactDetailRecord,
	CountryRecord,
	DistrictRecord,
	FacilityRecord,
	GenderRecord,
	GroupManagerAssignmentRecord,
	LicenseRecord,
	NuelRecord,
	NuitRecord,
	ProvinceRecord,
	TABLES,
	VillageRecord,
	WarehouseDetailRecord,
	WorkerAssignmentRecord,
} from '@/library/powersync/app-schemas'
import { buildWarehouseDetail } from '@/library/powersync/schemas/warehouse-details'
import { FarmerFormDataType } from '@/store/farmer'
import { MultiCategory, ResourceName } from '@/types'
import { buildActorCategories } from './schemas/actor-categories'
import { buildActorDetails } from './schemas/actor-details'
import { buildActorDocument } from './schemas/actor-document'
import { buildActor } from './schemas/actors'
import { buildAddressDetail } from './schemas/address-details'
import { buildBirthDate } from './schemas/birth-dates'
import { buildContactDetail } from './schemas/contact-details'
import { buildGenders } from './schemas/genders'
import { buildNuit } from './schemas/nuits'
import { powersync } from './system'

export const insertBirthDate = async (data: BirthDateRecord) => {
	const { id, owner_id, owner_type, day, month, year, sync_id } = data
	try {
		const result = await powersync.execute(
			`INSERT INTO ${TABLES.BIRTH_DATES} (id, owner_id, owner_type, day, month, year, sync_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
			[id, owner_id, owner_type, day, month, year, sync_id],
		)
		console.log('Birth date inserted', result)
		return result
	} catch (error) {
		console.error('Error inserting birth date', error)
		return null
	}
}

export const insertActorDocument = async (data: ActorDocumentRecord) => {
	const { id, type, number, date, place, owner_id, owner_type, sync_id } = data
	try {
		const result = await powersync.execute(
			`INSERT INTO ${TABLES.ACTOR_DOCUMENTS} (id, type, number, date, place, owner_id, owner_type, sync_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			[id, type, number, date, place, owner_id, owner_type, sync_id],
		)
		console.log('Actor document inserted', result)
		return result
	} catch (error) {
		console.error('Error inserting actor document', error)
		return null
	}
}

export const insertNuit = async (data: NuitRecord) => {
	const { id, nuit, actor_id, sync_id } = data
	try {
		const result = await powersync.execute(
			`INSERT INTO ${TABLES.NUITS} (
				id, nuit, actor_id, sync_id) VALUES (?, ?, ?, ?)`,
			[id, nuit, actor_id, sync_id],
		)
		console.log('Nuit inserted', result)
		return result
	} catch (error) {
		console.error('Error inserting nuit', error)
		return null
	}
}

export const insertAddressDetail = async (data: AddressDetailRecord) => {
	const { id, owner_id, owner_type, village_id, admin_post_id, district_id, province_id, gps_lat, gps_long, sync_id } =
		data
	try {
		const result = await powersync.execute(
			`INSERT INTO ${TABLES.ADDRESS_DETAILS} (
				id, 
				owner_id, 
				owner_type, 
				village_id, 
				admin_post_id, 
				district_id, 
				province_id, 
				gps_lat, 
				gps_long, 
				sync_id
			) 
				VALUES (
				?, 
				?, 
				?, 
				?, 
				?, 
				?, 
				?, 
				?, 
				?, 
				?
			)`,
			[id, owner_id, owner_type, village_id, admin_post_id, district_id, province_id, gps_lat, gps_long, sync_id],
		)
		console.log('Address detail inserted', result)
		return result
	} catch (error) {
		console.error('Error inserting address detail', error)
		return null
	}
}

export const insertContactDetail = async (data: ContactDetailRecord) => {
	const { id, owner_id, owner_type, primary_phone, secondary_phone, email, sync_id } = data
	try {
		const result = await powersync.execute(
			`INSERT INTO ${TABLES.CONTACT_DETAILS} (
				id,
				owner_id,
				owner_type,
				primary_phone,
				secondary_phone,
				email,
				sync_id
			) VALUES (
				?,
				?,
				?,
				?,
				?,
				?,
				?
			)`,
			[id, owner_id, owner_type, primary_phone, secondary_phone, email, sync_id],
		)
		console.log('Contact detail inserted', result)
		return result
	} catch (error) {
		console.error('Error inserting contact detail', error)
		return null
	}
}


export const insertFacility = async (data: FacilityRecord) => {
	const { id, name, type, owner_id, sync_id } = data
	try {
		const result = await powersync.execute(
			`INSERT INTO ${TABLES.FACILITIES} (id, name, type, owner_id, sync_id) VALUES (?, ?, ?, ?, ?)`,
			[id, name || '', type, owner_id, sync_id],
		)
		console.log('Facility inserted', result)
		return result
	} catch (error) {
		console.error('Error inserting facility', error)
		return null
	}
}

export const insertWarehouseDetail = async (data: WarehouseDetailRecord | ReturnType<typeof buildWarehouseDetail>) => {
	const { id, name, description, owner_id, type, sync_id, is_active, created_at, updated_at } = data
	try {
		const result = await powersync.execute(
			`INSERT INTO ${TABLES.WAREHOUSE_DETAILS} (
				id,
				name,
				description,
				owner_id,
				type,
				sync_id,
				is_active,
				created_at,
				updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				id,
				name,
				description,
				owner_id,
				type,
				sync_id,
				typeof is_active === 'boolean' ? String(is_active) : is_active,
				created_at,
				updated_at,
			],
		)
		console.log('Warehouse detail inserted', result)
		return result
	} catch (error) {
		console.error('Error inserting warehouse detail', error)
		return null
	}
}

export const insertActorDetails = async (data: ActorDetailRecord) => {
	const { id, actor_id, surname, other_names, uaid, photo, sync_id, created_at, updated_at } = data
	try {
		const result = await powersync.execute(
			`INSERT INTO ${TABLES.ACTOR_DETAILS} (id, actor_id, surname, other_names, uaid, photo, sync_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[id, actor_id, surname, other_names, uaid, photo, sync_id, created_at, updated_at],
		)
		console.log('Actor details inserted', result)
		return result
	} catch (error) {
		console.error('Error inserting actor details', error)
		return null
	}
}

export const insertGenders = async (data: GenderRecord) => {
	const { actor_id, name, code, sync_id, id } = data
	try {
		const result = await powersync.execute(
			`INSERT INTO ${TABLES.GENDERS} (id, actor_id, name, code, sync_id) VALUES (?, ?, ?, ?, ?)`,
			[id, actor_id, name, code, sync_id],
		)
		console.log('Gender inserted', result)
		return result
	} catch (error) {
		console.error('Error inserting gender', error)
		return null
	}
}

export const insertWorkerAssignment = async (data: WorkerAssignmentRecord) => {
	const { id, worker_id, facility_id, facility_type, position, is_active, sync_id, created_at, updated_at } = data
	try {
		const result = await powersync.execute(
			`INSERT INTO ${TABLES.WORKER_ASSIGNMENTS} (id, worker_id, facility_id, facility_type, position, is_active, sync_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[id, worker_id, facility_id, facility_type, position, is_active, sync_id, created_at, updated_at],
		)
		console.log('Worker assignment inserted', result)
		return result
	} catch (error) {
		console.error('Error inserting worker assignment', error)
		return null
	}
}


export const insertGroupManagerAssignment = async (data: GroupManagerAssignmentRecord) => {
	const { id, group_manager_id, group_id, position, is_active, sync_id } = data
	try {
		const result = await powersync.execute(
			`INSERT INTO ${TABLES.GROUP_MANAGER_ASSIGNMENTS} (id, group_manager_id, group_id, position, is_active, sync_id) VALUES (?, ?, ?, ?, ?, ?)`,
			[id, group_manager_id, group_id, position, is_active, sync_id],
		)
		console.log('Group manager assignment inserted', result)
		return result
	} catch (error) {
		console.error('Error inserting group manager assignment', error)
		return null
	}
}



export const getAdminPostsByDistrictId = async (
	districtId: string,
	callback: (result: AdminPostRecord[]) => void,
) => {
	if (!districtId || typeof districtId !== 'string' || districtId.trim() === '') {
		callback([])
		return
	}
	await powersync
		.getAll(`SELECT * FROM ${TABLES.ADMIN_POSTS} WHERE district_id = ? OR name = ?`, [districtId, 'N/A'])
		.then((result) => {
			callback(result as AdminPostRecord[])
		})
		.catch((error) => {
			console.error(`Error selecting admin posts by district id ${districtId}:`, error)
		})
}


export const getCountries = async (callback: (result: CountryRecord[]) => void) => {
	await powersync
		.getAll(`SELECT * FROM ${TABLES.COUNTRIES} ORDER BY name ASC`)
		.then((result) => {
			callback(result as CountryRecord[])
		})
		.catch((error) => {
			console.error(`Error selecting countries:`, error)
		})
}


export const getDistrictsByProvinceId = async (provinceId: string, callback: (result: DistrictRecord[]) => void) => {
	if (!provinceId || typeof provinceId !== 'string' || provinceId.trim() === '') {
		callback([])
		return
	}
	await powersync
		.getAll(`SELECT * FROM ${TABLES.DISTRICTS} WHERE province_id = ? OR name = ?`, [provinceId, 'N/A'])
		.then((result) => {
			callback(result as DistrictRecord[])
		})
		.catch((error) => {
			console.error(`Error selecting districts by province id ${provinceId}:`, error)
		})
}


export const getProvinces = async (callback: (result: ProvinceRecord[]) => void) => {
	await powersync
		.getAll(`SELECT * FROM ${TABLES.PROVINCES}`)
		.then((result) => {
			callback(result as ProvinceRecord[])
		})
		.catch((error) => {
			console.error(`Error selecting provinces:`, error)
		})
}


export const getVillagesByAdminPostId = async (adminPostId: string, callback: (result: VillageRecord[]) => void) => {
	if (!adminPostId || typeof adminPostId !== 'string' || adminPostId.trim() === '') {
		callback([])
		return
	}
	await powersync
		.getAll(`SELECT * FROM ${TABLES.VILLAGES} WHERE admin_post_id = ? OR name = ?`, [adminPostId, 'N/A'])
		.then((result) => {
			callback(result as VillageRecord[])
		})
		.catch((error) => {
			console.error(`Error selecting villages by admin post id ${adminPostId}:`, error)
		})
}



export const insertActor = async (data: ActorRecord) => {
	const { id, category, sync_id } = data
	const result = await powersync.execute(`INSERT INTO ${TABLES.ACTORS} (id, category, sync_id) VALUES (?, ?, ?)`, [
		id,
		category,
		sync_id,
	])
	console.log('Actor inserted', result)
	return result
}


export const insertLicense = async (data: LicenseRecord) => {
	const { id, photo, owner_type, owner_id, number, issue_date, expiration_date, issue_place_type, sync_id, issue_place_id } = data
	try {
	const result = await powersync.execute(
		`INSERT INTO ${TABLES.LICENSES} (
            id,
            photo,
            owner_type,
            owner_id,
            number,
            issue_date,
            expiration_date,
            issue_place_id,
            issue_place_type,
            sync_id
        ) VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
			?
        )`,
		[
			id,
			photo,
			owner_type,
			owner_id,
			number,
			issue_date,
			expiration_date,
			issue_place_id,
			issue_place_type,
			sync_id,
		],
	)
	console.log('License inserted', result)
	return result
	} catch (error) {
		console.error('Error inserting license', error)
		return null
	}
}


export const insertNuel = async (data: NuelRecord) => {
	const { id, nuel, actor_id, sync_id } = data
	const result = await powersync.execute(
		`INSERT INTO ${TABLES.NUELS} (id, nuel, actor_id, sync_id) VALUES (?, ?, ?, ?)`,
		[id, nuel, actor_id, sync_id],
	)
	console.log('Nuel inserted', result)
	return result
}


	
export const insertActorCategory = async (data: ActorCategoryRecord) => {
	const { id, actor_id, category, subcategory, sync_id } = data
	try {
		const result = await powersync.execute(
			`INSERT INTO ${TABLES.ACTOR_CATEGORIES} (id, actor_id, category, subcategory, sync_id) VALUES (?, ?, ?, ?, ?)`,
			[id, actor_id, category, subcategory, sync_id],
		)
		console.log('Actor category inserted', result)
		return result
	} catch (error) {
		console.error('Error inserting actor category', error)
		return null
	}
}


export type CreateFarmerParams = {
	farmer: FarmerFormDataType
	userDistrictId: string
	userProvinceId: string
	partialAddress: {
		adminPostId?: string | null
		villageId?: string | null
	}
}

export type CreateFarmerResult =
	| { success: true }
	| { success: false; message: string }

export async function insertFarmer(params: CreateFarmerParams): Promise<CreateFarmerResult> {
	const { farmer, userDistrictId, userProvinceId, partialAddress } = params

	if (!userDistrictId || !userProvinceId) {
		return { success: false, message: 'Por favor, verifique os dados do usuário' }
	}

	if (!farmer?.surname || !farmer?.otherNames || String(farmer.surname).trim() === '' || String(farmer.otherNames).trim() === '') {
		return { success: false, message: 'Dados do produtor incompletos' }
	}

	const safePartialAddr = partialAddress ?? {}

	if (!safePartialAddr.adminPostId || !safePartialAddr.villageId) {
		return { success: false, message: 'Por favor, verifique os dados do endereço' }
	}

	if (farmer.nuit && farmer.nuit.trim().length === 9 && farmer.nuit.trim() !== 'N/A') {
		try {
			const existingNuit = await powersync.get<{ actor_id: string }>(
				`SELECT actor_id FROM ${TABLES.NUITS} WHERE nuit = ? LIMIT 1`,
				[farmer.nuit.trim()],
			)
			if (existingNuit) {
				return {
					success: false,
					message: `NUIT ${farmer.nuit.trim()} já está registado para outro produtor. Não é possível criar este produtor.`,
				}
			}
		} catch (error: unknown) {
			const err = error as { message?: string }
			if (!err?.message?.includes('Result set is empty') && !String(error).includes('Result set is empty')) {
				console.error('Error checking duplicate NUIT:', error)
			}
		}
	}

	const isCompany = (farmer?.surname ?? '').toLowerCase().includes('company')
	const categories: MultiCategory[] = []

	if (farmer.isSmallScale === 'YES') {
		categories.push(MultiCategory.FARMER_SMALL_SCALE)
	} else if (farmer.isSmallScale === 'NO') {
		categories.push(MultiCategory.FARMER_LARGE_SCALE)
	}
	if (farmer.isServiceProvider === 'YES') {
		categories.push(MultiCategory.FARMER_SPRAYING_SERVICE_PROVIDER)
	}

	try {
		const actor_row = buildActor({
			category: ResourceName.FARMER,
			sync_id: userDistrictId,
		})
		await insertActor(actor_row)

		const actor_details_row = buildActorDetails({
			actor_id: actor_row.id,
			surname: farmer.surname,
			other_names: farmer.otherNames,
			photo: '',
			sync_id: userDistrictId,
		})
		await insertActorDetails(actor_details_row)

		if (!isCompany && farmer.gender) {
			const gender_row = buildGenders({
				actor_id: actor_row.id,
				name: farmer.gender,
				code: farmer.gender === 'Masculino' ? 'M' : 'F',
				sync_id: userDistrictId,
			})
			await insertGenders(gender_row)
		}

		if (categories.length > 0) {
			for (const category of categories) {
				const actor_category_row = buildActorCategories({
					actor_id: actor_row.id,
					category: ResourceName.FARMER,
					subcategory: category,
					sync_id: userDistrictId,
				})
				await insertActorCategory(actor_category_row)
			}
		}

		const contact_detail_row = buildContactDetail({
			owner_id: actor_row.id,
			owner_type: ResourceName.FARMER,
			primary_phone: farmer.primaryPhone || 'N/A',
			secondary_phone: farmer.secondaryPhone || 'N/A',
			email: 'N/A',
			sync_id: userDistrictId,
		})

		const address_detail_row = buildAddressDetail({
			owner_id: actor_row.id,
			owner_type: ResourceName.FARMER,
			village_id: safePartialAddr.villageId || '',
			admin_post_id: safePartialAddr.adminPostId || '',
			district_id: userDistrictId,
			province_id: userProvinceId,
			gps_lat: '0',
			gps_long: '0',
			sync_id: userDistrictId,
		})

		await Promise.all([insertContactDetail(contact_detail_row), insertAddressDetail(address_detail_row)])

		if (farmer.nuit && farmer.nuit !== 'N/A') {
			const nuit_row = buildNuit({
				nuit: farmer.nuit,
				actor_id: actor_row.id,
				sync_id: userDistrictId,
			})
			await insertNuit(nuit_row)
		}

		if (
			farmer.docNumber &&
			farmer.docNumber !== 'N/A' &&
			farmer.docType &&
			farmer.docType !== 'N/A' &&
			farmer.docType !== 'Não tem'
		) {
			const actor_document_row = buildActorDocument({
				type: farmer.docType,
				number: farmer.docNumber,
				date: new Date().toISOString(),
				place: 'N/A',
				owner_id: actor_row.id,
				owner_type: ResourceName.FARMER,
				sync_id: userDistrictId,
			})
			await insertActorDocument(actor_document_row)
		}

		if (!isCompany && farmer.birthDate && new Date(farmer.birthDate).getFullYear() + 12 < new Date().getFullYear()) {
			const birth_date_row = buildBirthDate({
				owner_id: actor_row.id,
				owner_type: ResourceName.FARMER,
				day: new Date(farmer.birthDate).getDate(),
				month: new Date(farmer.birthDate).getMonth() + 1,
				year: new Date(farmer.birthDate).getFullYear(),
				sync_id: userDistrictId,
			})
			await insertBirthDate(birth_date_row)
		}

		return { success: true }
	} catch (error: unknown) {
		const err = error as { message?: string; code?: string }
		console.error('Error creating farmer', error)
		if (err?.message?.includes('NUIT') || err?.message?.includes('duplicate') || err?.code === '23505') {
			return {
				success: false,
				message: `Erro: NUIT duplicado. ${err.message || 'Este NUIT já está registado para outro produtor.'}`,
			}
		}
		return { success: false, message: 'Erro ao criar produtor. Tente novamente.' }
	}
}
