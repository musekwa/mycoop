import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export default function DistrictManagement() {
  return (
    <View className="flex-1 bg-white dark:bg-black">
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
          <Ionicons name="map-outline" size={32} color="#9CA3AF" />
        </View>
        <Text className="text-gray-900 dark:text-white font-bold text-[18px] text-center mb-2">
          Em desenvolvimento
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-[13px] text-center leading-5">
          A gestão do distrito será disponibilizada numa próxima actualização.
        </Text>
      </View>
    </View>
  );
}
