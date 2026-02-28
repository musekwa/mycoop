import { useNavigation, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { v4 as uuidv4 } from "uuid";

import SubmitButton from "@/components/buttons/submit-button";
import NoContentPlaceholder from "@/components/no-content-placeholder";
import FarmerMembershipItem from "@/features/group-membership/farmer-item";
import GroupMemberShipItem from "@/features/group-membership/group-item";
import {
  useQueryMany,
  useQueryOne,
  useSearchOptions,
  useUserDetails,
} from "@/hooks/queries";
import { useNavigationSearch } from "@/hooks/use-navigation-search";
import { GroupMemberRecord, TABLES } from "@/library/powersync/app-schemas";
import { buildMember } from "@/library/powersync/schemas/group-members";
import { addMembersToOrganization } from "@/library/powersync/sql-statements";
import { useActionStore } from "@/store/actions/actions";
import { useOrganizationStore } from "@/store/organization";
import { OrganizationTypes } from "@/types";
import AddGroupMembers from "@/components/add-group-members";

export default function AddMemberToGroupScreen() {
  const { userDetails } = useUserDetails();
  const { getCurrentResource, resetCurrentResource } = useActionStore();
  // const locationName = useLocationName();
  const { search, setSearch } = useNavigationSearch({
    searchBarOptions: { placeholder: "Procurar Produtores" },
  });
  const [newSearchKey, setNewSearchKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const { searchKeys, loadSearchKeys } = useSearchOptions(
    userDetails?.district_id || "",
  );

  const router = useRouter();
  const navigation = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    addOrRemoveIndividualMember,
    individualMembers,
    addOrRemoveGroupMember,
    groupMembers,
    resetGroupMembers,
    resetIndividualMembers,
  } = useOrganizationStore();
  const currentGroupId = getCurrentResource().id;

  // Get current group's district_id and organization_type from address_details and actor_categories
  const { data: currentGroupInfo, isLoading: isAddressLoading } = useQueryOne<{
    district_id: string;
    organization_type: string;
  }>(
    `SELECT 
			addr.district_id,
			ac.subcategory as organization_type
		FROM ${TABLES.ADDRESS_DETAILS} addr
		LEFT JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = addr.owner_id AND ac.category = 'GROUP'
		WHERE addr.owner_id = ? AND addr.owner_type = 'GROUP'`,
    [currentGroupId],
  );

  const districtId = currentGroupInfo?.district_id;
  const organizationType = currentGroupInfo?.organization_type;
  const isCoopUnion = organizationType === OrganizationTypes.COOP_UNION;

  // Query farmers from the same district who are not members (only for cooperatives and associations, not coop unions)
  const { data: farmersRaw, isLoading: farmersLoading } = useQueryMany<{
    id: string;
    surname: string;
    other_names: string;
    primary_phone: string;
    secondary_phone: string;
    admin_post_name: string;
    photo: string;
  }>(
    districtId && !isCoopUnion
      ? `			SELECT 
				ad.actor_id as id,
				ad.surname,
				ad.other_names,
				ad.photo,
				COALESCE(cd.primary_phone, 'N/A') as primary_phone,
				COALESCE(cd.secondary_phone, 'N/A') as secondary_phone,
				COALESCE(ap.name, 'N/A') as admin_post_name
			FROM ${TABLES.ACTOR_DETAILS} ad
			LEFT JOIN ${TABLES.CONTACT_DETAILS} cd ON cd.owner_id = ad.actor_id AND cd.owner_type = 'FARMER'
			LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = ad.actor_id AND addr.owner_type = 'FARMER'
			LEFT JOIN ${TABLES.ADMIN_POSTS} ap ON ap.id = addr.admin_post_id
			WHERE ad.surname NOT LIKE '%company%'
			AND addr.district_id = '${districtId}'
			AND NOT EXISTS (
				SELECT 1 FROM ${TABLES.GROUP_MEMBERS} gm 
				WHERE gm.member_id = ad.actor_id 
				AND gm.group_id = '${currentGroupId}'
			)`
      : "",
  );

  const farmers = useMemo(() => {
    if (!farmersRaw) return [];
    let filtered = farmersRaw;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = farmersRaw.filter(
        (farmer) =>
          `${farmer.other_names} ${farmer.surname}`
            .toLowerCase()
            .includes(searchLower) ||
          farmer.primary_phone?.toLowerCase().includes(searchLower) ||
          farmer.secondary_phone?.toLowerCase().includes(searchLower),
      );
    }
    return filtered;
  }, [farmersRaw, search]);

  // Query groups from the same district who are not members
  // For coop unions: only show COOPERATIVE and ASSOCIATION
  // For cooperatives/associations: only show ASSOCIATION
  const groupsQuery = useMemo(() => {
    if (!districtId) return "";
    const subcategoryFilter = isCoopUnion
      ? `IN ('${OrganizationTypes.COOPERATIVE}', '${OrganizationTypes.ASSOCIATION}')`
      : `= '${OrganizationTypes.ASSOCIATION}'`;
    return `SELECT 
			a.id,
			ad.other_names as group_name,
			ad.photo,
			COALESCE(ap.name, 'N/A') as admin_post_name,
			ac.subcategory as organization_type
		FROM ${TABLES.ACTORS} a
		INNER JOIN ${TABLES.ACTOR_DETAILS} ad ON ad.actor_id = a.id
		LEFT JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = a.id AND ac.category = 'GROUP'
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = a.id AND addr.owner_type = 'GROUP'
		LEFT JOIN ${TABLES.ADMIN_POSTS} ap ON ap.id = addr.admin_post_id
		WHERE a.category = 'GROUP' 
		AND ac.subcategory ${subcategoryFilter}
		AND addr.district_id = '${districtId}'
		AND a.id != '${currentGroupId}'
		AND NOT EXISTS (
			SELECT 1 FROM ${TABLES.GROUP_MEMBERS} gm 
			WHERE gm.member_id = a.id 
			AND gm.group_id = '${currentGroupId}'
		)`;
  }, [districtId, organizationType, currentGroupId]);

  const { data: groupsRaw, isLoading: isGroupsLoading } = useQueryMany<{
    id: string;
    group_name: string;
    admin_post_name: string;
    photo: string;
    organization_type: string;
  }>(groupsQuery);

  const groups = useMemo(() => {
    if (!groupsRaw) return [];
    let filtered = groupsRaw;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = groupsRaw.filter((group) =>
        group.group_name.toLowerCase().includes(searchLower),
      );
    }
    return filtered;
  }, [groupsRaw, search]);

  // Handle the confirmation of adding the selected members to the organization
  const onConfirm = async () => {
    if (!userDetails || !userDetails.district_id || !districtId) return;
    let members: GroupMemberRecord[] = [];
    let individualMembersToAdd: GroupMemberRecord[] = [];
    let groupMembersToAdd: GroupMemberRecord[] = [];

    if (individualMembers.length > 0) {
      individualMembersToAdd = individualMembers.map((member) => {
        const id = uuidv4();
        return buildMember({
          id: id,
          group_id: currentGroupId,
          member_id: member.id,
          member_type: "FARMER",
          sync_id: districtId,
        });
      });
    }

    if (groupMembers.length > 0) {
      groupMembersToAdd = groupMembers.map((member) => {
        const id = uuidv4();
        return buildMember({
          id: id,
          group_id: currentGroupId,
          member_id: member.id,
          member_type: "GROUP",
          sync_id: districtId,
        });
      });
    }

    members = [...individualMembersToAdd, ...groupMembersToAdd];

    if (members.length === 0) return;

    try {
      await addMembersToOrganization(members);
      router.navigate("/(profiles)/group/members-list");
      resetGroupMembers();
      resetIndividualMembers();
    } catch (error) {
      console.error("Error adding members:", error);
    }
  };

  const handleToggleFarmer = (farmer: (typeof farmers)[0]) => {
    addOrRemoveIndividualMember({
      id: farmer.id,
      title: `${farmer.other_names} ${farmer.surname}`,
    });
  };

  const handleToggleGroup = (group: (typeof groups)[0]) => {
    addOrRemoveGroupMember({ id: group.id, title: group.group_name });
  };

  // Filter groups into cooperatives and associations for coop unions
  const cooperatives = useMemo(() => {
    if (!groupsRaw || !isCoopUnion) return [];
    return groupsRaw.filter((group) => {
      // We need to check the subcategory, but we don't have it in the query result
      // So we'll need to update the query to include it
      return true; // Placeholder - will be filtered by the query
    });
  }, [groupsRaw, isCoopUnion]);

  const associations = useMemo(() => {
    if (!groupsRaw || !isCoopUnion) return [];
    return groupsRaw.filter((group) => {
      // We need to check the subcategory, but we don't have it in the query result
      // So we'll need to update the query to include it
      return true; // Placeholder - will be filtered by the query
    });
  }, [groupsRaw, isCoopUnion]);

  const horizontalData = isCoopUnion
    ? [
        {
          id: 1,
          title: "Cooperativas",
          iconName: "people",
        },
        {
          id: 2,
          title: "Associações",
          iconName: "people",
        },
      ]
    : [
        {
          id: 1,
          title: "Produtores",
          iconName: "person",
        },
        {
          id: 2,
          title: "Associações",
          iconName: "people",
        },
      ];

  const verticalData = isCoopUnion
    ? [
        {
          id: 1,
          title: "Cooperativas",
          component: (
            <FlatList
              data={cooperatives}
              keyExtractor={(item: (typeof cooperatives)[0]) => item.id}
              contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View className="h-100 flex justify-center items-center">
                  <NoContentPlaceholder message="Nenhuma cooperativa encontrada" />
                </View>
              )}
              renderItem={({ item }: { item: (typeof cooperatives)[0] }) => (
                <GroupMemberShipItem
                  group={item}
                  selected={groupMembers.some((m) => m.id === item.id)}
                  onToggle={() => handleToggleGroup(item)}
                />
              )}
            />
          ),
        },
        {
          id: 2,
          title: "Associações",
          component: (
            <FlatList
              data={associations}
              keyExtractor={(item: (typeof associations)[0]) => item.id}
              contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View className="h-100 flex justify-center items-center">
                  <NoContentPlaceholder message="Nenhuma associação encontrada" />
                </View>
              )}
              renderItem={({ item }: { item: (typeof associations)[0] }) => (
                <GroupMemberShipItem
                  group={item}
                  selected={groupMembers.some((m) => m.id === item.id)}
                  onToggle={() => handleToggleGroup(item)}
                />
              )}
            />
          ),
        },
      ]
    : [
        {
          id: 1,
          title: "Produtores",
          component: (
            <FlatList
              data={farmers}
              keyExtractor={(item: (typeof farmers)[0]) => item.id}
              contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View className="h-100 flex justify-center items-center">
                  <NoContentPlaceholder message="Nenhum produtor encontrado" />
                </View>
              )}
              renderItem={({ item }: { item: (typeof farmers)[0] }) => (
                <FarmerMembershipItem
                  farmer={item}
                  selected={individualMembers.some((m) => m.id === item.id)}
                  onToggle={() => handleToggleFarmer(item)}
                />
              )}
            />
          ),
        },
        {
          id: 2,
          title: "Associações",
          component: (
            <FlatList
              data={groups}
              keyExtractor={(item: (typeof groups)[0]) => item.id}
              contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View className="h-100 flex justify-center items-center">
                  <NoContentPlaceholder message="Nenhuma associação encontrada" />
                </View>
              )}
              renderItem={({ item }: { item: (typeof groups)[0] }) => (
                <GroupMemberShipItem
                  group={item}
                  selected={groupMembers.some((m) => m.id === item.id)}
                  onToggle={() => handleToggleGroup(item)}
                />
              )}
            />
          ),
        },
      ];

  const totalSelected = individualMembers.length + groupMembers.length;

  return (
    <>
      <AddGroupMembers
        horizontalData={horizontalData}
        verticalData={verticalData}
      />
      {totalSelected > 0 && (
        <View className="absolute bottom-10 left-0 right-0 px-3">
          <SubmitButton
            title={`Confirmar (${totalSelected} ${totalSelected === 1 ? "selecionado" : "selecionados"})`}
            onPress={onConfirm}
          />
        </View>
      )}
    </>
  );
}
