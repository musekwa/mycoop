import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";
import "react-native-get-random-values";
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";
import { z } from "zod";

import { errorMessages } from "@/constants/error-messages";

import SubmitButton from "@/components/buttons/submit-button";
import CustomTextInput from "@/components/form-items/custom-text-input";

import ErrorAlert from "@/components/alerts/error-alert";
import SuccessAlert from "@/components/alerts/success-alert";
import {
  useQueryManyAndWatchChanges,
  useQueryOne,
  useUserDetails,
} from "@/hooks/queries";
import { TABLES } from "@/library/powersync/app-schemas";
import {
  insertActor,
  insertActorDetails,
  insertAddressDetail,
  insertContactDetail,
  insertGroupManagerAssignment,
} from "@/library/powersync/sql-statements";
import { useActionStore } from "@/store/actions/actions";

import Label from "@/components/form-items/custom-label";
import { CustomPicker } from "@/components/form-items/custom-picker";
import FormItemDescription from "@/components/form-items/form-item-description";
import { groupManagerPositions } from "@/constants/roles";
import { buildActorDetails } from "@/library/powersync/schemas/actor-details";
import { buildActor } from "@/library/powersync/schemas/actors";
import { buildAddressDetail } from "@/library/powersync/schemas/address-details";
import { buildContactDetail } from "@/library/powersync/schemas/contact-details";
import { buildGroupManagerAssignment } from "@/library/powersync/schemas/group-manager-assignments";

// Define the schema for worker form data validation
const GroupManagerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Digite o seu nome completo.")
    .refine((value) => value.includes(" "), {
      message: "Por favor, insira o nome completo.",
    }),
  position: z.string().trim().min(2, "Indica a função que desempenha."),
  phone: z
    .union([
      z.literal(""),
      z.string().regex(/^(84|86|87|85|82|83)\d{7}$/, {
        message: "Indica número válido",
      }),
    ])
    .transform((val) => (val === "" ? "" : val)),
  organizationId: z.string().optional(),
});

type GroupManagerFormData = z.infer<typeof GroupManagerSchema>;

