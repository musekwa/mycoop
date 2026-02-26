import { isNineDigitString } from "@/helpers/validators";
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
  GroupMemberRecord,
  LicenseRecord,
  NuelRecord,
  NuitRecord,
  ProvinceRecord,
  TABLES,
  VillageRecord,
  WarehouseDetailRecord,
  WorkerAssignmentRecord,
} from "@/library/powersync/app-schemas";
import { buildWarehouseDetail } from "@/library/powersync/schemas/warehouse-details";
import { FarmerFormDataType } from "@/store/farmer";
import {
  CoopAffiliationStatus,
  OrganizationTypes,
  ResourceName,
} from "@/types";
import { buildActorCategories } from "./schemas/actor-categories";
import { buildActorDetails } from "./schemas/actor-details";
import { buildActorDocument } from "./schemas/actor-document";
import { buildActor } from "./schemas/actors";
import { buildAddressDetail } from "./schemas/address-details";
import { buildBirthDate } from "./schemas/birth-dates";
import { buildContactDetail } from "./schemas/contact-details";
import { buildGenders } from "./schemas/genders";
import { buildLicense } from "./schemas/licenses";
import { buildNuel } from "./schemas/nuels";
import { buildNuit } from "./schemas/nuits";
import { powersync } from "./system";

export const insertBirthDate = async (data: BirthDateRecord) => {
  const { id, owner_id, owner_type, day, month, year, sync_id } = data;
  try {
    const result = await powersync.execute(
      `INSERT INTO ${TABLES.BIRTH_DATES} (id, owner_id, owner_type, day, month, year, sync_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, owner_id, owner_type, day, month, year, sync_id],
    );
    console.log("Birth date inserted", result);
    return result;
  } catch (error) {
    console.error("Error inserting birth date", error);
    return null;
  }
};

export const insertActorDocument = async (data: ActorDocumentRecord) => {
  const { id, type, number, date, place, owner_id, owner_type, sync_id } = data;
  try {
    const result = await powersync.execute(
      `INSERT INTO ${TABLES.ACTOR_DOCUMENTS} (id, type, number, date, place, owner_id, owner_type, sync_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, type, number, date, place, owner_id, owner_type, sync_id],
    );
    console.log("Actor document inserted", result);
    return result;
  } catch (error) {
    console.error("Error inserting actor document", error);
    return null;
  }
};

export const insertNuit = async (data: NuitRecord) => {
  const { id, nuit, actor_id, sync_id } = data;
  try {
    const result = await powersync.execute(
      `INSERT INTO ${TABLES.NUITS} (
				id, nuit, actor_id, sync_id) VALUES (?, ?, ?, ?)`,
      [id, nuit, actor_id, sync_id],
    );
    console.log("Nuit inserted", result);
    return result;
  } catch (error) {
    console.error("Error inserting nuit", error);
    return null;
  }
};

export const insertAddressDetail = async (data: AddressDetailRecord) => {
  const {
    id,
    owner_id,
    owner_type,
    village_id,
    admin_post_id,
    district_id,
    province_id,
    gps_lat,
    gps_long,
    sync_id,
  } = data;
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
      [
        id,
        owner_id,
        owner_type,
        village_id,
        admin_post_id,
        district_id,
        province_id,
        gps_lat,
        gps_long,
        sync_id,
      ],
    );
    console.log("Address detail inserted", result);
    return result;
  } catch (error) {
    console.error("Error inserting address detail", error);
    return null;
  }
};

export const insertContactDetail = async (data: ContactDetailRecord) => {
  const {
    id,
    owner_id,
    owner_type,
    primary_phone,
    secondary_phone,
    email,
    sync_id,
  } = data;
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
      [
        id,
        owner_id,
        owner_type,
        primary_phone,
        secondary_phone,
        email,
        sync_id,
      ],
    );
    console.log("Contact detail inserted", result);
    return result;
  } catch (error) {
    console.error("Error inserting contact detail", error);
    return null;
  }
};

export const insertFacility = async (data: FacilityRecord) => {
  const { id, name, type, owner_id, sync_id } = data;
  try {
    const result = await powersync.execute(
      `INSERT INTO ${TABLES.FACILITIES} (id, name, type, owner_id, sync_id) VALUES (?, ?, ?, ?, ?)`,
      [id, name || "", type, owner_id, sync_id],
    );
    console.log("Facility inserted", result);
    return result;
  } catch (error) {
    console.error("Error inserting facility", error);
    return null;
  }
};

