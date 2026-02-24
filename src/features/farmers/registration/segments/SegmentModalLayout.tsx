import { colors } from "@/constants/colors";
import { Fontisto } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";

type SegmentModalLayoutProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSave: () => void;
  isSaving?: boolean;
  variant?: "bottomSheet" | "inline";
  children: React.ReactNode;
};

export default function SegmentModalLayout({
  visible,
  title,
  onClose,
  onSave,
  isSaving = false,
  variant = "bottomSheet",
  children,
}: SegmentModalLayoutProps) {
  const ref = useRef<BottomSheetModal>(null);
  const isDark = useColorScheme() === "dark";

  if (variant === "inline") {
    if (!visible) return null;
    return (
      <View
        style={{
          backgroundColor: isDark ? colors.gray800 : colors.white,
          borderRadius: 12,
          padding: 16,
          marginTop: 12,
          borderWidth: 1,
          borderColor: isDark ? "#374151" : "#e5e7eb",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 16,
            marginBottom: 8,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? "#374151" : "#e5e7eb",
          }}
        >
          <TouchableOpacity
            onPress={onClose}
            style={{ padding: 8 }}
            activeOpacity={0.7}
          >
            <Fontisto name="close" size={22} color={colors.gray600} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: isDark ? colors.white : colors.black,
              flex: 1,
              textAlign: "center",
            }}
          >
            {title}
          </Text>
          <View style={{ width: 38 }} />
        </View>

        {children}

        <TouchableOpacity
          onPress={onSave}
          disabled={isSaving}
          activeOpacity={0.8}
          style={{
            backgroundColor: colors.primary,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 24,
            marginBottom: 16,
          }}
        >
          <Text
            style={{ color: colors.white, fontWeight: "600", fontSize: 16 }}
          >
            Guardar
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  useEffect(() => {
    if (visible) {
      ref.current?.present();
    } else {
      ref.current?.dismiss();
    }
  }, [visible]);

  const handleDismiss = useCallback(() => {
    onClose();
  }, [onClose]);

  const snapPoints = useMemo(() => ["70%", "95%"], []);

  const renderBackdrop = useCallback(
    (props: Parameters<typeof BottomSheetBackdrop>[0]) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={ref}
      index={1}
      snapPoints={snapPoints}
      stackBehavior="push"
      onDismiss={handleDismiss}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backgroundStyle={{
        backgroundColor: isDark ? colors.gray800 : colors.white,
      }}
      handleIndicatorStyle={{
        backgroundColor: isDark ? colors.gray600 : colors.gray800,
      }}
    >
      <BottomSheetScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 24,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="always"
        bounces={true}
      >
        {/* Header row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 16,
            marginBottom: 8,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? "#374151" : "#e5e7eb",
          }}
        >
          <TouchableOpacity
            onPress={handleDismiss}
            style={{ padding: 8 }}
            activeOpacity={0.7}
          >
            <Fontisto name="close" size={22} color={colors.gray600} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: isDark ? colors.white : colors.black,
              flex: 1,
              textAlign: "center",
            }}
          >
            {title}
          </Text>
          <View style={{ width: 38 }} />
        </View>

        {/* Form content */}
        {children}

        {/* Guardar button - inside scroll, always at bottom of content */}
        <TouchableOpacity
          onPress={onSave}
          disabled={isSaving}
          activeOpacity={0.8}
          style={{
            backgroundColor: colors.primary,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 24,
            marginBottom: 16,
          }}
        >
          <Text
            style={{ color: colors.white, fontWeight: "600", fontSize: 16 }}
          >
            Guardar
          </Text>
        </TouchableOpacity>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
