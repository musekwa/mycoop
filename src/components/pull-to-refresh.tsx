import React from "react";
import { RefreshControl, ScrollView, useColorScheme } from "react-native";

import { colors } from "@/constants/colors";

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => void;
  refreshing: boolean;
}

const PullToRefresh = ({
  children,
  onRefresh,
  refreshing,
}: PullToRefreshProps) => {
  const isDarkMode = useColorScheme() === "dark";

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
          progressBackgroundColor={isDarkMode ? "#1F2937" : "#F3F4F6"}
          style={{
            backgroundColor: isDarkMode ? "#1F2937" : "#F3F4F6",
          }}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
};

export default PullToRefresh;
