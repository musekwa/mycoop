import { colors } from "@/constants/colors";
import { useDateRangeStore } from "@/store/trades";
import { Ionicons } from "@expo/vector-icons";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import React, { useEffect, useRef } from "react";
import {
  Control,
  Controller,
  UseFormClearErrors,
  UseFormGetValues,
  UseFormSetValue,
} from "react-hook-form";
import { Pressable, Text, View } from "react-native";

type DateRangeData = {
  startDate: Date;
  endDate: Date;
};

interface EndDateSelectorProps {
  control: Control<DateRangeData>;
  lastTransactionEndDate: Date | null;
  startDate: Date;
  setValue: UseFormSetValue<DateRangeData>;
  getValues: UseFormGetValues<DateRangeData>;
  setCustomErrors: (errors: Record<string, string>) => void;
  customErrors: Record<string, string>;
  clearErrors: UseFormClearErrors<DateRangeData>;
}

export default function EndDateSelector({
  control,
  lastTransactionEndDate,
  startDate,
  setValue,
  getValues,
  setCustomErrors,
  customErrors,
  clearErrors,
}: EndDateSelectorProps) {
  const { setEndDate } = useDateRangeStore();
  const lastStoreUpdateRef = useRef<Date | null>(null);

  // Initialize end date to today
  useEffect(() => {
    const currentEndDate = getValues().endDate;
    if (!currentEndDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setValue("endDate", today, { shouldValidate: false });

      if (
        !lastStoreUpdateRef.current ||
        lastStoreUpdateRef.current.getTime() !== today.getTime()
      ) {
        setEndDate(today);
        lastStoreUpdateRef.current = today;
      }
    }
  }, [setValue, getValues, setEndDate]);

  // Watch for end date changes and sync to store
  useEffect(() => {
    const currentEndDate = getValues().endDate;
    if (currentEndDate) {
      const normalizedDate = new Date(currentEndDate.getTime());
      normalizedDate.setHours(0, 0, 0, 0);

      // Calculate minimum valid end date (startDate + 1 day)
      const actualStartDate = lastTransactionEndDate
        ? new Date(lastTransactionEndDate.getTime() + 86400000)
        : startDate;
      actualStartDate.setHours(0, 0, 0, 0);
      const minEndDate = new Date(actualStartDate.getTime() + 86400000);
      minEndDate.setHours(0, 0, 0, 0);

      // Auto-adjust if end date is invalid
      if (normalizedDate <= actualStartDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const adjustedEndDate = minEndDate > today ? today : minEndDate;

        setValue("endDate", adjustedEndDate, { shouldValidate: false });
        if (
          !lastStoreUpdateRef.current ||
          lastStoreUpdateRef.current.getTime() !== adjustedEndDate.getTime()
        ) {
          setEndDate(adjustedEndDate);
          lastStoreUpdateRef.current = adjustedEndDate;
        }
        return;
      }

      // Update store if value changed
      if (
        !lastStoreUpdateRef.current ||
        lastStoreUpdateRef.current.getTime() !== normalizedDate.getTime()
      ) {
        setEndDate(normalizedDate);
        lastStoreUpdateRef.current = normalizedDate;
      }
    }
  }, [
    getValues().endDate,
    startDate,
    lastTransactionEndDate,
    setValue,
    setEndDate,
  ]);

  const showDatePicker = (currentValue: Date, minDate: Date, maxDate: Date) => {
    console.log("TransactionEndDate showDatePicker called with:", {
      currentValue,
      minDate,
      maxDate,
    });
    DateTimePickerAndroid.open({
      value: currentValue,
      onChange: (event: any, selectedDate?: Date) => {
        console.log("TransactionEndDate DateTimePickerAndroid onChange:", {
          event,
          selectedDate,
        });
        if (selectedDate) {
          let constrainedDate = selectedDate;
          if (selectedDate < minDate) {
            constrainedDate = minDate;
          } else if (selectedDate > maxDate) {
            constrainedDate = maxDate;
          }
          setValue("endDate", constrainedDate);
          setCustomErrors({
            ...customErrors,
            dateRange: "",
            outgoing: "",
            dateMismatch: "",
          });
          clearErrors("endDate");
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
        <Controller
          control={control}
          name="endDate"
          render={({ field: { value }, fieldState: { error } }) => {
            // Calculate minimum date: startDate + 1 day (or lastTransactionEndDate + 1 day if that's later)
            const actualStartDate = lastTransactionEndDate
              ? new Date(lastTransactionEndDate.getTime() + 86400000)
              : startDate;
            const today = new Date();
            const minDate = new Date(actualStartDate.getTime() + 86400000);
            const maxDate = today;

            return (
              <View className="relative">
                <Pressable
                  onPress={() => {
                    console.log("TransactionEndDate onPress called");
                    showDatePicker(value, minDate, maxDate);
                  }}
                  className="border border-slate-300 p-3 shadow-sm shadow-black rounded-xl bg-gray-50 dark:bg-black h-13.75 flex justify-center"
                >
                  <Text className="text-gray-600 dark:text-gray-400 text-[13px]">
                    {value.toLocaleDateString("pt-BR")}
                  </Text>
                </Pressable>
                <View className="absolute right-2 top-0 bottom-0 flex items-center justify-center">
                  <Ionicons
                    name="calendar-outline"
                    size={24}
                    color={colors.primary}
                  />
                </View>
                {error && (
                  <Text className="text-red-500 text-[12px]">
                    {error.message}
                  </Text>
                )}
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}
