import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function MonitoringIndex() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* Back button */}
      <View className="pt-14 px-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#008000" />
          <Text className="text-[#008000] text-[14px] font-medium ml-1">
            Voltar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Placeholder content */}
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
          <Ionicons name="construct-outline" size={32} color="#9CA3AF" />
        </View>
        <Text className="text-gray-900 dark:text-white font-bold text-[18px] text-center mb-2">
          Em desenvolvimento
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-[13px] text-center leading-5">
          Esta funcionalidade ainda não está disponível. Estará disponível numa
          próxima actualização.
        </Text>
      </View>
    </View>
  );
}
