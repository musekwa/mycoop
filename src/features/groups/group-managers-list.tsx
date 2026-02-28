import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { colors } from "@/constants/colors";
import { useQueryManyAndWatchChanges } from "@/hooks/queries";
import { TABLES } from "@/library/powersync/app-schemas";
import { useActionStore } from "@/store/actions/actions";

import GroupManagerItem from "./group-manager-item";

interface GroupManagersListProps {
  groupId?: string;
}

const GroupManagersList = ({ groupId }: GroupManagersListProps) => {
  const isDarkMode = useColorScheme() === "dark";
  const router = useRouter();
  const { getCurrentResource } = useActionStore();
  const currentGroupId = groupId || getCurrentResource().id;

  const { data: groupManagers, isLoading } = useQueryManyAndWatchChanges<{
    group_manager_id: string;
    position: string;
  }>(
    `SELECT DISTINCT
      gma.group_manager_id,
      gma.position
    FROM ${TABLES.GROUP_MANAGER_ASSIGNMENTS} gma
    WHERE gma.group_id = '${currentGroupId}' AND gma.is_active = 'true'
    ORDER BY gma.position`,
  );

  const handleAddManager = () => {
    router.push("/(aux)/add-group-manager");
  };

  const handlePhoneCall = (fullName: string, phoneNumber: string) => {
    
  };

  const renderAddManagerButton = () => (
    <TouchableOpacity
      onPress={handleAddManager}
      activeOpacity={0.7}
      className="items-center mr-4"
      style={{ width: 80 }}
    >
      <View
        className="items-center justify-center"
        style={{
          width: 45,
          height: 45,
          borderRadius: 22.5,
          borderWidth: 2,
          borderColor: isDarkMode ? "#374151" : "#E5E7EB",
          borderStyle: "dashed",
          backgroundColor: isDarkMode ? "#1F2937" : "#F9FAFB",
        }}
      >
        <Ionicons
          name="add"
          size={20}
          color={isDarkMode ? colors.lightestgray : colors.gray600}
        />
      </View>
      <Text
        className="text-xs font-medium mt-2 text-center"
        style={{ color: isDarkMode ? "#9CA3AF" : "#6B7280" }}
      >
        Adicionar
      </Text>
      <Text
        className="text-xs italic text-gray-500 text-center mt-1"
        style={{ color: isDarkMode ? "#6B7280" : "#9CA3AF" }}
      >
        Representante
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <Animated.View
      entering={FadeIn.duration(300)}
      className="px-4 py-6"
      style={{
        backgroundColor: isDarkMode ? "#1F2937" : "#F9FAFB",
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 8,
      }}
    >
      <View className="items-center py-4">
        <Ionicons
          name="people-outline"
          size={24}
          color={isDarkMode ? colors.lightestgray : colors.gray800}
        />
        <Text
          className="text-base mt-2 text-center"
          style={{ color: isDarkMode ? "#F3F4F6" : "#111827" }}
        >
          Sem Representantes
        </Text>
        <Text
          className="text-sm italic text-center mt-2 px-4"
          style={{ color: isDarkMode ? "#9CA3AF" : "#6B7280" }}
        >
          Adicione representantes para fornecer informações sobre actividades
          deste grupo
        </Text>
        <TouchableOpacity
          onPress={handleAddManager}
          activeOpacity={0.5}
          className="mt-4 p-3 rounded-full flex-row items-center"
          style={{
            backgroundColor: colors.primary,
          }}
        >
          <FontAwesome6 name="user-plus" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  if (isLoading) {
    return (
      <View className="px-4 py-3">
        <Text
          className="text-sm font-medium mb-3"
          style={{ color: isDarkMode ? "#F3F4F6" : "#111827" }}
        >
          Representantes
        </Text>
        <View className="flex-row">
          {[1, 2, 3].map((i) => (
            <View key={i} className="items-center mr-4" style={{ width: 80 }}>
              <View
                className="rounded-full bg-gray-200 dark:bg-gray-700"
                style={{ width: 60, height: 60 }}
              />
              <View
                className="rounded bg-gray-200 dark:bg-gray-700 mt-2"
                style={{ width: 60, height: 12 }}
              />
              <View
                className="rounded bg-gray-200 dark:bg-gray-700 mt-1"
                style={{ width: 40, height: 10 }}
              />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (!groupManagers || groupManagers.length === 0) {
    return renderEmptyState();
  }

  return (
    <Animated.View entering={FadeInDown.duration(400)}>
      <View
        className="px-4 py-3"
        style={{
          backgroundColor: isDarkMode ? "#111827" : "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: isDarkMode ? "#374151" : "#E5E7EB",
        }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <Text
            className="text-sm font-medium"
            style={{ color: isDarkMode ? "#F3F4F6" : "#111827" }}
          >
            Representantes ({groupManagers.length})
          </Text>
        </View>
        <FlatList
          data={groupManagers}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.group_manager_id}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeIn.delay(index * 100).duration(300)}>
              <GroupManagerItem
                groupManagerId={item.group_manager_id}
                onPhoneCall={handlePhoneCall}
              />
            </Animated.View>
          )}
          ListFooterComponent={renderAddManagerButton}
          contentContainerStyle={{
            paddingRight: 16,
          }}
        />
      </View>
    </Animated.View>
  );
};

export default GroupManagersList;
