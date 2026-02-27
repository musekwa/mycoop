import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { TextInput, TouchableOpacity } from "react-native";
import { StatusBar, View } from "react-native";

const statusBarHeight = StatusBar.currentHeight || 20;


export default function SelectorHeader ({
  label,
  searchPlaceholder,
  searchQuery,
  setSearchQuery,
  setShowModal,
}: {
  label: string;
  searchPlaceholder: string;
  searchQuery: string;
  setSearchQuery: (text: string) => void;
  setShowModal: (show: boolean) => void;
}){
  return (
    <View
      style={{
        paddingTop: statusBarHeight,
      }}
      className={`px-3 bg-[#008000]`}
    >
      <View className="flex flex-row justify-between space-x-3 items-center">
        <View className="items-center justify-center">
          <Ionicons
            onPress={() => setShowModal(false)}
            name="arrow-back-outline"
            size={24}
            color={colors.white}
          />
        </View>
        <View className="my-4 flex-1" style={{ position: "relative" }}>
          <TextInput
            className="bg-gray-100 dark:bg-gray-100 text-black dark:text-black p-2 rounded-md relative"
            placeholder={searchPlaceholder || "Procurar..."}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {/* add clear button */}
          {searchQuery && (
            <TouchableOpacity
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: [{ translateY: -10 }],
              }}
              onPress={() => setSearchQuery("")}
            >
              <Ionicons name="close" size={20} color={colors.gray600} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};