import CustomTextInput from "@/components/form-items/custom-text-input";
import FormItemDescription from "@/components/form-items/form-item-description";
import { colors } from "@/constants/colors";
import { useFarmerRegistrationStore } from "@/store/farmer-registration";
import { Fontisto } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, TouchableOpacity, View } from "react-native";
import { z } from "zod";

import SegmentModalLayout from "./SegmentModalLayout";

const PersonInfoSchema = z.object({
  surname: z
    .string()
    .trim()
    .min(2, "Indica um apelido.")
    .regex(/^\S*$/, "Apenas um apelido."),
  otherNames: z.string().trim().min(2, "Indica outros nomes."),
  familySize: z
    .number()
    .int()
    .min(1, "Mín. 1")
    .max(20, "Máx. 20")
    .optional()
    .refine((val): val is number => val != null, {
      message: "Indica o agregado familiar",
    }),
  gender: z.enum(["Masculino", "Feminino"], { message: "Indica o género" }),
});

type PersonInfoFormData = z.input<typeof PersonInfoSchema>;

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function PersonInfoSegmentModal({ visible, onClose }: Props) {
  const { person, setPerson } = useFarmerRegistrationStore();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PersonInfoFormData>({
    defaultValues: {
      surname: "",
      otherNames: "",
      familySize: undefined,
      gender: undefined,
    },
    resolver: zodResolver(PersonInfoSchema),
  });

  useEffect(() => {
    if (visible) {
      reset({
        surname: person?.surname ?? "",
        otherNames: person?.otherNames ?? "",
        familySize:
          person?.familySize != null ? Number(person.familySize) : undefined,
        gender: person?.gender ?? undefined,
      });
    }
  }, [visible, person, reset]);

  const onSave = handleSubmit((data) => {
    setPerson({
      surname: data.surname,
      otherNames: data.otherNames,
      gender: data.gender,
      familySize: data.familySize,
    });
    onClose();
  });

  return (
    <SegmentModalLayout
      visible={visible}
      title="Informação Pessoal"
      onClose={onClose}
      onSave={onSave}
    >
      <FormItemDescription description="Informações básicas do produtor" />
      <View className="gap-4 my-4">
        <Controller
          control={control}
          name="surname"
          render={({ field: { onChange, value } }) => (
            <View className="">
              <CustomTextInput
                label="Apelido"
                value={value}
                onChangeText={onChange}
                placeholder="Digita o apelido"
              />
              {errors.surname && (
                <Text className="text-xs text-red-500">
                  {errors.surname.message}
                </Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="otherNames"
          render={({ field: { onChange, value } }) => (
            <View className="mt-4">
              <CustomTextInput
                label="Outros Nomes"
                value={value}
                onChangeText={onChange}
                placeholder="Digita outros nomes"
              />
              {errors.otherNames && (
                <Text className="text-xs text-red-500">
                  {errors.otherNames.message}
                </Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="gender"
          render={({ field: { onChange, value } }) => (
            <View className="mt-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gênero
              </Text>
              <View className="flex-row justify-around">
                <TouchableOpacity
                  onPress={() => onChange("Masculino")}
                  className="flex-1 flex-row items-center justify-center gap-x-2 py-2"
                >
                  {value === "Masculino" ? (
                    <Fontisto
                      name="radio-btn-active"
                      color={colors.primary}
                      size={22}
                    />
                  ) : (
                    <Fontisto
                      name="radio-btn-passive"
                      color={colors.gray600}
                      size={22}
                    />
                  )}
                  <Text className="text-gray-700 dark:text-gray-300">
                    Homem
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onChange("Feminino")}
                  className="flex-1 flex-row items-center justify-center gap-x-2 py-2"
                >
                  {value === "Feminino" ? (
                    <Fontisto
                      name="radio-btn-active"
                      color={colors.primary}
                      size={22}
                    />
                  ) : (
                    <Fontisto
                      name="radio-btn-passive"
                      color={colors.gray600}
                      size={22}
                    />
                  )}
                  <Text className="text-gray-700 dark:text-gray-300">
                    Mulher
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.gender && (
                <Text className="text-xs text-red-500">
                  {errors.gender.message}
                </Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="familySize"
          render={({ field: { onChange, value } }) => (
            <View className="mt-4">
              <CustomTextInput
                label="Agregado Familiar"
                value={value?.toString() ?? ""}
                onChangeText={(t) => onChange(t ? parseInt(t, 10) : undefined)}
                keyboardType="numeric"
                placeholder="Número de membros"
              />
              {errors.familySize && (
                <Text className="text-xs text-red-500">
                  {errors.familySize.message}
                </Text>
              )}
            </View>
          )}
        />
      </View>
    </SegmentModalLayout>
  );
}
