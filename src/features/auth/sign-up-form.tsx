// React and React Native
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

// Third Party Libraries
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

// Components

// Constants and Types
import { colors } from "@/constants/colors";
import { userRoles } from "@/constants/roles";
import { UserRoles } from "@/types";

// Supabase functions
import {
  selectDistrictsByProvinceId,
  selectProvinces,
} from "@/library/supabase/queries";

import ErrorAlert from "@/components/alerts/error-alert";
import SubmitButton from "@/components/buttons/submit-button";
import { CustomPicker } from "@/components/form-items/custom-picker";
import CustomTextInput from "@/components/form-items/custom-text-input";
import FormItemDescription from "@/components/form-items/form-item-description";
import { AUTH_CODES } from "@/data/auth-codes";
import { capitalize } from "@/helpers/capitalize";
import { userSignUp } from "@/library/supabase/user-auth";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "expo-router";
const UserSchema = z
  .object({
    // enforce full name
    name: z
      .string()
      .trim()
      .min(3, "Digite o seu nome completo.")
      .refine((value) => value.includes(" "), {
        message: "Por favor, insira o nome completo.",
      }),
    phone: z.string().regex(/^(84|86|87|85|82|83)\d{7}$/, {
      message: "Número de telefone válido",
    }),
    role: z.string().min(2, {
      message: "Seleccione o perfil",
    }),

    email: z.email({
      message: "Email inválido",
    }),
    password: z
      .string()
      .min(6, {
        message: "No mínimo 6 caracteres",
      })
      .max(20, {
        message: "No máximo 20 caracteres",
      }),
    passwordConfirm: z
      .string()
      .min(6, {
        message: "No mínimo 6 caracteres",
      })
      .max(20, {
        message: "No máximo 20 caracteres",
      }),
    provinceId: z.string().min(2, {
      message: "Seleccione a província",
    }),
    districtId: z.string().min(2, {
      message: "Seleccione o distrito",
    }),
  })
  .refine((data) => data.passwordConfirm === data.password, {
    message: "As senhas não coincidem",
    path: ["passwordConfirm"],
  });

type UserFormData = z.infer<typeof UserSchema>;