export default function AddGroupManager() {
  const { getCurrentResource } = useActionStore();
  const { userDetails } = useUserDetails();
  const userDistrictId = userDetails?.district_id;
  const { data: existingPositions } = useQueryManyAndWatchChanges<{
    position: string;
  }>(
    `SELECT DISTINCT position
    FROM ${TABLES.GROUP_MANAGER_ASSIGNMENTS}
    WHERE group_id = '${getCurrentResource().id}' AND is_active = 'true'`,
  );

  const availablePositions = useMemo(() => {
    if (!existingPositions || existingPositions.length === 0) {
      return groupManagerPositions;
    }

    const takenPositions = existingPositions.map(
      (ep: { position: string }) => ep.position,
    );
    return groupManagerPositions.filter(
      (item) => !takenPositions.includes(item.value),
    );
  }, [existingPositions, groupManagerPositions]);

  const {
    data: organization,
    // isLoading,
    // isError,
  } = useQueryOne<{
    id: string;
    group_name: string;
    photo: string;
    address_id: string;
    address_village_id: string;
    address_admin_post_id: string;
    address_district_id: string;
    address_province_id: string;
    address_gps_lat: string;
    address_gps_long: string;
  }>(
    `SELECT 
			a.id,
			ad.other_names as group_name,
			ad.photo,
			addr.id as address_id,
			addr.village_id as address_village_id,
			addr.admin_post_id as address_admin_post_id,
			addr.district_id as address_district_id,
			addr.province_id as address_province_id,
			addr.gps_lat as address_gps_lat,
			addr.gps_long as address_gps_long
		FROM ${TABLES.ACTORS} a
		INNER JOIN ${TABLES.ACTOR_DETAILS} ad ON ad.actor_id = a.id
		LEFT JOIN ${TABLES.ADDRESS_DETAILS} addr ON addr.owner_id = a.id AND addr.owner_type = 'GROUP'
		WHERE a.id = ? AND a.category = 'GROUP'`,
    [getCurrentResource().id],
  );

  const {
    control,
    handleSubmit,
    setValue,
    // getValues,
    // watch,
    resetField,
    setError,
    formState: { isDirty, isSubmitting, isSubmitSuccessful },
    reset,
  } = useForm<GroupManagerFormData>({
    defaultValues: {
      name: "",
      position: "",
      phone: "",
      organizationId: "",
    },
    resolver: zodResolver(GroupManagerSchema),
  });

  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (organization?.id) {
      setValue("organizationId", organization.id);
    } else {
      resetField("organizationId");
    }
  }, [organization, resetField, setValue]);

  // Form submission handler
  const onSubmit = async (data: GroupManagerFormData) => {
    const result = GroupManagerSchema.safeParse(data);

    if (result.success) {
      if (!result.data.organizationId) {
        setHasError(true);
        setErrorMessage("Seleccione o grupo onde o gestor está afetado.");
        return;
      }

      try {
        if (organization && userDistrictId) {
          // 1. Create actor record for GROUP_MANAGER (generate ID first)
          const actor_row = buildActor({
            category: "GROUP_MANAGER",
            sync_id: userDistrictId,
          });
          await insertActor(actor_row);

          // 2. Split full_name into surname and other_names
          const nameParts = result.data.name.trim().split(/\s+/);
          const surname =
            nameParts.length > 0
              ? nameParts[nameParts.length - 1]
              : result.data.name;
          const other_names =
            nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : "";

          const actor_detail_row = buildActorDetails({
            actor_id: actor_row.id,
            surname: surname,
            other_names: other_names,
            photo: "",
            sync_id: userDistrictId,
          });
          await insertActorDetails(actor_detail_row);

          const groupManagerAssignment = buildGroupManagerAssignment({
            group_manager_id: actor_row.id,
            group_id: organization.id,
            position: result.data.position || "N/A",
            is_active: "true",
            sync_id: userDistrictId,
          });
          await insertGroupManagerAssignment(groupManagerAssignment);

          // 6. Create contact_detail record
          const contact_detail_row = buildContactDetail({
            owner_id: actor_row.id,
            owner_type: "GROUP_MANAGER",
            primary_phone: result.data.phone || "N/A",
            secondary_phone: result.data.phone || "N/A",
            email: "",
            sync_id: userDistrictId,
          });
          await insertContactDetail(contact_detail_row);

          // 7. Create address_detail record (copying from organization's address)
          if (organization.address_id) {
            const address_detail_row = buildAddressDetail({
              owner_id: actor_row.id,
              owner_type: "GROUP_MANAGER",
              village_id: organization.address_village_id || "N/A",
              admin_post_id: organization.address_admin_post_id || "N/A",
              district_id: organization.address_district_id || "N/A",
              province_id: organization.address_province_id || "N/A",
              gps_lat: organization.address_gps_lat || "0",
              gps_long: organization.address_gps_long || "0",
              sync_id: userDistrictId,
            });
            await insertAddressDetail(address_detail_row);
          }

          setSuccess(true);
          reset();
        }
      } catch (error) {
        console.log(error);
        setHasError(true);
        setErrorMessage(errorMessages.formFields);
      }
    }
  };

  return (
    <>
      <Animated.ScrollView
        entering={SlideInDown.duration(300)}
        exiting={SlideOutDown.duration(300)}
        className="flex-1 bg-white dark:bg-black"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 16,
            flexGrow: 1,
            justifyContent: "center",
          }}
        >
          <FormItemDescription description="Registo do Representante do Grupo" />
          <View className="flex-1 py-6 gap-y-2">
            {/* Name input field */}
            <View className="pt-4">
              <Controller
                control={control}
                name="name"
                defaultValue=""
                rules={{ required: "Nome é obrigatório" }}
                render={({
                  field: { onChange, value, onBlur },
                  fieldState: { error },
                }) => (
                  <View>
                    <CustomTextInput
                      label="Nome do Representante"
                      placeholder="Nome do representante"
                      onChangeText={onChange}
                      value={value}
                      onBlur={onBlur}
                      autoCapitalize="words"
                    />
                    {error ? (
                      <Text className="text-xs text-red-500">
                        {error.message}
                      </Text>
                    ) : null}
                  </View>
                )}
              />
            </View>

            {/* Position input field */}
            <View className="pt-4">
              <Label label="Função" />
              <Controller
                control={control}
                name="position"
                defaultValue=""
                rules={{ required: false }}
                render={({
                  field: { onChange, value, onBlur },
                  fieldState: { error },
                }) => (
                  <View>
                    <CustomPicker
                      items={availablePositions.map((item) => ({
                        label: item.label,
                        value: item.value,
                      }))}
                      setValue={onChange}
                      placeholder={{
                        label:
                          availablePositions.length === 0
                            ? "Sem funções disponíveis"
                            : "Seleccionar função",
                        value: null,
                      }}
                      value={value}
                    />
                    {error ? (
                      <Text className="text-xs text-red-500">
                        {error.message}
                      </Text>
                    ) : null}
                  </View>
                )}
              />
            </View>

            {/* Phone input field */}
            <View className="pt-4">
              <Controller
                control={control}
                name="phone"
                defaultValue=""
                rules={{ required: false }}
                render={({
                  field: { onChange, value, onBlur },
                  fieldState: { error },
                }) => (
                  <View>
                    <CustomTextInput
                      label="Número de telefone"
                      placeholder="Número de telefone"
                      keyboardType="phone-pad"
                      onChangeText={onChange}
                      value={value}
                      onBlur={onBlur}
                    />
                    {error ? (
                      <Text className="text-xs text-red-500">
                        {error.message}
                      </Text>
                    ) : null}
                  </View>
                )}
              />
            </View>

            {/* Submit button */}
            <View className="pt-4">
              <SubmitButton
                title="Gravar"
                disabled={
                  isSubmitting ||
                  (!isDirty && isSubmitSuccessful) ||
                  !organization?.id
                }
                onPress={handleSubmit(onSubmit)}
              />
            </View>
          </View>
          {/* <Toast position="bottom" /> */}
          <ErrorAlert
            visible={hasError}
            setVisible={setHasError}
            title="Erro"
            message={errorMessage}
            setMessage={setErrorMessage}
          />
          <SuccessAlert
            visible={success}
            setVisible={setSuccess}
            route="/(profiles)/group/members-list"
          />
        </ScrollView>
      </Animated.ScrollView>
    </>
  );
}
