import { useStyles } from "@/hooks/use-styles";
import { Stack } from "expo-router";
import React from "react";

export default function AuxLayout() {
    const { headerStyle, headerTitleStyle } = useStyles()
  
    const stackHeaderTitleStyle = {
      color: headerTitleStyle.color,
      fontSize: headerTitleStyle.fontSize,
      fontWeight: 'bold' as const,
    }
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="custom-redirect"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="add-employee"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="add-group-manager"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="add-member"
        options={{
          headerShown: true,
          headerShadowVisible: false,
          headerTitle: "Adicionar Membros",
          headerTitleAlign: "center",
          headerTitleStyle: stackHeaderTitleStyle,
          headerStyle: headerStyle,
        }}
      />
    </Stack>
  );
}
