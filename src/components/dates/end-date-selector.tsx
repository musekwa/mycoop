import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface EndDateSelectorProps {
  endDate: Date;
  onEndDateChange: (date: Date) => void;
  minDate: Date;
  maxDate: Date;
}

export default function EndDateSelector({
  endDate,
  onEndDateChange,
  minDate,
  maxDate,
}: EndDateSelectorProps) {
  const showDatePicker = () => {
    DateTimePickerAndroid.open({
      value: endDate,
      onChange: (_event: any, selectedDate?: Date) => {
        if (selectedDate) {
          onEndDateChange(selectedDate);
        }
      },
      mode: "date",
      is24Hour: true,
      minimumDate: minDate,
      maximumDate: maxDate,
      positiveButton: { label: "OK", textColor: colors.primary },
      negativeButton: { label: "Cancelar", textColor: colors.primary },
    });
  };

  return (
    <View className="flex flex-row justify-between space-x-2 items-center mt-4">
      <View className="w-20">
        <Text className="text-gray-600 dark:text-gray-400 text-[14px]">
          Até
        </Text>
      </View>
      <View className="flex-1">
        <View className="relative">
          <Pressable
            onPress={showDatePicker}
            className="border border-slate-300 p-3 shadow-sm shadow-black rounded-xl bg-gray-50 dark:bg-black h-13.75 flex justify-center"
          >
            <Text className="text-gray-600 dark:text-gray-400 text-[13px]">
              {endDate.toLocaleDateString("pt-BR")}
            </Text>
          </Pressable>
          <View className="absolute right-2 top-0 bottom-0 flex items-center justify-center">
            <Ionicons
              name="calendar-outline"
              size={24}
              color={colors.primary}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
