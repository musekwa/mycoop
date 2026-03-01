import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";

// Group Card Component
export default function GroupMemberShipItem({
  group,
  selected,
  onToggle,
}: {
  group: {
    id: string;
    group_name: string;
    admin_post_name: string;
    photo?: string;
  };
  selected: boolean;
  onToggle: () => void;
}) {
  const isDark = useColorScheme() === "dark";

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.7}
      className={`will-change-variable flex-row items-center p-3 mb-3 rounded-xl border ${
        selected
          ? "bg-gray-100 border-gray-400 shadow-sm dark:bg-gray-700 dark:border-gray-500"
          : "bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-700"
      }`}
      style={
        selected
          ? {
              shadowColor: "#6b7280",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.12,
              shadowRadius: 3,
              elevation: 2,
            }
          : undefined
      }
    >
      <View className="relative">
        <View
          className={`w-14 h-14 rounded-full items-center justify-center ${
            selected
              ? "bg-gray-300 dark:bg-gray-600"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
        >
          <Ionicons
            name="people"
            size={28}
            color={selected ? colors.gray800 : colors.gray600}
          />
        </View>
        {selected && (
          <View
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full items-center justify-center border-2 border-white"
            style={{ backgroundColor: "#008000" }}
          >
            <Ionicons name="checkmark" size={12} color={colors.white} />
          </View>
        )}
      </View>
      <View className="flex-1 ml-3">
        <Text
          className={`text-base font-semibold ${
            selected
              ? "text-gray-800 dark:text-gray-200"
              : "text-gray-900 dark:text-white"
          }`}
        >
          {group.group_name}
        </Text>
        {group.admin_post_name && (
          <Text
            className={`text-xs mt-1 ${
              selected
                ? "text-gray-600 dark:text-gray-400"
                : "text-gray-500 dark:text-gray-500"
            }`}
          >
            {group.admin_post_name}
          </Text>
        )}
      </View>
      <View className="ml-2">
        {selected ? (
          <View
            key="selected"
            className="w-7 h-7 rounded-full items-center justify-center shadow-sm"
            style={{ backgroundColor: "#008000" }}
          >
            <Ionicons name="checkmark-circle" size={24} color={colors.white} />
          </View>
        ) : (
          <View
            key="unselected"
            className="w-7 h-7 rounded-full border-2 border-gray-300 dark:border-gray-600"
          />
        )}
      </View>
    </TouchableOpacity>
  );
}
