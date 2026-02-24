import FormItemDescription from "@/components/form-items/form-item-description";
import { useAddressStore } from "@/store/address";
import { AddressLevel, LocationType } from "@/types";
import React, { useEffect, useRef } from "react";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";
import Label from "./custom-label";
import PickLocationName from "./pick-location-name";

type Props = {
  control: Control<any>;
  errors: FieldErrors<any>;
  customErrors: any;
  clearFieldError: (name: string) => void;
  districtId?: string;
  adminPostId?: string;
  addressLevel: AddressLevel;
  description: string;
};
export default function PickAddress({
  control,
  errors,
  customErrors,
  clearFieldError,
  districtId,
  adminPostId,
  addressLevel,
  description,
}: Props) {
  if (addressLevel === AddressLevel.FROM_PROVINCES) {
    return (
      <FromProvinces
        control={control}
        errors={errors}
        customErrors={customErrors}
        clearFieldError={clearFieldError}
        description={description}
        addressLevel={addressLevel}
      />
    );
  }

  if (addressLevel === AddressLevel.FROM_ADMIN_POSTS) {
    return (
      <FromAdminPosts
        control={control}
        errors={errors}
        customErrors={customErrors}
        clearFieldError={clearFieldError}
        districtId={districtId}
        adminPostId={adminPostId}
        addressLevel={addressLevel}
        description={description}
      />
    );
  }

  if (addressLevel === AddressLevel.FROM_COUNTRIES) {
    return (
      <FromCountries
        control={control}
        errors={errors}
        customErrors={customErrors}
        clearFieldError={clearFieldError}
        description={description}
        addressLevel={addressLevel}
      />
    );
  }
}

export function FromAdminPosts({
  control,
  customErrors,
  districtId,
  description,
}: Props) {
  const {
    partialAddress,
    setPartialAdminPostId,
    setPartialVillageId,
    resetPartialVillageId,
  } = useAddressStore();
  const safePartialAddress = partialAddress ?? {
    adminPostId: null,
    villageId: null,
  };
  const safeDistrictId =
    districtId && typeof districtId === "string" ? districtId.trim() : "";

  return (
    <View className="w-full space-y-4">
      <FormItemDescription description={description} />
      <View className="gap-4">
        <View className="">
          <Label label="Posto Administrativo" />
          <Controller
            name="adminPostId"
            control={control}
            rules={{ required: true }}
            render={({
              field: { onChange, value, onBlur },
              fieldState: { error },
            }) => (
              <View>
                <PickLocationName
                  currentValue={safePartialAddress.adminPostId ?? ""}
                  onChange={(val) => {
                    onChange(val ?? "");
                    setPartialAdminPostId(val ?? "");
                    resetPartialVillageId();
                    // clearFieldError('adminPostId')
                  }}
                  placeholder="Posto Administrativo"
                  valueName="adminPostId"
                  locationType={LocationType.ADMIN_POST}
                  referenceId={
                    safeDistrictId !== "" ? safeDistrictId : undefined
                  }
                />

                {error ? (
                  <Text className="text-xs text-red-500">{error.message}</Text>
                ) : customErrors?.adminPostId ? (
                  <Text className="text-xs text-red-500">
                    {customErrors.adminPostId}
                  </Text>
                ) : (
                  <Text className={`text-xs text-gray-500`}>
                    Posto administrativo
                  </Text>
                )}
              </View>
            )}
          />
        </View>

        <View className="">
          <Label label="Localidade" />
          <Controller
            control={control}
            name="villageId"
            rules={{ required: true }}
            render={({
              field: { onChange, value, onBlur },
              fieldState: { error },
            }) => (
              <View>
                <PickLocationName
                  currentValue={safePartialAddress.villageId ?? ""}
                  onChange={(val) => {
                    onChange(val ?? "");
                    setPartialVillageId(val ?? "");
                    // clearFieldError('villageId')
                  }}
                  placeholder="Localidade"
                  valueName="villageId"
                  locationType={LocationType.VILLAGE}
                  referenceId={
                    safePartialAddress.adminPostId &&
                    typeof safePartialAddress.adminPostId === "string" &&
                    safePartialAddress.adminPostId.trim() !== ""
                      ? safePartialAddress.adminPostId
                      : undefined
                  }
                />
                {error ? (
                  <Text className="text-xs text-red-500">{error.message}</Text>
                ) : customErrors?.villageId ? (
                  <Text className="text-xs text-red-500">
                    {customErrors.villageId}
                  </Text>
                ) : (
                  <Text className={`text-xs text-gray-500`}>Localidade</Text>
                )}
              </View>
            )}
          />
        </View>
      </View>
    </View>
  );
}