export const insertWarehouseDetail = async (
  data: WarehouseDetailRecord | ReturnType<typeof buildWarehouseDetail>,
) => {
  const {
    id,
    name,
    description,
    owner_id,
    type,
    sync_id,
    is_active,
    created_at,
    updated_at,
  } = data;
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
        typeof is_active === "boolean" ? String(is_active) : is_active,
        created_at,
        updated_at,
      ],
    );
    console.log("Warehouse detail inserted", result);
    return result;
  } catch (error) {
    console.error("Error inserting warehouse detail", error);
    return null;
  }
};

export const insertActorDetails = async (data: ActorDetailRecord) => {
  const {
    id,
    actor_id,
    surname,
    other_names,
    uaid,
    photo,
    sync_id,
    created_at,
    updated_at,
  } = data;
  try {
    const result = await powersync.execute(
      `INSERT INTO ${TABLES.ACTOR_DETAILS} (id, actor_id, surname, other_names, uaid, photo, sync_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        actor_id,
        surname,
        other_names,
        uaid,
        photo,
        sync_id,
        created_at,
        updated_at,
      ],
    );
    console.log("Actor details inserted", result);
    return result;
  } catch (error) {
    console.error("Error inserting actor details", error);
    return null;
  }
};

export const insertGenders = async (data: GenderRecord) => {
  const { actor_id, name, code, sync_id, id } = data;
  try {
    const result = await powersync.execute(
      `INSERT INTO ${TABLES.GENDERS} (id, actor_id, name, code, sync_id) VALUES (?, ?, ?, ?, ?)`,
      [id, actor_id, name, code, sync_id],
    );
    console.log("Gender inserted", result);
    return result;
  } catch (error) {
    console.error("Error inserting gender", error);
    return null;
  }
};

export const insertWorkerAssignment = async (data: WorkerAssignmentRecord) => {
  const {
    id,
    worker_id,
    facility_id,
    facility_type,
    position,
    is_active,
    sync_id,
    created_at,
    updated_at,
  } = data;
  try {
    const result = await powersync.execute(
      `INSERT INTO ${TABLES.WORKER_ASSIGNMENTS} (id, worker_id, facility_id, facility_type, position, is_active, sync_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        worker_id,
        facility_id,
        facility_type,
        position,
        is_active,
        sync_id,
        created_at,
        updated_at,
      ],
    );
    console.log("Worker assignment inserted", result);
    return result;
  } catch (error) {
    console.error("Error inserting worker assignment", error);
    return null;
  }
};

