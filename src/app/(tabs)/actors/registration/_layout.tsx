import { colors } from "@/constants/colors";
import { Stack } from "expo-router";
import React from "react";
import { useColorScheme } from "react-native";

export default function RegistrationLayout() {
  const isDark = useColorScheme() === "dark";

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTintColor: isDark ? colors.white : colors.black,
        headerStyle: {
          backgroundColor: isDark ? colors.lightblack : colors.white,
        },
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 14,
        },
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen name="farmer" options={{ headerShown: true }} />
      <Stack.Screen name="cooperative" options={{ headerShown: true }} />
      <Stack.Screen name="association" options={{ headerShown: true }} />
      <Stack.Screen name="coop-union" options={{ headerShown: true }} />
    </Stack>
  );
}
