import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, useColorScheme, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { colors } from "@/constants/colors";
import { useQueryManyAndWatchChanges } from "@/hooks/queries";
import { TABLES } from "@/library/powersync/app-schemas";
import { useActionStore } from "@/store/actions/actions";

interface StatsOverviewProps {
  groupId?: string;
}

const StatsOverview = ({ groupId }: StatsOverviewProps) => {
  const isDarkMode = useColorScheme() === "dark";
  const { getCurrentResource } = useActionStore();
  const currentGroupId = groupId || getCurrentResource().id;

  const { data: groupInfo } = useQueryManyAndWatchChanges<{
    group_name: string;
    organization_type: string;
    photo: string;
    created_at: string;
  }>(
    `SELECT 
      ad.other_names as group_name,
      ac.subcategory as organization_type,
      ad.photo,
      a.created_at
    FROM ${TABLES.ACTORS} a
    INNER JOIN ${TABLES.ACTOR_DETAILS} ad ON ad.actor_id = a.id
    LEFT JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = a.id AND ac.category = 'GROUP'
    WHERE a.id = '${currentGroupId}' AND a.category = 'GROUP'`,
  );

  const { data: stats } = useQueryManyAndWatchChanges<{
    total_members: number;
    total_farmers: number;
    total_groups: number;
    total_managers: number;
  }>(
    `SELECT 
      (SELECT COUNT(*) FROM ${TABLES.GROUP_MEMBERS} WHERE group_id = '${currentGroupId}') as total_members,
      (SELECT COUNT(*) FROM ${TABLES.GROUP_MEMBERS} WHERE group_id = '${currentGroupId}' AND member_type = 'FARMER') as total_farmers,
      (SELECT COUNT(*) FROM ${TABLES.GROUP_MEMBERS} WHERE group_id = '${currentGroupId}' AND member_type = 'GROUP') as total_groups,
      (SELECT COUNT(*) FROM ${TABLES.GROUP_MANAGER_ASSIGNMENTS} WHERE group_id = '${currentGroupId}' AND is_active = 'true') as total_managers`,
  );

  const StatCard = ({
    icon,
    label,
    value,
    color,
    delay = 0,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: number;
    color: string;
    delay?: number;
  }) => (
    <Animated.View
      entering={FadeInDown.duration(400).delay(delay)}
      className="flex-1 items-center py-3 px-2 rounded-lg border"
      style={{
        backgroundColor: isDarkMode ? "#1F2937" : "#F9FAFB",
        borderColor: isDarkMode ? "#374151" : "#E5E7EB",
      }}
    >
      <Ionicons name={icon} size={24} color={color} />
      <Text
        className="text-2xl font-bold mt-1"
        style={{ color: isDarkMode ? "#F3F4F6" : "#111827" }}
      >
        {value}
      </Text>
      <Text
        className="text-xs text-center mt-1"
        style={{ color: isDarkMode ? "#9CA3AF" : "#6B7280" }}
      >
        {label}
      </Text>
    </Animated.View>
  );

  if (!groupInfo || groupInfo.length === 0) {
    return null;
  }

  const group = groupInfo[0];
  const groupStats = stats?.[0] || {
    total_members: 0,
    total_farmers: 0,
    total_groups: 0,
    total_managers: 0,
  };

  return (
    <Animated.View entering={FadeInDown.duration(300)}>
      <View
        className="px-4 py-4 mb-2"
        style={{
          backgroundColor: isDarkMode ? "#111827" : "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: isDarkMode ? "#374151" : "#E5E7EB",
        }}
      >
        <View className="flex-row items-center mb-3">
          <View
            className="w-12 h-12 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: colors.primary + "20" }}
          >
            <Ionicons name="people" size={24} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text
              className="text-lg font-bold"
              style={{ color: isDarkMode ? "#F3F4F6" : "#111827" }}
            >
              {group.group_name}
            </Text>
            <Text
              className="text-sm"
              style={{ color: isDarkMode ? "#9CA3AF" : "#6B7280" }}
            >
              {group.organization_type || "Associação"}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-2">
          <StatCard
            icon="people-outline"
            label="Total"
            value={groupStats.total_members}
            color={colors.primary}
            delay={100}
          />
          <StatCard
            icon="person-outline"
            label="Produtores"
            value={groupStats.total_farmers}
            color={colors.infoText}
            delay={200}
          />
          <StatCard
            icon="git-branch-outline"
            label="Grupos"
            value={groupStats.total_groups}
            color={colors.warning}
            delay={300}
          />
          <StatCard
            icon="shield-checkmark-outline"
            label="Gestores"
            value={groupStats.total_managers}
            color={colors.successText}
            delay={400}
          />
        </View>
      </View>
    </Animated.View>
  );
};

export default StatsOverview;