export function FromProvinces({
  control,
  errors,
  customErrors,
  clearFieldError,
  description,
}: Props) {
  const {
    fullAddress,
    setFullProvinceId,
    setFullDistrictId,
    setFullAdminPostId,
    setFullVillageId,
    resetFullDistrictId,
    resetFullAdminPostId,
    resetFullVillageId,
  } = useAddressStore();

  // Defensive: ensure fullAddress is always an object to prevent crashes during collection
  const safeFullAddress = fullAddress ?? {
    provinceId: null,
    districtId: null,
    adminPostId: null,
    villageId: null,
  };

  const prevProvinceIdRef = useRef<string | null>(null);
  const prevDistrictIdRef = useRef<string | null>(null);

  // Reset dependent fields only when parent actually changes
  useEffect(() => {
    const currentProvinceId = safeFullAddress.provinceId;
    const prevProvinceId = prevProvinceIdRef.current;
    prevProvinceIdRef.current = currentProvinceId;

    if (
      currentProvinceId &&
      prevProvinceId &&
      currentProvinceId !== prevProvinceId
    ) {
      resetFullDistrictId();
      resetFullAdminPostId();
      resetFullVillageId();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeFullAddress.provinceId]);

  useEffect(() => {
    const currentDistrictId = safeFullAddress.districtId;
    const prevDistrictId = prevDistrictIdRef.current;
    prevDistrictIdRef.current = currentDistrictId;

    if (
      currentDistrictId &&
      prevDistrictId &&
      currentDistrictId !== prevDistrictId
    ) {
      resetFullAdminPostId();
      resetFullVillageId();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeFullAddress.districtId]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
      className="w-full gap-y-4"
    >
      <FormItemDescription description={description} />
      <View className="gap-4">
        <View className="">
          <Label label="Província" />
          <Controller
            name="provinceId"
            control={control}
            rules={{ required: true }}
            render={({
              field: { onChange, value, onBlur },
              fieldState: { error },
            }) => (
              <View>
                <PickLocationName
                  currentValue={safeFullAddress.provinceId ?? ""}
                  onChange={(val) => {
                    onChange(val ?? "");
                    setFullProvinceId(val ?? "");
                  }}
                  placeholder="Província"
                  valueName="provinceId"
                  locationType={LocationType.PROVINCE}
                  // referenceId={countryId || ''}
                />

                {error ? (
                  <Text className="text-xs text-red-500">{error.message}</Text>
                ) : customErrors?.provinceId ? (
                  <Text className="text-xs text-red-500">
                    {customErrors.provinceId}
                  </Text>
                ) : (
                  <Text className={`text-xs text-gray-500`}>Província</Text>
                )}
              </View>
            )}
          />
        </View>

        <View className="">
          <Label label="Distrito" />
          <Controller
            name="districtId"
            control={control}
            rules={{ required: true }}
            render={({
              field: { onChange, value, onBlur },
              fieldState: { error },
            }) => (
              <View>
                <PickLocationName
                  currentValue={safeFullAddress.districtId ?? ""}
                  onChange={(val) => {
                    onChange(val ?? "");
                    setFullDistrictId(val ?? "");
                  }}
                  placeholder="Distrito"
                  valueName="districtId"
                  locationType={LocationType.DISTRICT}
                  referenceId={
                    safeFullAddress.provinceId &&
                    typeof safeFullAddress.provinceId === "string" &&
                    safeFullAddress.provinceId.trim() !== ""
                      ? safeFullAddress.provinceId
                      : undefined
                  }
                />

                {error ? (
                  <Text className="text-xs text-red-500">{error.message}</Text>
                ) : customErrors?.districtId ? (
                  <Text className="text-xs text-red-500">
                    {customErrors.districtId}
                  </Text>
                ) : (
                  <Text className={`text-xs text-gray-500`}>Distrito</Text>
                )}
              </View>
            )}
          />
        </View>

        <View className="">
          <Label label="Posto Administrativo" />
          <Controller
            name="adminPostId"
            control={control}
            rules={{ required: true }}
            render={({
              field: { onChange, value, onBlur },
              fieldState: { error },
            }) => (
              <View>
                <PickLocationName
                  currentValue={safeFullAddress.adminPostId ?? ""}
                  onChange={(val) => {
                    onChange(val ?? "");
                    setFullAdminPostId(val ?? "");
                  }}
                  placeholder="Posto Administrativo"
                  valueName="adminPostId"
                  locationType={LocationType.ADMIN_POST}
                  referenceId={
                    safeFullAddress.districtId &&
                    typeof safeFullAddress.districtId === "string" &&
                    safeFullAddress.districtId.trim() !== ""
                      ? safeFullAddress.districtId
                      : undefined
                  }
                />

                {error ? (
                  <Text className="text-xs text-red-500">{error.message}</Text>
                ) : customErrors?.adminPostId ? (
                  <Text className="text-xs text-red-500">
                    {customErrors.adminPostId}
                  </Text>
                ) : (
                  <Text className={`text-xs text-gray-500`}>
                    Posto administrativo
                  </Text>
                )}
              </View>
            )}
          />
        </View>

        <View className="">
          <Label label="Localidade" />
          <Controller
            control={control}
            name="villageId"
            rules={{ required: true }}
            render={({
              field: { onChange, value, onBlur },
              fieldState: { error },
            }) => (
              <View>
                <PickLocationName
                  currentValue={safeFullAddress.villageId ?? ""}
                  onChange={(val) => {
                    onChange(val ?? "");
                    setFullVillageId(val ?? "");
                  }}
                  placeholder="Localidade"
                  valueName="villageId"
                  locationType={LocationType.VILLAGE}
                  referenceId={
                    safeFullAddress.adminPostId &&
                    typeof safeFullAddress.adminPostId === "string" &&
                    safeFullAddress.adminPostId.trim() !== ""
                      ? safeFullAddress.adminPostId
                      : undefined
                  }
                />
                {error ? (
                  <Text className="text-xs text-red-500">{error.message}</Text>
                ) : customErrors?.villageId ? (
                  <Text className="text-xs text-red-500">
                    {customErrors.villageId}
                  </Text>
                ) : (
                  <Text className={`text-xs text-gray-500`}>Localidade</Text>
                )}
              </View>
            )}
          />
        </View>
      </View>
    </ScrollView>
  );
}

export function FromCountries({ control, description }: Props) {
  const { setCountryId, countryId } = useAddressStore();
  return (
    <View className="w-full space-y-4">
      <FormItemDescription description={description} />
      <View className="gap-4">
        <View className="">
          <Label label="País" />
          <Controller
            name="countryId"
            control={control}
            rules={{ required: true }}
            render={({
              field: { onChange, value, onBlur },
              fieldState: { error },
            }) => (
              <View>
                <PickLocationName
                  currentValue={countryId || ""}
                  onChange={(val) => {
                    onChange(val);
                    setCountryId(val);
                  }}
                  placeholder="País"
                  valueName="countryId"
                  locationType={LocationType.COUNTRY}
                  // referenceId={countryId || ''}
                />
              </View>
            )}
          />
        </View>
      </View>
    </View>
  );
}