export const insertGroupManagerAssignment = async (
  data: GroupManagerAssignmentRecord,
) => {
  const { id, group_manager_id, group_id, position, is_active, sync_id } = data;
  try {
    const result = await powersync.execute(
      `INSERT INTO ${TABLES.GROUP_MANAGER_ASSIGNMENTS} (id, group_manager_id, group_id, position, is_active, sync_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, group_manager_id, group_id, position, is_active, sync_id],
    );
    console.log("Group manager assignment inserted", result);
    return result;
  } catch (error) {
    console.error("Error inserting group manager assignment", error);
    return null;
  }
};

export const getAdminPostsByDistrictId = async (
  districtId: string,
  callback: (result: AdminPostRecord[]) => void,
) => {
  if (
    !districtId ||
    typeof districtId !== "string" ||
    districtId.trim() === ""
  ) {
    callback([]);
    return;
  }
  await powersync
    .getAll(
      `SELECT * FROM ${TABLES.ADMIN_POSTS} WHERE district_id = ? OR name = ?`,
      [districtId, "N/A"],
    )
    .then((result) => {
      callback(result as AdminPostRecord[]);
    })
    .catch((error) => {
      console.error(
        `Error selecting admin posts by district id ${districtId}:`,
        error,
      );
    });
};

export const getCountries = async (
  callback: (result: CountryRecord[]) => void,
) => {
  await powersync
    .getAll(`SELECT * FROM ${TABLES.COUNTRIES} ORDER BY name ASC`)
    .then((result) => {
      callback(result as CountryRecord[]);
    })
    .catch((error) => {
      console.error(`Error selecting countries:`, error);
    });
};

export const getDistrictsByProvinceId = async (
  provinceId: string,
  callback: (result: DistrictRecord[]) => void,
) => {
  if (
    !provinceId ||
    typeof provinceId !== "string" ||
    provinceId.trim() === ""
  ) {
    callback([]);
    return;
  }
  await powersync
    .getAll(
      `SELECT * FROM ${TABLES.DISTRICTS} WHERE province_id = ? OR name = ?`,
      [provinceId, "N/A"],
    )
    .then((result) => {
      callback(result as DistrictRecord[]);
    })
    .catch((error) => {
      console.error(
        `Error selecting districts by province id ${provinceId}:`,
        error,
      );
    });
};

export const getProvinces = async (
  callback: (result: ProvinceRecord[]) => void,
) => {
  await powersync
    .getAll(`SELECT * FROM ${TABLES.PROVINCES}`)
    .then((result) => {
      callback(result as ProvinceRecord[]);
    })
    .catch((error) => {
      console.error(`Error selecting provinces:`, error);
    });
};

export const getVillagesByAdminPostId = async (
  adminPostId: string,
  callback: (result: VillageRecord[]) => void,
) => {
  if (
    !adminPostId ||
    typeof adminPostId !== "string" ||
    adminPostId.trim() === ""
  ) {
    callback([]);
    return;
  }
  await powersync
    .getAll(
      `SELECT * FROM ${TABLES.VILLAGES} WHERE admin_post_id = ? OR name = ?`,
      [adminPostId, "N/A"],
    )
    .then((result) => {
      callback(result as VillageRecord[]);
    })
    .catch((error) => {
      console.error(
        `Error selecting villages by admin post id ${adminPostId}:`,
        error,
      );
    });
};

export const insertActor = async (data: ActorRecord) => {
  const { id, category, sync_id } = data;
  const result = await powersync.execute(
    `INSERT INTO ${TABLES.ACTORS} (id, category, sync_id) VALUES (?, ?, ?)`,
    [id, category, sync_id],
  );
  console.log("Actor inserted", result);
  return result;
};

export const insertLicense = async (data: LicenseRecord) => {
  const {
    id,
    photo,
    owner_type,
    owner_id,
    number,
    issue_date,
    expiration_date,
    issue_place_type,
    sync_id,
    issue_place_id,
  } = data;
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
    );
    console.log("License inserted", result);
    return result;
  } catch (error) {
    console.error("Error inserting license", error);
    return null;
  }
};

export const insertNuel = async (data: NuelRecord) => {
  const { id, nuel, actor_id, sync_id } = data;
  const result = await powersync.execute(
    `INSERT INTO ${TABLES.NUELS} (id, nuel, actor_id, sync_id) VALUES (?, ?, ?, ?)`,
    [id, nuel, actor_id, sync_id],
  );
  console.log("Nuel inserted", result);
  return result;
};

export const insertActorCategory = async (data: ActorCategoryRecord) => {
  const { id, actor_id, category, subcategory, sync_id } = data;
  try {
    const result = await powersync.execute(
      `INSERT INTO ${TABLES.ACTOR_CATEGORIES} (id, actor_id, category, subcategory, sync_id) VALUES (?, ?, ?, ?, ?)`,
      [id, actor_id, category, subcategory, sync_id],
    );
    console.log("Actor category inserted", result);
    return result;
  } catch (error) {
    console.error("Error inserting actor category", error);
    return null;
  }
};

export type CreateFarmerParams = {
  farmer: FarmerFormDataType;
  userDistrictId: string;
  userProvinceId: string;
  partialAddress: {
    adminPostId?: string | null;
    villageId?: string | null;
  };
};

export type GroupDataType = {
  name: string;
  creationYear: string;
  affiliationYear?: string;
  affiliationStatus?: string;
  license?: string;
  nuel?: string;
  nuit?: string;
};

export type CreateGroupParams = {
  group: GroupDataType;
  groupType: OrganizationTypes;
  userDistrictId: string;
  userProvinceId: string;
  partialAddress: {
    adminPostId?: string;
    villageId?: string;
  };
};

export type CreateResult =
  | { success: true; message: string }
  | { success: false; message: string };

export async function insertGroup(
  params: CreateGroupParams,
): Promise<CreateResult> {
  const { group, groupType, userDistrictId, userProvinceId, partialAddress } =
    params;

  const newGroupType =
    groupType ===
    Object.values(OrganizationTypes).find(
      (type) => type === OrganizationTypes.ASSOCIATION,
    )
      ? "Associação"
      : groupType ===
          Object.values(OrganizationTypes).find(
            (type) => type === OrganizationTypes.COOPERATIVE,
          )
        ? "Cooperativa"
        : "União";

  if (!userDistrictId || !userProvinceId) {
    return {
      success: false,
      message: "Por favor, verifique os dados do usuário",
    };
  }

  if (!group?.name || String(group.name).trim() === "") {
    return {
      success: false,
      message: `Verifique o nome da ${newGroupType.toLowerCase()}`,
    };
  }

  if (
    groupType !== OrganizationTypes.COOP_UNION &&
    (!group?.affiliationStatus ||
      !Object.values(CoopAffiliationStatus).includes(
        group.affiliationStatus as CoopAffiliationStatus,
      ))
  ) {
    return {
      success: false,
      message: `Verifique o estado legal da ${newGroupType.toLowerCase()}`,
    };
  }

  if (!group?.creationYear || isNaN(Number(group.creationYear))) {
    return {
      success: false,
      message: `Verifique o ano de criação desta ${newGroupType.toLowerCase()}`,
    };
  }

  if (
    group.affiliationStatus === CoopAffiliationStatus.AFFILIATED &&
    (!group?.affiliationYear ||
      isNaN(Number(group.affiliationYear)) ||
      !isNineDigitString(group.nuel) ||
      !isNineDigitString(group.nuit) ||
      !group?.license ||
      group.license.trim() === "N/A" ||
      group.license.trim() === "")
  ) {
    return {
      success: false,
      message: `Verifique os dados da legalização desta ${newGroupType.toLowerCase()}`,
    };
  }

  const safePartialAddr = partialAddress ?? {};

  if (!safePartialAddr.adminPostId || !safePartialAddr.villageId) {
    return {
      success: false,
      message: "Verifique os dados do endereço",
    };
  }

  if (
    group.nuit &&
    group.nuit.trim().length === 9 &&
    group.nuit.trim() !== "N/A"
  ) {
    try {
      const existingNuit = await powersync.get<{ actor_id: string }>(
        `SELECT actor_id FROM ${TABLES.NUITS} WHERE nuit = ? LIMIT 1`,
        [group.nuit.trim()],
      );
      if (existingNuit) {
        return {
          success: false,
          message: `NUIT ${group.nuit.trim()} já está registado para outro actor. Não é possível criar esta ${newGroupType.toLowerCase()}.`,
        };
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      if (
        !err?.message?.includes("Result set is empty") &&
        !String(error).includes("Result set is empty")
      ) {
        console.error("Error checking duplicate NUIT:", error);
      }
    }
  }

  if (
    group.nuel &&
    group.nuel.trim().length === 9 &&
    group.nuel.trim() !== "N/A"
  ) {
    try {
      const existingNuel = await powersync.get<{ actor_id: string }>(
        `SELECT actor_id FROM ${TABLES.NUELS} WHERE nuel = ? LIMIT 1`,
        [group.nuel.trim()],
      );
      if (existingNuel) {
        return {
          success: false,
          message: `NUEL ${group.nuel.trim()} já está registado para outro actor. Não é possível criar esta ${newGroupType.toLowerCase()}.`,
        };
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      if (
        !err?.message?.includes("Result set is empty") &&
        !String(error).includes("Result set is empty")
      ) {
        console.error("Error checking duplicate NUIT:", error);
      }
    }
  }

  try {
    const actor_row = buildActor({
      category: ResourceName.GROUP,
      sync_id: userDistrictId,
    });

    await insertActor(actor_row);

    const actor_details_row = buildActorDetails({
      actor_id: actor_row.id,
      other_names: group.name,
      surname: "GROUP",
      photo: "",
      sync_id: userDistrictId,
    });

    await insertActorDetails(actor_details_row);

    const actor_category_row = buildActorCategories({
      actor_id: actor_row.id,
      category: "GROUP",
      subcategory: groupType,
      sync_id: userDistrictId,
    });
    await insertActorCategory(actor_category_row);

    const address_detail_row = buildAddressDetail({
      owner_id: actor_row.id,
      owner_type: "GROUP",
      village_id: safePartialAddr.villageId || "",
      admin_post_id: safePartialAddr.adminPostId || "",
      district_id: userDistrictId,
      province_id: userProvinceId,
      gps_lat: "0",
      gps_long: "0",
      sync_id: userDistrictId,
    });

    await insertAddressDetail(address_detail_row);

    if (group.nuel && group.nuel !== "N/A") {
      const nuel_row = buildNuel({
        nuel: group.nuel,
        actor_id: actor_row.id,
        sync_id: userDistrictId,
      });
      await insertNuel(nuel_row);
    }

    if (group.nuit && group.nuit !== "N/A") {
      const nuit_row = buildNuit({
        nuit: group.nuit,
        actor_id: actor_row.id,
        sync_id: userDistrictId,
      });
      await insertNuit(nuit_row);
    }

    // 3. build and insert birth date record
    const birth_date_row = buildBirthDate({
      month: 1,
      day: 1,
      year: Number(group.creationYear),
      owner_id: actor_row.id,
      owner_type: "GROUP",
      sync_id: userDistrictId,
    });
    await insertBirthDate(birth_date_row);

    // 8. build and insert license record
    if (group.license && group.license !== "N/A") {
      const license_row = buildLicense({
        number: `${group.license}-BUSINESS_LICENSE`,
        owner_id: actor_row.id,
        owner_type: "GROUP",
        photo: "",
        issue_date: new Date().toISOString(),
        expiration_date: new Date().toISOString(),
        issue_place_id: userDistrictId,
        issue_place_type: "DISTRICT",
        sync_id: userDistrictId,
      });
      await insertLicense(license_row);
    }

    return { success: true, message: `${newGroupType} criada com sucesso` };
  } catch (error) {
    const err = error as { message?: string; code?: string };
    console.error("Error creating group", error);
    if (
      err?.message?.includes("NUIT") ||
      err?.message?.includes("NUEL") ||
      err?.message?.includes("duplicate") ||
      err?.code === "23505"
    ) {
      return {
        success: false,
        message: `Erro: NUIT ou NUEL duplicado. ${err.message || "Este NUIT ou NUEL já está registado para outro produtor."}`,
      };
    }
    return {
      success: false,
      message: `Erro ao criar ${newGroupType.toLowerCase()}. Tente novamente.`,
    };
  }
}

export async function insertFarmer(
  params: CreateFarmerParams,
): Promise<CreateResult> {
  const { farmer, userDistrictId, userProvinceId, partialAddress } = params;

  if (!userDistrictId || !userProvinceId) {
    return {
      success: false,
      message: "Por favor, verifique os dados do usuário",
    };
  }

  if (
    !farmer?.surname ||
    !farmer?.otherNames ||
    String(farmer.surname).trim() === "" ||
    String(farmer.otherNames).trim() === ""
  ) {
    return { success: false, message: "Dados do produtor incompletos" };
  }

  const safePartialAddr = partialAddress ?? {};

  if (!safePartialAddr.adminPostId || !safePartialAddr.villageId) {
    return {
      success: false,
      message: "Por favor, verifique os dados do endereço",
    };
  }

  if (
    farmer.nuit &&
    farmer.nuit.trim().length === 9 &&
    farmer.nuit.trim() !== "N/A"
  ) {
    try {
      const existingNuit = await powersync.get<{ actor_id: string }>(
        `SELECT actor_id FROM ${TABLES.NUITS} WHERE nuit = ? LIMIT 1`,
        [farmer.nuit.trim()],
      );
      if (existingNuit) {
        return {
          success: false,
          message: `NUIT ${farmer.nuit.trim()} já está registado para outro produtor. Não é possível criar este produtor.`,
        };
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      if (
        !err?.message?.includes("Result set is empty") &&
        !String(error).includes("Result set is empty")
      ) {
        console.error("Error checking duplicate NUIT:", error);
      }
    }
  }

  try {
    const actor_row = buildActor({
      category: ResourceName.FARMER,
      sync_id: userDistrictId,
    });
    await insertActor(actor_row);

    const actor_details_row = buildActorDetails({
      actor_id: actor_row.id,
      surname: farmer.surname,
      other_names: farmer.otherNames,
      photo: "",
      sync_id: userDistrictId,
    });
    await insertActorDetails(actor_details_row);

    if (farmer && farmer.gender) {
      const gender_row = buildGenders({
        actor_id: actor_row.id,
        name: farmer.gender,
        code: farmer.gender === "Masculino" ? "M" : "F",
        sync_id: userDistrictId,
      });
      await insertGenders(gender_row);
    }

    const contact_detail_row = buildContactDetail({
      owner_id: actor_row.id,
      owner_type: ResourceName.FARMER,
      primary_phone: farmer.primaryPhone || "N/A",
      secondary_phone: farmer.secondaryPhone || "N/A",
      email: "N/A",
      sync_id: userDistrictId,
    });

    const address_detail_row = buildAddressDetail({
      owner_id: actor_row.id,
      owner_type: ResourceName.FARMER,
      village_id: safePartialAddr.villageId || "",
      admin_post_id: safePartialAddr.adminPostId || "",
      district_id: userDistrictId,
      province_id: userProvinceId,
      gps_lat: "0",
      gps_long: "0",
      sync_id: userDistrictId,
    });

    await Promise.all([
      insertContactDetail(contact_detail_row),
      insertAddressDetail(address_detail_row),
    ]);

    if (farmer.nuit && farmer.nuit !== "N/A") {
      const nuit_row = buildNuit({
        nuit: farmer.nuit,
        actor_id: actor_row.id,
        sync_id: userDistrictId,
      });
      await insertNuit(nuit_row);
    }

    if (
      farmer.docNumber &&
      farmer.docNumber !== "N/A" &&
      farmer.docType &&
      farmer.docType !== "N/A" &&
      farmer.docType !== "Não tem"
    ) {
      const actor_document_row = buildActorDocument({
        type: farmer.docType,
        number: farmer.docNumber,
        date: new Date().toISOString(),
        place: "N/A",
        owner_id: actor_row.id,
        owner_type: ResourceName.FARMER,
        sync_id: userDistrictId,
      });
      await insertActorDocument(actor_document_row);
    }

    if (
      farmer &&
      farmer.birthDate &&
      new Date(farmer.birthDate).getFullYear() + 12 < new Date().getFullYear()
    ) {
      const birth_date_row = buildBirthDate({
        owner_id: actor_row.id,
        owner_type: ResourceName.FARMER,
        day: new Date(farmer.birthDate).getDate(),
        month: new Date(farmer.birthDate).getMonth() + 1,
        year: new Date(farmer.birthDate).getFullYear(),
        sync_id: userDistrictId,
      });
      await insertBirthDate(birth_date_row);
    }

    return { success: true, message: "Produtor criado com sucesso" };
  } catch (error: unknown) {
    const err = error as { message?: string; code?: string };
    console.error("Error creating farmer", error);
    if (
      err?.message?.includes("NUIT") ||
      err?.message?.includes("duplicate") ||
      err?.code === "23505"
    ) {
      return {
        success: false,
        message: `Erro: NUIT duplicado. ${err.message || "Este NUIT já está registado para outro produtor."}`,
      };
    }
    return {
      success: false,
      message: "Erro ao criar produtor. Tente novamente.",
    };
  }
}

export const updateOne = async <T>(query: string, params: string[]) => {
  await powersync
    .execute(query, params)
    .then((result) => {
      console.log(`Result of updateOne ${query}:`, result);
      // return result as T
    })
    .catch((error) => {
      console.error(`Error updating one ${query}:`, error);
      // return null
    });
};

export const deleteOne = async <T>(query: string, params: string[]) => {
  await powersync
    .execute(query, params)
    .then((result) => {
      console.log(`Result of deleteOne ${query}:`, result);
    })
    .catch((error) => {
      console.error(`Error deleting one ${query}:`, error);
    });
};

export const queryMany = async <T>(
  query: string,
  params: any[] = [],
): Promise<T[]> => {
  let result: T[] | null = null;
  await powersync
    .getAll(query, params)
    .then((queryResult) => {
      result = queryResult as T[];
    })
    .catch((error) => {
      console.error(`Error querying many ${query}:`, error);
    });
  return result || [];
};


export const addMembersToOrganization = async (data: GroupMemberRecord[]) => {
  data.forEach(async (member) => {
    const { id, group_id, member_id, member_type, sync_id } = member;
    const result = await powersync.execute(
      `INSERT INTO ${TABLES.GROUP_MEMBERS} (id, group_id, member_id, member_type, sync_id) VALUES (?, ?, ?, ?, ?)`,
      [id, group_id, member_id, member_type, sync_id],
    );
    console.log("Members added to organization", result);
  });
};
