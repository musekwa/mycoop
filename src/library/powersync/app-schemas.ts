import { Schema } from '@powersync/react-native'
// import documents from './documents'
import actorCategories from './schemas/actor-categories'
import actorDetails from './schemas/actor-details'
import actorDocuments from './schemas/actor-document'
import actors from './schemas/actors'
import addressDetails from './schemas/address-details'
import adminPosts from './schemas/admin-posts'
import birthDates from './schemas/birth-dates'
import birthPlaces from './schemas/birth-places'
import borders from './schemas/borders'
import cashewCrossbordersSmuggling from './schemas/cashew-crossborder-smugglings'
import cashewInbordersSmuggling from './schemas/cashew-inborder-smugglings'
import cashewShipments from './schemas/cashew-shipments'
import cashewWarehouseTransactions from './schemas/cashew-warehouse-transactions'
import checkpoints from './schemas/checkpoints'
import contactDetails from './schemas/contact-details'
import countries from './schemas/countries'
import districts from './schemas/districts'
import facilities from './schemas/facilities'
import genders from './schemas/genders'
import groupManagerAssignments from './schemas/group-manager-assignments'
import groupMembers from './schemas/group-members'
import licenses from './schemas/licenses'
import nuels from './schemas/nuels'
import nuits from './schemas/nuits'
import organizationTransactionParticipants from './schemas/organization-transaction-participants'
import organizationTransactions from './schemas/organization-transactions'
import provinces from './schemas/provinces'
import shipmentCars from './schemas/shipment-cars'
import shipmentCheckpointInspectors from './schemas/shipment-checkpoint-inspectors'
import shipmentCheckpointSequences from './schemas/shipment-checkpoint-sequences'
import shipmentChecks from './schemas/shipment-checks'
import shipmentDirections from './schemas/shipment-directions'
import shipmentDrivers from './schemas/shipment-drivers'
import shipmentLoads from './schemas/shipment-loads'
import userDetails from './schemas/user-details'
import villages from './schemas/villages'
import warehouseDetails from './schemas/warehouse-details'
import workerAssignments from './schemas/worker-assignments'

export const AppSchema = new Schema({
	// documents,
	userDetails,
	groupMembers,
	cashewWarehouseTransactions,
	organizationTransactions,
	organizationTransactionParticipants,
	countries,
	provinces,
	districts,
	adminPosts,
	villages,
	nuits,
	nuels,
	licenses,
	cashewShipments,
	shipmentLoads,
	shipmentCars,
	shipmentDrivers,
	shipmentDirections,
	shipmentChecks,
	shipmentCheckpointInspectors,
	shipmentCheckpointSequences,
	cashewInbordersSmuggling,
	cashewCrossbordersSmuggling,
	borders,
	actors,
	actorDocuments,
	birthPlaces,
	birthDates,
	contactDetails,
	addressDetails,
	facilities,
	warehouseDetails,
	actorDetails,
	actorCategories,
	genders,
	workerAssignments,
	groupManagerAssignments,
	checkpoints,
})

