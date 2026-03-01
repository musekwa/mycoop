import { colors } from "@/constants/colors";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo } from "react";
import { KeyboardAvoidingView, ScrollView, useColorScheme } from "react-native";

type CustomBottomSheetModalProps = {
  children: React.ReactNode;
  bottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
  handleDismissModalPress: () => void;
  renderFooter?: (props: any) => React.ReactNode;
  index?: number;
};

export default function CustomBottomSheetModal({
  children,
  bottomSheetModalRef,
  handleDismissModalPress,
  renderFooter,
  index = 2,
}: CustomBottomSheetModalProps) {
  const isDark = useColorScheme() === "dark";
  const snapPoints = useMemo(
    () => ["25%", "50%", "60%", "70%", "80%", "90%"],
    [],
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={1}
      />
    ),
    [],
  );

  return (
    <>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={index || 2}
        snapPoints={snapPoints}
        keyboardBehavior="fillParent"
        footerComponent={renderFooter}
        backdropComponent={renderBackdrop}
        onDismiss={() => {}}
        enablePanDownToClose={true}
        enableOverDrag={true}
        backgroundStyle={{
          backgroundColor: isDark ? colors.black : colors.white,
        }}
        handleIndicatorStyle={{
          backgroundColor: isDark ? colors.gray600 : colors.slate300,
        }}
      >
        <BottomSheetView>
          <KeyboardAvoidingView keyboardVerticalOffset={80} behavior="position">
            <ScrollView
              className="bg-white dark:bg-black min-h-full"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: 80,
                flexGrow: 1,
              }}
              keyboardShouldPersistTaps={"always"}
            >
              {children}
            </ScrollView>
          </KeyboardAvoidingView>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
}
