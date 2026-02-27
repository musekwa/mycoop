import { colors } from "@/constants/colors";
import { Stack } from "expo-router";
import React from "react";
import { useColorScheme } from "react-native";

export default function OrganizationsLayout() {
  const isDark = useColorScheme() === "dark";
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
        headerTintColor: isDark ? colors.white : colors.black,
        headerStyle: {
          backgroundColor: isDark ? colors.lightblack : colors.white,
        },
        headerTitleStyle: {
          fontSize: 14,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="[groupId]" options={{ headerShown: true }} />
      <Stack.Screen name="transactions" options={{ headerShown: true }} />
    </Stack>
  );
}
