import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface StartDateSelectorProps {
  startDate: Date;
  onStartDateChange: (date: Date) => void;
  minDate: Date;
  maxDate: Date;
  isLocked: boolean;
}

export default function StartDateSelector({
  startDate,
  onStartDateChange,
  minDate,
  maxDate,
  isLocked,
}: StartDateSelectorProps) {
  const showDatePicker = () => {
    DateTimePickerAndroid.open({
      value: startDate,
      onChange: (_event: any, selectedDate?: Date) => {
        if (selectedDate) {
          onStartDateChange(selectedDate);
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
        <Text className="text-gray-600 dark:text-gray-400 text-[14px]">De</Text>
      </View>
      <View className="flex-1">
        <View className="relative">
          {isLocked ? (
            <View className="border border-slate-300 p-3 shadow-sm shadow-black rounded-xl bg-gray-100 dark:bg-gray-800 h-13.75 flex justify-center opacity-60">
              <Text className="text-gray-600 dark:text-gray-400 text-[13px]">
                {startDate.toLocaleDateString("pt-BR")}
              </Text>
            </View>
          ) : (
            <Pressable
              onPress={showDatePicker}
              className="border border-slate-300 p-3 shadow-sm shadow-black rounded-xl bg-gray-50 dark:bg-black h-13.75 flex justify-center"
            >
              <Text className="text-gray-600 dark:text-gray-400 text-[13px]">
                {startDate.toLocaleDateString("pt-BR")}
              </Text>
            </Pressable>
          )}
          {!isLocked && (
            <View className="absolute right-2 top-0 bottom-0 flex items-center justify-center">
              <Ionicons
                name="calendar-outline"
                size={24}
                color={colors.primary}
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