const roles = userRoles.map((role) => {
  if (role === UserRoles.COOP_ADMIN) {
    return { label: "Gestor de Cooperativa", value: role };
  } else {
    return { label: "Oficial Distrital", value: role };
  }
});

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [provinces, setProvinces] = useState<
    { label: string; value: string }[]
  >([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
  const [districts, setDistricts] = useState<
    { label: string; value: string; province_id: string }[]
  >([]);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const { setCurrentEmail } = useAuthStore();

  const router = useRouter();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      passwordConfirm: "",
      role: "",
      provinceId: "",
      districtId: "",
    },
  });

  // Fetch provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setIsLoadingProvinces(true);
        const result = await selectProvinces();
        if (result.success) {
          setProvinces(result.data);
        } else {
          console.error("Failed to fetch provinces:", result.message);
        }
      } catch (error) {
        console.error("Error fetching provinces:", error);
      } finally {
        setIsLoadingProvinces(false);
      }
    };

    fetchProvinces();
  }, []);

  // Function to fetch districts when province changes
  const fetchDistrictsByProvince = async (provinceId: string) => {
    if (!provinceId) {
      setDistricts([]);
      return;
    }

    try {
      setIsLoadingDistricts(true);
      const result = await selectDistrictsByProvinceId(provinceId);
      if (result.success) {
        setDistricts(result.data);
      } else {
        console.error("Failed to fetch districts:", result.message);
        setDistricts([]);
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
      setDistricts([]);
    } finally {
      setIsLoadingDistricts(false);
    }
  };

  async function supabaseSignUpWithEmail(
    email: string,
    password: string,
    phone: string,
    name: string,
    role: string,
    district_id: string,
    province_id: string,
  ) {
    try {
      setCurrentEmail(email);
      const { message, code } = await userSignUp(email, password, {
        full_name: capitalize(name),
        phone,
        user_role: role,
        district_id,
        province_id,
      });

      if (
        code === AUTH_CODES.EMAIL_NOT_CONFIRMED ||
        code === AUTH_CODES.SUCCESS
      ) {
        router.push("/(auth)/pending-email-verification");
        return;
      } else if (code === AUTH_CODES.USER_DETAILS_STATUS.UNAUTHORIZED) {
        router.push("/(auth)/pending-user-authorization");
        return;
      } else {
        setHasError(true);
        setErrorMessage(message);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.log("Error", error);
      setHasError(true);
      setErrorMessage(
        "Não foi possível concluir o processo de criação de conta. Tente mais tarde!",
      );
      setIsLoading(false);
      return;
    }
  }

  const onSubmit = async (data: UserFormData) => {
    setIsLoading(true);
    if (!data.provinceId || !data.districtId) {
      setHasError(true);
      setErrorMessage("Por favor, selecione uma província e um distrito.");
      return;
    }
    await supabaseSignUpWithEmail(
      data.email.trim().toLowerCase(),
      data.password,
      data.phone,
      data.name,
      data.role,
      data.districtId,
      data.provinceId,
    );
    setIsLoading(false);
  };

  const navigateToLogin = () => {
    router.push("/(auth)/login");
  };

  return (
    <View className="pt-4">
      <View className="gap-4">
        {/* Full Name */}
        <View>
          <Controller
            control={control}
            name="name"
            rules={{ required: "Digite o seu nome." }}
            render={({
              field: { onChange, value, onBlur },
              fieldState: { error },
            }) => (
              <>
                <CustomTextInput
                  label=""
                  editable={!isLoading}
                  placeholder="Nome completo"
                  keyboardType="default"
                  autoCapitalize="words"
                  autoComplete="name"
                  textContentType="name"
                  onChangeText={onChange}
                  value={value}
                />
                {error ? (
                  <Text className="text-xs text-red-500">{error.message}</Text>
                ) : (
                  <FormItemDescription description="Nome completo" />
                )}
              </>
            )}
          />
        </View>

        {/* Email */}
        <View>
          <Controller
            control={control}
            name="email"
            rules={{ required: "Digite o seu endereço email." }}
            render={({
              field: { onChange, value, onBlur },
              fieldState: { error },
            }) => (
              <>
                <CustomTextInput
                  label=""
                  editable={!isLoading}
                  placeholder="Endereço email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  onChangeText={onChange}
                  value={value}
                />
                {error ? (
                  <Text className="text-xs text-red-500">{error.message}</Text>
                ) : (
                  <FormItemDescription description="Endereço email" />
                )}
              </>
            )}
          />
        </View>

        {/* Password & Password Confirm */}
        {/* <View className="flex flex-col space-y-6"> */}
        {/* Password */}
        <View className="relative">
          <Controller
            control={control}
            name="password"
            rules={{ required: "Senha" }}
            render={({
              field: { onChange, value, onBlur },
              fieldState: { error },
            }) => (
              <>
                <View className="relative">
                  <CustomTextInput
                    label=""
                    editable={!isLoading}
                    placeholder="Senha"
                    textContentType="password"
                    secureTextEntry={!isPasswordVisible}
                    value={value}
                    onChangeText={onChange}
                  />
                  <View className="absolute right-3 top-0 bottom-0 justify-center">
                    {isPasswordVisible ? (
                      <Ionicons
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        color={colors.gray600}
                        name="eye-outline"
                        size={24}
                      />
                    ) : (
                      <Ionicons
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        color={colors.gray600}
                        name="eye-off-outline"
                        size={24}
                      />
                    )}
                  </View>
                </View>
                {error ? (
                  <Text className="text-xs text-red-500 mt-1">
                    {error.message}
                  </Text>
                ) : (
                  <FormItemDescription description="Senha" />
                )}
              </>
            )}
          />
        </View>

        {/* Password Confirm*/}
        <View className="relative">
          <Controller
            control={control}
            name="passwordConfirm"
            rules={{ required: "Senha" }}
            render={({
              field: { onChange, value, onBlur },
              fieldState: { error },
            }) => (
              <>
                <View className="relative">
                  <CustomTextInput
                    label=""
                    editable={!isLoading}
                    placeholder="Senha"
                    textContentType="password"
                    secureTextEntry={!isConfirmPasswordVisible}
                    value={value}
                    onChangeText={onChange}
                  />
                  <View className="absolute right-3 top-0 bottom-0 justify-center">
                    {isConfirmPasswordVisible ? (
                      <Ionicons
                        onPress={() =>
                          setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                        }
                        name="eye-outline"
                        color={colors.gray600}
                        size={24}
                      />
                    ) : (
                      <Ionicons
                        onPress={() =>
                          setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                        }
                        name="eye-off-outline"
                        color={colors.gray600}
                        size={24}
                      />
                    )}
                  </View>
                </View>
                {error ? (
                  <Text className="text-xs text-red-500 mt-1">
                    {error.message}
                  </Text>
                ) : (
                  <FormItemDescription description="Confirme a senha" />
                )}
              </>
            )}
          />
        </View>
        {/* </View> */}

        {/* Phone Number */}
        <View>
          <Controller
            control={control}
            name="phone"
            rules={{ required: "Número de telefone." }}
            render={({
              field: { onChange, value, onBlur },
              fieldState: { error },
            }) => (
              <>
                <CustomTextInput
                  label=""
                  editable={!isLoading}
                  placeholder="Número de telefone"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                  onChangeText={onChange}
                  value={value}
                />
                {error ? (
                  <Text className="text-xs text-red-500">{error.message}</Text>
                ) : (
                  <FormItemDescription description="Número de telefone" />
                )}
              </>
            )}
          />
        </View>

        {/* Role */}
        <View className="">
          <Controller
            control={control}
            name="role"
            rules={{ required: "Perfil de Usuário" }}
            render={({
              field: { onChange, value, onBlur },
              fieldState: { error },
            }) => (
              <>
                <CustomPicker
                  value={value || ""}
                  placeholder={{ label: "Perfil de Usuário", value: null }}
                  setValue={onChange}
                  items={roles}
                />
                {error ? (
                  <Text className="text-xs text-red-500">{error.message}</Text>
                ) : (
                  <FormItemDescription description="Perfil de usuário" />
                )}
              </>
            )}
          />
        </View>

        {/* Province & Distrito*/}
        <View className="flex flex-row gap-x-2">
          {/* Province */}
          <View className="flex-1">
            <Controller
              name="provinceId"
              control={control}
              rules={{ required: true }}
              render={({
                field: { onChange, value, onBlur },
                fieldState: { error },
              }) => (
                <>
                  <CustomPicker
                    value={value || ""}
                    placeholder={{
                      label: isLoadingProvinces
                        ? "Carregando províncias..."
                        : "Província",
                      value: null,
                    }}
                    setValue={(value) => {
                      onChange(value);
                      // Fetch districts for the selected province
                      fetchDistrictsByProvince(value);
                      // Clear district selection when province changes
                      setValue("districtId", "");
                    }}
                    items={provinces}
                  />
                  {error ? (
                    <Text className="text-xs text-red-500">
                      {error.message}
                    </Text>
                  ) : (
                    <FormItemDescription description="Província" />
                  )}
                </>
              )}
            />
          </View>

          {/* District */}
          <View className="flex-1">
            <Controller
              control={control}
              name="districtId"
              rules={{ required: true }}
              render={({
                field: { onChange, value, onBlur },
                fieldState: { error },
              }) => (
                <>
                  <CustomPicker
                    value={value || ""}
                    placeholder={{
                      label: !value
                        ? "Distrito"
                        : isLoadingDistricts
                          ? "Carregando distritos..."
                          : "Distrito",
                      value: null,
                    }}
                    setValue={(value) => {
                      onChange(value);
                    }}
                    items={districts}
                  />
                  {error ? (
                    <Text className="text-xs text-red-500">
                      {error.message}
                    </Text>
                  ) : (
                    <FormItemDescription description="Distrito" />
                  )}
                </>
              )}
            />
          </View>
        </View>
      </View>
      <View className="pt-7.5">
        <SubmitButton
          isSubmitting={isLoading}
          disabled={isLoading}
          title={!isLoading ? "Criar Conta" : "Processando..."}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
      {/* Already have an account? */}
      <Pressable
        onPress={navigateToLogin}
        className="py-3 flex flex-row gap-x-2 justify-center "
      >
        <Text className="text-[14px] text-gray-600 text-center dark:text-gray-400">
          Já tem conta?
        </Text>
        <Text className="text-[14px] font-bold text-[#008000] text-center underline">
          Entrar
        </Text>
      </Pressable>
      <ErrorAlert
        visible={hasError}
        setVisible={setHasError}
        message={errorMessage}
        setMessage={setErrorMessage}
        title="Erro"
      />
    </View>
  );
}
