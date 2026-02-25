import Label from "@/components/form-items/custom-label";
import { CustomPicker } from "@/components/form-items/custom-picker";
import CustomTextInput from "@/components/form-items/custom-text-input";
import FormItemDescription from "@/components/form-items/form-item-description";
import SegmentModalLayout from "@/features/farmers/registration/segments/SegmentModalLayout";
import { getFullYears } from "@/helpers/dates";
import {
  useAssociationStore,
  useCoopStore,
  useCoopUnionStore,
} from "@/store/organizations";
import { OrganizationTypes } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { z } from "zod";

const BasicInfoSchema = z.object({
  name: z.string().trim().min(2, "Indica o nome da organização."),
  creationYear: z.string().optional(),
});

type BasicInfoFormData = z.infer<typeof BasicInfoSchema>;

type Props = {
  visible: boolean;
  onClose: () => void;
  variant?: "bottomSheet" | "inline";
  groupType: OrganizationTypes;
};

function useGroupStore(groupType: OrganizationTypes) {
  const coopStore = useCoopStore();
  const assocStore = useAssociationStore();
  const coopUnionStore = useCoopUnionStore();

  if (groupType === OrganizationTypes.COOPERATIVE) return coopStore;
  if (groupType === OrganizationTypes.ASSOCIATION) return assocStore;
  return coopUnionStore;
}

function getOrgLabel(groupType: OrganizationTypes) {
  if (groupType === OrganizationTypes.COOP_UNION) return "união de cooperativas";
  if (groupType === OrganizationTypes.ASSOCIATION) return "associação";
  return "cooperativa";
}

export default function GroupBasicInfoSegment({
  visible,
  onClose,
  variant = "bottomSheet",
  groupType,
}: Props) {
  const store = useGroupStore(groupType);
  const showCreationYear = groupType !== OrganizationTypes.COOP_UNION;
  const orgLabel = getOrgLabel(groupType);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<BasicInfoFormData>({
    defaultValues: {
      name: "",
      creationYear: "",
    },
    resolver: zodResolver(BasicInfoSchema),
  });

  useEffect(() => {
    if (visible) {
      const fd = store.formData as any;
      reset({
        name: fd.name || "",
        creationYear: fd.creationYear || "",
      });
    }
  }, [visible]);

  const onSave = handleSubmit((data) => {
    if (showCreationYear && (!data.creationYear || data.creationYear.length < 1)) {
      setError("creationYear", {
        message: `Indica o ano de criação da ${orgLabel}`,
      });
      return;
    }

    const current = store.formData;
    if (showCreationYear) {
      (store as any).setFormData({
        ...current,
        name: data.name,
        creationYear: data.creationYear || "",
      });
    } else {
      store.setFormData({
        ...current,
        name: data.name,
      } as any);
    }
    onClose();
  });

  return (
    <SegmentModalLayout
      visible={visible}
      title="Informação Básica"
      onClose={onClose}
      onSave={onSave}
      variant={variant}
    >
      <FormItemDescription
        description={`Informações básicas da ${orgLabel}`}
      />
      <View className="mt-4 gap-y-4">
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <View>
              <CustomTextInput
                label={`Nome da ${orgLabel}`}
                value={value ?? ""}
                onChangeText={onChange}
                autoCapitalize="words"
                placeholder={`Nome da ${orgLabel}`}
              />
              {error && (
                <Text className="text-xs text-red-500">{error.message}</Text>
              )}
            </View>
          )}
        />

        {showCreationYear && (
          <Controller
            control={control}
            name="creationYear"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <Label label="Ano de Criação" />
                <CustomPicker
                  placeholder={{ label: "Ano de Criação", value: null }}
                  value={value ?? ""}
                  setValue={onChange}
                  items={getFullYears()}
                />
                {error && (
                  <Text className="text-xs text-red-500">{error.message}</Text>
                )}
              </View>
            )}
          />
        )}
      </View>
    </SegmentModalLayout>
  );
}
