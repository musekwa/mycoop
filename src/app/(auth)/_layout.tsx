import { colors } from "@/constants/colors";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

export default function AuthLayout() {
  const isDark = useColorScheme() === "dark";

  const headerStyle = {
    backgroundColor: isDark ? colors.black : colors.white,
  };
  const headerTintColor = isDark ? colors.white : colors.black;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle,
        headerTintColor,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen
        name="sign-up"
        options={{
          headerShown: true,
          headerTitle: "",
          headerBackVisible: true,
          headerTransparent: false,
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="pending-user-authorization"
        options={{
          headerShown: true,
          headerTitle: "",
          headerBackVisible: false,
          headerTransparent: false,
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="pending-email-verification"
        options={{
          headerShown: true,
          headerTitle: "",
          headerBackVisible: true,
          headerTransparent: false,
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen name="banned-user" options={{ headerShown: false }} />
      <Stack.Screen
        name="reset-password"
        options={{
          headerShown: true,
          headerTitle: "",
          headerBackVisible: true,
          headerTransparent: false,
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          headerShown: true,
          headerTitle: "",
          headerTitleAlign: "center",
          headerBackVisible: true,
          headerTransparent: false,
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="pending-password-reset"
        options={{
          headerShown: true,
          headerBackVisible: true,
          headerTitle: "",
          headerTitleAlign: "center",
          headerLargeTitle: false,
        }}
      />
    </Stack>
  );
}
