import HeroCard from "@/components/hero-card";
import CustomSafeAreaView from "@/components/layouts/safe-area-view";
import SignUpForm from "@/features/auth/sign-up-form";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-tools";

export default function SignUp() {
  return (
    <CustomSafeAreaView edges={["bottom"]}>
      <KeyboardAwareScrollView
        automaticallyAdjustContentInsets={true}
        restoreScrollOnKeyboardHide={true}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        contentContainerStyle={{
          flexGrow: 1,
          padding: 16,
          paddingBottom: 40,
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
      </KeyboardAwareScrollView>
    </CustomSafeAreaView>
  );
}
