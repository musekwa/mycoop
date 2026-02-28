import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";

import { colors } from "@/constants/colors";
import { avatarPlaceholderUri } from "@/constants/image-uris";
import { groupManagerPositions } from "@/constants/roles";
import { useQueryManyAndWatchChanges } from "@/hooks/queries";
import { TABLES } from "@/library/powersync/app-schemas";

interface GroupManagerItemProps {
  groupManagerId: string;
  onPhoneCall: (fullName: string, phoneNumber: string) => void;
}

const GroupManagerItem = ({
  groupManagerId,
  onPhoneCall,
}: GroupManagerItemProps) => {
  const isDarkMode = useColorScheme() === "dark";

  const { data: managerData } = useQueryManyAndWatchChanges<{
    id: string;
    surname: string;
    other_names: string;
    photo: string;
    primary_phone: string;
    secondary_phone: string;
    position: string;
  }>(
    `SELECT 
      ad.actor_id as id,
      ad.surname,
      ad.other_names,
      ad.photo,
      cd.primary_phone,
      cd.secondary_phone,
      gma.position
    FROM ${TABLES.ACTOR_DETAILS} ad
    LEFT JOIN ${TABLES.CONTACT_DETAILS} cd ON cd.owner_id = ad.actor_id AND cd.owner_type = 'GROUP_MANAGER'
    LEFT JOIN ${TABLES.GROUP_MANAGER_ASSIGNMENTS} gma ON gma.group_manager_id = ad.actor_id
    WHERE ad.actor_id = '${groupManagerId}'`,
  );

  if (!managerData || managerData.length === 0) {
    return null;
  }

  const manager = managerData[0];
  const photoUrl =
    manager.photo && manager.photo !== "N/A"
      ? manager.photo
      : avatarPlaceholderUri;
  const fullName = `${manager.surname} ${manager.other_names}`;
  const phoneNumber =
    manager.primary_phone && manager.primary_phone !== "N/A"
      ? manager.primary_phone
      : manager.secondary_phone && manager.secondary_phone !== "N/A"
        ? manager.secondary_phone
        : "N/A";

  const handlePosition = (position?: string) => {
    if (!position) return "N/A";
    const pos = groupManagerPositions.find((pos) => pos.value === position);
    return pos?.label || "N/A";
  };

  const handlePhoneCall = () => {
    if (phoneNumber === "N/A") return;
    onPhoneCall(fullName, phoneNumber);
  };

  const handleCardPress = () => {
    // Handle card press if needed (e.g., navigation to details)
    // Currently empty since we only want phone icon to trigger dialog
  };

  return (
    <View>
      <TouchableOpacity
        onPress={handleCardPress}
        activeOpacity={0.8}
        className="items-center mr-4"
        style={{ width: 80 }}
      >
        <View className="relative">
          <Image
            source={{ uri: photoUrl }}
            style={{
              width: 45,
              height: 45,
              borderRadius: 22.5,
              borderWidth: 2,
              borderColor: isDarkMode ? "#374151" : "#E5E7EB",
              backgroundColor: isDarkMode ? "#1F2937" : "#F9FAFB",
            }}
            contentFit="cover"
          />
          {/* Status indicator */}
          <View
            className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2"
            style={{
              backgroundColor: "#10B981",
              borderColor: isDarkMode ? "#111827" : "#FFFFFF",
            }}
          />
        </View>
        <Text
          className="text-xs font-medium mt-2 text-center"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{
            color: isDarkMode ? "#F3F4F6" : "#111827",
            lineHeight: 14,
            maxHeight: 14,
          }}
        >
          {fullName}
        </Text>
        <View className="flex-row items-center mt-1">
          <Ionicons
            name="briefcase-outline"
            size={10}
            color={isDarkMode ? colors.lightestgray : colors.gray600}
          />
          <Text
            className="text-xs ml-1"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              color: isDarkMode ? colors.lightestgray : colors.gray600,
              maxWidth: 60,
            }}
          >
            {handlePosition(manager.position)}
          </Text>
        </View>
        {phoneNumber !== "N/A" && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handlePhoneCall();
            }}
            className="mt-1 p-1 rounded-full"
            style={{
              backgroundColor: isDarkMode ? "#374151" : "#F3F4F6",
            }}
          >
            <Ionicons name="call-outline" size={12} color="#10B981" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default GroupManagerItem;
