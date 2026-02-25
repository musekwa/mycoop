import CustomSafeAreaView from "@/components/layouts/safe-area-view";
import NoContentPlaceholder from "@/components/no-content-placeholder";
import React from "react";
import Animated, { SlideInDown } from "react-native-reanimated";

export default function FarmerDashboardPage() {
  return (
    <CustomSafeAreaView edges={["bottom"]}>
      <Animated.ScrollView
        entering={SlideInDown.duration(500)}
        className="flex-1 bg-white dark:bg-black"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 16,
        }}
      >
        <NoContentPlaceholder message="Nenhum conteúdo" />
      </Animated.ScrollView>
    </CustomSafeAreaView>
  );
}