export const TABLES = {
	DOCUMENTS: 'documents',
	USER_DETAILS: 'user_details',
	GROUP_MEMBERS: 'group_members',
	CASHEW_WAREHOUSE_TRANSACTIONS: 'cashew_warehouse_transactions',
	ORGANIZATION_TRANSACTIONS: 'organization_transactions',
	ORGANIZATION_TRANSACTION_PARTICIPANTS: 'organization_transaction_participants',
	COUNTRIES: 'countries',
	PROVINCES: 'provinces',
	DISTRICTS: 'districts',
	ADMIN_POSTS: 'admin_posts',
	VILLAGES: 'villages',
	NUITS: 'nuits',
	NUELS: 'nuels',
	LICENSES: 'licenses',
	CASHEW_SHIPMENTS: 'cashew_shipments',
	SHIPMENT_LOADS: 'shipment_loads',
	SHIPMENT_CARS: 'shipment_cars',
	SHIPMENT_DRIVERS: 'shipment_drivers',
	SHIPMENT_DIRECTIONS: 'shipment_directions',
	SHIPMENT_CHECKS: 'shipment_checks',
	SHIPMENT_CHECKPOINTS: 'shipment_checkpoints', // Still used for linking fields (next checkpoint IDs)
	SHIPMENT_CHECKPOINT_INSPECTORS: 'shipment_checkpoint_inspectors',
	SHIPMENT_CHECKPOINT_SEQUENCE: 'shipment_checkpoint_sequence',
	CASHEW_INBORDERS_SMUGGLING: 'cashew_inborders_smuggling',
	CASHEW_CROSSBORDERS_SMUGGLING: 'cashew_crossborders_smuggling',
	BORDERS: 'borders',
	ACTORS: 'actors',
	ACTOR_DOCUMENTS: 'actor_documents',
	BIRTH_PLACES: 'birth_places',
	BIRTH_DATES: 'birth_dates',
	CONTACT_DETAILS: 'contact_details',
	ADDRESS_DETAILS: 'address_details',
	FACILITIES: 'facilities',
	WAREHOUSE_DETAILS: 'warehouse_details',
	ACTOR_DETAILS: 'actor_details',
	ACTOR_CATEGORIES: 'actor_categories',
	GENDERS: 'genders',
	WORKER_ASSIGNMENTS: 'worker_assignments',
	GROUP_MANAGER_ASSIGNMENTS: 'group_manager_assignments',
	CHECKPOINTS: 'checkpoints',
}

export type Database = (typeof AppSchema)['types']
// export type DocumentRecord = Database['documents']
export type UserDetailsRecord = Database['userDetails']
export type GroupMemberRecord = Database['groupMembers']
export type CashewWarehouseTransactionRecord = Database['cashewWarehouseTransactions']
export type OrganizationTransactionRecord = Database['organizationTransactions']
export type OrganizationTransactionParticipantRecord = Database['organizationTransactionParticipants']
export type CountryRecord = Database['countries']
export type ProvinceRecord = Database['provinces']
export type DistrictRecord = Database['districts']
export type AdminPostRecord = Database['adminPosts']
export type VillageRecord = Database['villages']
export type NuitRecord = Database['nuits']
export type NuelRecord = Database['nuels']
export type LicenseRecord = Database['licenses']
export type CashewShipmentRecord = Database['cashewShipments']
export type ShipmentLoadRecord = Database['shipmentLoads']
export type ShipmentCarRecord = Database['shipmentCars']
export type ShipmentDriverRecord = Database['shipmentDrivers']
export type ShipmentDirectionRecord = Database['shipmentDirections']
export type ShipmentCheckRecord = Database['shipmentChecks']
export type ShipmentCheckpointRecord = Database['checkpoints'] // Changed from shipment_checkpoints to checkpoints
export type ShipmentCheckpointInspectorRecord = Database['shipmentCheckpointInspectors']
export type ShipmentCheckpointSequenceRecord = Database['shipmentCheckpointSequences']
export type CashewInbordersSmugglingRecord = Database['cashewInbordersSmuggling']
export type CashewCrossbordersSmugglingRecord = Database['cashewCrossbordersSmuggling']
export type BorderRecord = Database['borders']
export type ActorRecord = Database['actors']
export type ActorDocumentRecord = Database['actorDocuments']
export type BirthPlaceRecord = Database['birthPlaces']
export type BirthDateRecord = Database['birthDates']
export type ContactDetailRecord = Database['contactDetails']
export type AddressDetailRecord = Database['addressDetails']
export type FacilityRecord = Database['facilities']
export type WarehouseDetailRecord = Database['warehouseDetails']
export type WorkerAssignmentRecord = Database['workerAssignments']
export type ActorDetailRecord = Database['actorDetails']
export type ActorCategoryRecord = Database['actorCategories']
export type GenderRecord = Database['genders']
export type GroupManagerAssignmentRecord = Database['groupManagerAssignments']
export type CheckpointRecord = Database['checkpoints']
