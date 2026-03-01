import ErrorAlert from "@/components/alerts/error-alert";
import HeroCard from "@/components/hero-card";
import CustomSafeAreaView from "@/components/layouts/safe-area-view";
import Spinner from "@/components/loaders/spinner";
import { AUTH_CODES } from "@/data/auth-codes";
import LogInForm from "@/features/auth/login-form";
import { useUserSession } from "@/hooks/queries";
import { userSignIn } from "@/library/supabase/user-auth";
import { useAuthStore } from "@/store/auth";
import { Href, Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function Login() {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const [isPopulating, setIsPopulating] = useState(false);
  const { setCurrentEmail } = useAuthStore();
  const { session, isLoading, isError } = useUserSession();

  useEffect(() => {
    const populateData = async () => {
      setIsPopulating(true);
      // await populateCountries()
      // await populateProvinces()
      // await populateDistricts()
      // await populateAdminPosts()
      // await populateVillages()
      // setIsPopulating(false)
      // const provinces = await selectProvinces()
      // console.log('Provinces', provinces)
      setIsPopulating(false);
    };
    populateData();
  }, []);

  const performLogin = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    setCurrentEmail(email);
    try {
      const { success, message, session, code } = await userSignIn(
        email,
        password,
      );

      if (code === AUTH_CODES.EMAIL_NOT_CONFIRMED) {
        router.push("/(auth)/pending-email-verification");
        return;
      }

      if (code === AUTH_CODES.INVALID_CREDENTIALS) {
        setHasError(true);
        setErrorMessage(message);
        return;
      }

      if (code === AUTH_CODES.USER_DETAILS_STATUS.UNAUTHORIZED) {
        router.push("/(auth)/pending-user-authorization" as Href);
        return;
      }

      if (code === AUTH_CODES.USER_DETAILS_STATUS.BLOCKED) {
        setHasError(true);
        setErrorMessage(message);
        return;
      }

      if (code === AUTH_CODES.USER_DETAILS_STATUS.BANNED) {
        setHasError(true);
        setErrorMessage(message);
        return;
      }
      if (code === AUTH_CODES.USER_DETAILS_STATUS.EMAIL_PENDING_VERIFICATION) {
        router.push("/(auth)/pending-email-verification" as Href);
        return;
      }
      if (
        code === AUTH_CODES.USER_DETAILS_STATUS.AUTHORIZED ||
        code === AUTH_CODES.SUCCESS
      ) {
        router.push("/(tabs)" as Href);
        return;
      }
      return;
    } catch (error) {
      const message = "Email ou senha inválidos";
      setHasError(true);
      setErrorMessage(message);
      return;
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (session && !isLoading) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <CustomSafeAreaView>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            padding: 16,
            paddingBottom: 120,
          }}
        >
          <View className="flex-1 justify-center items-center space-y-2">
            <HeroCard title="MyCoop" description="" />
            <Text className="text-[#008000] font-bold text-2xl text-center tracking-wide">
              MyCoop
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-sm text-center">
              Faça login para continuar
            </Text>
          </View>
          <View className="flex-1 justify-center">
            <LogInForm performLogin={performLogin} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <ErrorAlert
        visible={hasError}
        setVisible={setHasError}
        message={errorMessage}
        setMessage={setErrorMessage}
        title="Erro ao fazer login"
      />
    </CustomSafeAreaView>
  );
}
