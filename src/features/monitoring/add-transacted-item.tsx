import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { z } from "zod";

import Label from "@/components/form-items/custom-label";
import { CustomPicker } from "@/components/form-items/custom-picker";
import FormItemDescription from "@/components/form-items/form-item-description";
import { colors } from "@/constants/colors";
import { transactedItems } from "@/constants/transacted-items";
import { useTransactedItemStore } from "@/store/trades";

interface AddTransactedItemProps {
  customErrors: Record<string, string>;
  setCustomErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  // setShowInfoProviderModal: React.Dispatch<React.SetStateAction<boolean>>;
  // showInfoProviderModal: boolean;
  // ownerId: string;
  // storeId: string;
  // storeType: string;
}

const itemSchema = z.object({
  item: z.string().min(1, "Selecione um item"),
});

type ItemFormData = z.infer<typeof itemSchema>;

export default function AddTransactedItem({
  customErrors,
  setCustomErrors,
}: AddTransactedItemProps) {
  const isDarkMode = useColorScheme() === "dark";
  const { item, setItem } = useTransactedItemStore();
  const bottomSheetModalRef = useRef<any>(null);

  useEffect(() => {
    // Clear any existing error for this field when item is selected
    if (item && customErrors.item) {
      setCustomErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.item;
        return newErrors;
      });
    }
  }, [item, customErrors.item, setCustomErrors]);

  const handleItemSelect = (selectedValue: string) => {
    setItem(selectedValue);
    bottomSheetModalRef.current?.dismiss();
  };

  const getItemLabel = (itemValue: string) => {
    const item = transactedItems.find((i) => i.value === itemValue);
    return item ? item.label : "Selecionar item...";
  };

  const openPicker = () => {
    bottomSheetModalRef.current?.present();
  };

  return (
    <View className="mb-4">
      <Label label="Produto Transaccionado" />
      {/* <FormItemDescription description="Selecione o tipo de item para esta transação" /> */}
{/* 
      <TouchableOpacity
        onPress={openPicker}
        className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800 flex-row items-center justify-between"
        style={{
          borderColor: customErrors.item
            ? colors.danger
            : isDarkMode
              ? "#374151"
              : "#E5E7EB",
        }}
      >
        <Text
          className="flex-1 text-[16px]"
          style={{
            color: item
              ? isDarkMode
                ? "#F3F4F6"
                : "#111827"
              : isDarkMode
                ? "#9CA3AF"
                : "#6B7280",
          }}
        >
          {getItemLabel(item)}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={isDarkMode ? colors.lightestgray : colors.gray800}
        />
      </TouchableOpacity> */}

      {customErrors.item && (
        <Text className="text-xs text-red-500 mt-1">{customErrors.item}</Text>
      )}

      <CustomPicker
        items={transactedItems.map((item) => ({
          label: item.label,
          value: item.value,
        }))}
        setValue={handleItemSelect}
        placeholder={{ label: "Selecionar produto...", value: null }}
        value={item}
      />
    </View>
  );
}
