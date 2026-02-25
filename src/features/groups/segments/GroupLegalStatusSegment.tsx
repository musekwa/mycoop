import RadioButton from "@/components/buttons/radio-button";
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
import { CoopAffiliationStatus, OrganizationTypes } from "@/types";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";

type LegalStatusFormData = {
  affiliationStatus: string;
  affiliationYear: string;
  license: string;
  nuel: string;
  nuit: string;
};

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

export default function GroupLegalStatusSegment({
  visible,
  onClose,
  variant = "bottomSheet",
  groupType,
}: Props) {
  const store = useGroupStore(groupType);
  const orgLabel = getOrgLabel(groupType);
  const showAffiliationStatus = groupType !== OrganizationTypes.COOP_UNION;
  const [customErrors, setCustomErrors] = useState<Record<string, string>>({});

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    watch,
    formState: { errors },
  } = useForm<LegalStatusFormData>({
    defaultValues: {
      affiliationStatus: "",
      affiliationYear: "",
      license: "",
      nuel: "",
      nuit: "",
    },
  });

  const affiliationStatusValue = watch("affiliationStatus");

  // Whether legal detail fields should be shown and required
  const requireLegalFields = showAffiliationStatus
    ? affiliationStatusValue === CoopAffiliationStatus.AFFILIATED
    : true; // coop-union always requires them

  useEffect(() => {
    if (visible) {
      const fd = store.formData as any;
      reset({
        affiliationStatus: fd.affiliationStatus || "",
        affiliationYear: fd.affiliationYear || "",
        license: fd.license || "",
        nuel: fd.nuel || "",
        nuit: fd.nuit || "",
      });
      setCustomErrors({});
    }
  }, [visible]);

  const validate = (): Record<string, string> => {
    const values = getValues();
    const errs: Record<string, string> = {};

    if (showAffiliationStatus && !values.affiliationStatus) {
      errs.affiliationStatus = `Indica o estado de legalidade da ${orgLabel}`;
    }

    if (requireLegalFields) {
      if (!values.affiliationYear) {
        errs.affiliationYear = "Indica o ano de legalização";
      }
      if (!values.license) {
        errs.license = "Indica o número de licença";
      }
      if (!values.nuel) {
        errs.nuel = "Indica o NUEL";
      } else if (!/^\d{9}$/.test(values.nuel.trim())) {
        errs.nuel = "NUEL deve ter 9 dígitos";
      }
      if (!values.nuit) {
        errs.nuit = "Indica o NUIT";
      } else if (!/^\d{9}$/.test(values.nuit.trim())) {
        errs.nuit = "NUIT deve ter 9 dígitos";
      }
    }

    return errs;
  };

  const onSave = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setCustomErrors(errs);
      return;
    }
    setCustomErrors({});

    const values = getValues();
    const current = store.formData;
    store.setFormData({
      ...current,
      ...(showAffiliationStatus
        ? { affiliationStatus: values.affiliationStatus }
        : {}),
      affiliationYear: requireLegalFields ? values.affiliationYear : "",
      license: requireLegalFields ? values.license : "",
      nuel: requireLegalFields ? values.nuel : "",
      nuit: requireLegalFields ? values.nuit : "",
    } as any);
    onClose();
  };

  return (
    <SegmentModalLayout
      visible={visible}
      title="Estado Legal"
      onClose={onClose}
      onSave={onSave}
      variant={variant}
    >
      <FormItemDescription
        description={`Informações sobre a legalidade da ${orgLabel}`}
      />

      <View className="mt-4 gap-y-4">
        {/* Affiliation status radio (assoc/coop only) */}
        {showAffiliationStatus && (
          <View>
            <Label label={`Legalidade da ${orgLabel}`} />
            <Controller
              name="affiliationStatus"
              control={control}
              render={({ field: { onChange, value } }) => (
                <View>
                  <RadioButton
                    label="Legalizada"
                    value={CoopAffiliationStatus.AFFILIATED}
                    checked={value === CoopAffiliationStatus.AFFILIATED}
                    onChange={onChange}
                  />
                  <RadioButton
                    label="Em Processo de Legalização"
                    value={CoopAffiliationStatus.AFFILIATION_ON_PROCESS}
                    checked={
                      value === CoopAffiliationStatus.AFFILIATION_ON_PROCESS
                    }
                    onChange={onChange}
                  />
                  <RadioButton
                    label="Não Legalizada"
                    value={CoopAffiliationStatus.NOT_AFFILIATED}
                    checked={value === CoopAffiliationStatus.NOT_AFFILIATED}
                    onChange={onChange}
                  />
                  {customErrors.affiliationStatus && (
                    <Text className="text-xs text-red-500">
                      {customErrors.affiliationStatus}
                    </Text>
                  )}
                </View>
              )}
            />
          </View>
        )}

        {/* Legal detail fields (conditional for assoc/coop, always for coop-union) */}
        {requireLegalFields && (
          <>
            <View>
              <Label label="Ano de Legalização" />
              <Controller
                name="affiliationYear"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <>
                    <CustomPicker
                      placeholder={{ label: "Ano de Legalização", value: null }}
                      value={value || ""}
                      setValue={onChange}
                      items={getFullYears()}
                    />
                    {customErrors.affiliationYear && (
                      <Text className="text-xs text-red-500">
                        {customErrors.affiliationYear}
                      </Text>
                    )}
                  </>
                )}
              />
            </View>

            <Controller
              control={control}
              name="license"
              render={({ field: { onChange, value, onBlur } }) => (
                <View>
                  <CustomTextInput
                    label="Número de licença (alvará)"
                    value={value ?? ""}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="characters"
                    placeholder="No. de Licença/Alvará"
                  />
                  {customErrors.license && (
                    <Text className="text-xs text-red-500">
                      {customErrors.license}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="nuel"
              render={({ field: { onChange, value, onBlur } }) => (
                <View>
                  <CustomTextInput
                    label="Número Único de Entidade Legal"
                    value={value ?? ""}
                    keyboardType="numeric"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="NUEL"
                  />
                  {customErrors.nuel && (
                    <Text className="text-xs text-red-500">
                      {customErrors.nuel}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="nuit"
              render={({ field: { onChange, value, onBlur } }) => (
                <View>
                  <CustomTextInput
                    label="NUIT"
                    value={value ?? ""}
                    keyboardType="numeric"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="NUIT"
                  />
                  {customErrors.nuit && (
                    <Text className="text-xs text-red-500">
                      {customErrors.nuit}
                    </Text>
                  )}
                </View>
              )}
            />
          </>
        )}
      </View>
    </SegmentModalLayout>
  );
}
