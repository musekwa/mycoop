import { colors } from "@/constants/colors";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { useColorScheme } from "react-native";

export default function TradesLayout() {
  const isDark = useColorScheme() === "dark";
  return (
    <>
      <Stack
        screenOptions={{
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: isDark ? colors.lightblack : colors.white,
          },
          headerTintColor: isDark ? colors.white : colors.black,
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 14,
          },
          headerShadowVisible: false,
          animationTypeForReplace: "push",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="aggregation-points" />
        <Stack.Screen name="groups" />
        <Stack.Screen name="plots" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
