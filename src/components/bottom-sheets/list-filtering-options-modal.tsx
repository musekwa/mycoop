import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View, useColorScheme } from "react-native";
import CustomBottomSheetModal from "./custom-bottom-sheet-modal";

type SearchKey = { label: string; value: string };

type ListFilteringOptionsModalProps = {
  bottomSheetModalRef: React.RefObject<any>;
  handleDismissModalPress: () => void;
  searchKeys: SearchKey[];
  selectedValue: string;
  onSelect: (value: string) => void;
  title?: string;
};

export default function ListFilteringOptionsModal({
  bottomSheetModalRef,
  handleDismissModalPress,
  searchKeys,
  selectedValue,
  onSelect,
  title = "Filtrar por posto administrativo",
}: ListFilteringOptionsModalProps) {
  const isDarkMode = useColorScheme() === "dark";

  return (
    <CustomBottomSheetModal
      bottomSheetModalRef={bottomSheetModalRef}
      handleDismissModalPress={handleDismissModalPress}
    >
      <View className="flex p-3">
        <Text className="mx-8 text-black font-bold dark:text-white">
          {title}
        </Text>
        <View className="gap-y-4 pt-8">
          {searchKeys.map((searchKey, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => onSelect(searchKey.value)}
              className="mx-8"
            >
              <View className="flex flex-row gap-x-3">
                <View>
                  {selectedValue === searchKey.value ? (
                    <Ionicons
                      name="radio-button-on"
                      size={24}
                      color={isDarkMode ? colors.white : colors.primary}
                    />
                  ) : (
                    <Ionicons
                      name="radio-button-off"
                      size={24}
                      color={isDarkMode ? colors.white : colors.black}
                    />
                  )}
                </View>
                <View>
                  <Text className="text-black dark:text-white text-[14px]">
                    {searchKey.label}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </CustomBottomSheetModal>
  );
}
