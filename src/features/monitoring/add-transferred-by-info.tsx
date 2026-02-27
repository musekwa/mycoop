import Label from "@/components/form-items/custom-label";
import CustomTextInput from "@/components/form-items/custom-text-input";
import CustomSelectItem from "@/components/modals/custom-single-selector";
import CustomSelectItemTrigger from "@/components/modals/custom-single-selector-trigger";
import { getTransactedItemPortugueseName } from "@/helpers/trades";
import { ToPortuguese } from "@/helpers/translate";
import { useQueryMany } from "@/hooks/queries";
import { TABLES } from "@/library/powersync/app-schemas";
import {useTransferredByOrgInfoStore } from "@/store/trades";
import { OrganizationTypes } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { z } from "zod";

const TransactionSchema = z
  .object({
    hasTransferred: z.boolean(),
    transfers: z
      .array(
        z.object({
          group_id: z.string(),
          group_name: z.string(),
          organization_type: z.string(),
          quantity: z
            .number()
            .min(0, "A quantidade deve ser maior ou igual a 0 Kg."),
        }),
      )
      .optional(),
  })
  .refine(
    (data: any) => {
      if (
        data.hasTransferred &&
        (!data.transfers || data.transfers.length === 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Indica a quantidade transferida e o armazém de destino.",
      path: ["hasTransferred"],
    },
  );

type TransactionData = z.infer<typeof TransactionSchema>;

type TransferredByOrgInfoProps = {
  organizationId: string;
  customErrors: Record<string, string>;
  setCustomErrors: (customErrors: Record<string, string>) => void;
  itemType: string;
};

export default function AddTransferredByOrgInfo({
  organizationId,
  customErrors,
  setCustomErrors,
  itemType,
}: TransferredByOrgInfoProps) {

  const {
    control,
    handleSubmit,
    formState: {
      errors,
      isValid,
      isDirty,
      isSubmitting,
      isSubmitSuccessful,
      submitCount,
    },
    reset,
    resetField,
    getValues,
    setValue,
    watch,
    setError,
    clearErrors,
  } = useForm<TransactionData>({
    defaultValues: {
      hasTransferred: false,
      transfers: [],
    },
    resolver: zodResolver(TransactionSchema),
  });

  const {
    data: coopUnions,
    isLoading: isCoopUnionsLoading,
    error: coopUnionsError,
    isError: isCoopUnionsError,
  } = useQueryMany<{
    id: string;
    organization_type: string;
    group_name: string;
    address_id: string;
    village: string;
    admin_post: string;
    district: string;
    province: string;
  }>(
    `SELECT
            a.id as id, 
            ac.subcategory as organization_type, 
            ad.other_names as group_name,
            addr.id as address_id,
            v.name as village, 
            ap.name as admin_post, 
            d.name as district, 
            p.name as province
            FROM ${TABLES.ACTORS} a
            INNER JOIN ${TABLES.ACTOR_DETAILS} ad ON ad.actor_id = a.id
            LEFT JOIN ${TABLES.ACTOR_CATEGORIES} ac ON ac.actor_id = a.id AND ac.category = 'GROUP'
            LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = a.id AND addr.owner_type = 'GROUP'
            LEFT JOIN ${TABLES.VILLAGES} v ON addr.village_id = v.id
            LEFT JOIN ${TABLES.ADMIN_POSTS} ap ON addr.admin_post_id = ap.id
            LEFT JOIN ${TABLES.DISTRICTS} d ON addr.district_id = d.id
            LEFT JOIN ${TABLES.PROVINCES} p ON addr.province_id = p.id
            JOIN ${TABLES.GROUP_MEMBERS} gm ON gm.group_id = a.id
            WHERE a.category = 'GROUP' 
            AND ac.subcategory = '${OrganizationTypes.COOP_UNION}'
            AND gm.member_id = '${organizationId}'`,
  );

  const [showCoopUnions, setShowCoopUnions] = useState(false);
  const {
    setTransferredByOrgInfo,
    setHasTransferredByOrg,
    resetTransferredByOrgInfo,
    removeOrganization,
    updateOrganizationQuantity,
  } = useTransferredByOrgInfoStore();

  const hasTransferredValue = watch("hasTransferred");
  const transfersValue = watch("transfers");

  useEffect(() => {
    validateTransferredInfo();
  }, [hasTransferredValue, transfersValue]);

  const validateTransferredInfo = () => {
    const hasTransferred = getValues("hasTransferred");
    const transfers = getValues("transfers");
    setHasTransferredByOrg(hasTransferred);
    if (hasTransferred) {
      if (
        transfers &&
        transfers.length > 0 &&
        transfers.every((w) => w.group_id && w.organization_type)
      ) {
        setTransferredByOrgInfo({
          hasTransferredByOrg: true,
          transfersOrganizations: transfers.map((w) => ({
            group_id: w.group_id,
            group_name: w.group_name,
            organization_type: w.organization_type,
            quantity: w.quantity || 0,
          })),
        });
        setCustomErrors({ ...customErrors, transferredByOrg: "" });
      }
    }
  };

  return (
    <ScrollView className="border border-gray-300 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 my-3">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1">
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            Transferiu {itemType.toLowerCase()} para a união das cooperativas?
          </Text>
        </View>
        <Controller
          control={control}
          name="hasTransferred"
          render={({ field: { onChange, value } }) => (
            <Switch
              value={value}
              onValueChange={(newValue: boolean) => {
                onChange(newValue);
                if (!newValue) {
                  setValue("transfers", []);
                  setCustomErrors({ ...customErrors, transferredByOrg: "" });
                  clearErrors("transfers");
                  resetTransferredByOrgInfo();
                }
              }}
              thumbColor={value ? "#008000" : "#f4f3f4"}
              trackColor={{ false: "#767577", true: "#008000" }}
            />
          )}
        />
      </View>

      {hasTransferredValue && (
        <>
          {/* Selected Transfer Warehouses */}
          {transfersValue?.map((organization, index) => (
            <View
              key={organization.group_id}
              className="mt-4 border-t border-gray-200 pt-4"
            >
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1 mr-2">
                  <Text
                    className="text-gray-600 dark:text-gray-400 text-[12px] font-semibold"
                    numberOfLines={2}
                  >
                    {organization.group_name}{" "}
                    {organization.organization_type
                      ? ToPortuguese.groupType(organization.organization_type)
                      : ""}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    const updatedTransfers = transfersValue.filter(
                      (_, i) => i !== index,
                    );
                    setValue("transfers", updatedTransfers);
                    removeOrganization({ group_id: organization.group_id });
                    setCustomErrors({ ...customErrors, transferredByOrg: "" });
                  }}
                >
                  <Ionicons name="close-circle-outline" size={24} color="red" />
                </TouchableOpacity>
              </View>
              <View className="flex flex-row justify-between space-x-2 items-center mt-2">
                <View className="w-20">
                  <Text className="text-gray-600 dark:text-gray-400 text-[12px]">
                    Quantidade
                  </Text>
                </View>
                <View className="flex-1">
                  <Controller
                    control={control}
                    name={`transfers.${index}.quantity`}
                    rules={{ required: "Quantidade transferida é obrigatória" }}
                    render={({
                      field: { onChange, value, onBlur },
                      fieldState: { error },
                    }) => (
                      <>
                        <View className="relative">
                          <CustomTextInput
                            label=""
                            placeholder="Qtd. em kg"
                            keyboardType="numeric"
                            onChangeText={(text) => {
                              const newQuantity = parseFloat(text) || 0;
                              onChange(newQuantity);
                              updateOrganizationQuantity({
                                group_id: organization.group_id,
                                quantity: newQuantity,
                              });
                              setCustomErrors({
                                ...customErrors,
                                transferredByOrg: "",
                              });
                            }}
                            value={value && value > 0 ? value.toString() : ""}
                            onBlur={onBlur}
                          />
                          <View className="absolute right-2 top-0 bottom-0 flex items-center justify-center">
                            <Text className="text-gray-600 dark:text-gray-400 text-[14px]">
                              Kg
                            </Text>
                          </View>
                        </View>
                        <Text className={`text-[12px] italic text-gray-500`}>
                          Qtd. transferida
                        </Text>
                      </>
                    )}
                  />
                </View>
              </View>
            </View>
          ))}

          {/* Warehouse Selection */}
          <View className="mt-4">
            <Label label="União das cooperativas de destino" />
            <CustomSelectItemTrigger
              selectedItem={"Seleccione a união das cooperativas de destino"}
              setShowItems={setShowCoopUnions}
              hasSelectedItem={false}
              resetItem={() => {}}
            />
            <CustomSelectItem
              label="Seleccione a união das cooperativas de destino"
              showModal={showCoopUnions}
              setShowModal={setShowCoopUnions}
              itemsList={coopUnions
                .filter(
                  (cu) => !transfersValue?.some((it) => it.group_id === cu.id),
                )
                .map((cu) => ({
                  label: `${cu.group_name ?? ""} ${cu.organization_type ? ToPortuguese.groupType(cu.organization_type) : ""}`,
                  value: cu.id,
                  icon: "",
                }))}
              setValue={(coopUnionId) => {
                if (coopUnionId) {
                  const coopUnion = coopUnions.find(
                    (w) => w.id === coopUnionId,
                  );
                  if (coopUnion) {
                    const location =
                      coopUnion.village && coopUnion.village !== "N/A"
                        ? coopUnion.village
                        : coopUnion.admin_post !== "N/A"
                          ? coopUnion.admin_post
                          : coopUnion.district !== "N/A"
                            ? coopUnion.district
                            : coopUnion.province !== "N/A"
                              ? coopUnion.province
                              : "N/A";

                    const newGroup = {
                      group_id: coopUnion.id,
                      group_name: `${coopUnion.group_name ?? ""}`,
                      organization_type: coopUnion.organization_type || "N/A",
                      quantity: 0,
                    };

                    setValue("transfers", [
                      ...(transfersValue || []),
                      newGroup,
                    ]);
                  }
                }
              }}
            />
            <Text className="text-gray-500 dark:text-gray-400 text-[12px] italic mb-2">
              União das cooperativas de destino
            </Text>
          </View>
        </>
      )}

      {hasTransferredValue && customErrors.transferredByOrg ? (
        <Text className="text-xs text-red-500 mt-2">
          {customErrors.transferredByOrg}
        </Text>
      ) : null}
    </ScrollView>
  );
}
