import CustomTextInput from "@/components/form-items/custom-text-input";
import FormItemDescription from "@/components/form-items/form-item-description";
import { useFarmerRegistrationStore } from "@/store/farmer-registration";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";
import DatePicker from "react-native-date-picker";
import { z } from "zod";

import { birthDateLimits } from "@/helpers/dates";
import SegmentModalLayout from "./SegmentModalLayout";

const BirthDateSchema = z.object({
  birthDate: z
    .date({ message: "Indica a data de nascimento" })
    .min(birthDateLimits.minimumDate)
    .max(birthDateLimits.maximumDate)
    .optional()
    .refine((val): val is Date => val != null, {
      message: "Indica a data de nascimento",
    }),
});

type BirthDateFormData = z.input<typeof BirthDateSchema>;

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function BirthDateSegmentModal({ visible, onClose }: Props) {
  const { birthDate: savedBirthDate, setBirthDate } =
    useFarmerRegistrationStore();
  const isDarkMode = useColorScheme() === "dark";
  const [openDate, setOpenDate] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BirthDateFormData>({
    defaultValues: {
      birthDate: undefined,
    },
    resolver: zodResolver(BirthDateSchema),
  });

  useEffect(() => {
    if (visible) {
      reset({
        birthDate: savedBirthDate?.birthDate
          ? new Date(savedBirthDate.birthDate)
          : undefined,
      });
    }
  }, [visible, savedBirthDate, reset]);

  const onSave = handleSubmit((data) => {
    if (!data.birthDate) return;
    setBirthDate({ birthDate: data.birthDate });
    onClose();
  });

  return (
    <SegmentModalLayout
      visible={visible}
      title="Data de Nascimento"
      onClose={onClose}
      onSave={onSave}
    >
      <FormItemDescription description="Indica a data de nascimento do produtor" />

      <View className="my-4">
        <Controller
          control={control}
          name="birthDate"
          render={({ field: { onChange, value } }) => (
            <View className="mt-4">
              <TouchableOpacity
                onPress={() => setOpenDate((v) => !v)}
                activeOpacity={0.7}
              >
                <CustomTextInput
                  label="Data de Nascimento"
                  editable={false}
                  value={
                    value ? new Date(value).toLocaleDateString("pt-BR") : ""
                  }
                  placeholder="Seleccione a data"
                  onChangeText={() => {}}
                />
              </TouchableOpacity>
              {openDate ? (
                <View className="mt-3 items-center">
                  <DatePicker
                    theme={isDarkMode ? "dark" : "light"}
                    minimumDate={birthDateLimits.minimumDate}
                    maximumDate={birthDateLimits.maximumDate}
                    locale="pt"
                    mode="date"
                    date={value || new Date()}
                    onDateChange={(d) => onChange(d)}
                  />
                </View>
              ) : null}
              {errors.birthDate && (
                <Text className="text-xs text-red-500">
                  {errors.birthDate.message}
                </Text>
              )}
            </View>
          )}
        />
      </View>
    </SegmentModalLayout>
  );
}
