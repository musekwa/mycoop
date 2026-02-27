import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, useColorScheme } from "react-native";

type BackButtonProps = {
  route?: Href;
  callback?: () => void;
};

export default function BackButton({ route, callback }: BackButtonProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        if (callback) callback();
        if (route) router.navigate(route);
        else router.back();
      }}
      style={{ marginRight: 10 }}
    >
      <Ionicons
        name="arrow-back"
        size={24}
        color={colorScheme === "dark" ? colors.white : colors.black}
      />
    </TouchableOpacity>
  );
}
