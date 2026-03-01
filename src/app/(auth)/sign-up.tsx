import HeroCard from "@/components/hero-card";
import CustomSafeAreaView from "@/components/layouts/safe-area-view";
import SignUpForm from "@/features/auth/sign-up-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function SignUp() {
  return (
    <CustomSafeAreaView edges={["bottom"]}>
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
          className="bg-white dark:bg-black"
        >
          <View className="items-center space-y-2 mb-4">
            <HeroCard title="MyCoop" description="" />
            <Text className="text-[#008000] font-bold text-2xl text-center tracking-wide">
              MyCoop
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-sm text-center">
              Preencha os campos abaixo para criar sua conta
            </Text>
          </View>
          <View className="flex-1 justify-center space-y-3">
            <SignUpForm />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </CustomSafeAreaView>
  );
}
