import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

type CustomPickerProps = {
  items: { label: string; value: string }[];
  setValue: (value: string) => void;
  placeholder: { label: string; value: null };
  value: string;
};

export const CustomPicker = ({
  items,
  setValue,
  placeholder,
  value,
}: CustomPickerProps) => {
  const isDarkMode = useColorScheme() === "dark";
  const bottomSheetModalRef = useRef<BottomSheetModal | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Safely filter and provide fallback items
  const safeItems =
    items && Array.isArray(items)
      ? items.filter(
          (item) =>
            item &&
            typeof item.label === "string" &&
            typeof item.value === "string",
        )
      : [{ label: "Não Aplicável", value: "N/A" }];

  const allItems = useMemo(() => {
    const fallback =
      safeItems.length > 0
        ? safeItems
        : [{ label: "Não Aplicável", value: "N/A" }];
    return [
      { label: placeholder?.label ?? "Selecionar", value: "" },
      ...fallback,
    ];
  }, [placeholder?.label, safeItems]);

  const selectedLabel = useMemo(() => {
    if (!value) return placeholder?.label ?? "";
    return (
      allItems.find((i) => i.value === value)?.label ?? placeholder?.label ?? ""
    );
  }, [allItems, placeholder?.label, value]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q === "") return allItems;
    return allItems.filter((i) => i.label.toLowerCase().includes(q));
  }, [allItems, searchQuery]);

  const open = useCallback(() => {
    setSearchQuery("");
    bottomSheetModalRef.current?.present();
  }, []);

  const close = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    [],
  );

  const snapPoints = useMemo(() => ["60%", "80%", "90%"], []);

  const onSelect = useCallback(
    (v: string) => {
      setValue(v);
      close();
    },
    [close, setValue],
  );

  const renderItem = useCallback(
    ({ item }: { item: { label: string; value: string } }) => {
      const isSelected = item.value === value;
      return (
        <TouchableOpacity
          onPress={() => onSelect(item.value)}
          className="my-2 min-h-13 items-center flex flex-row justify-between border border-slate-100 dark:border-slate-700 px-3 shadow-xs shadow-black rounded-xl"
          style={{ backgroundColor: isDarkMode ? colors.black : colors.gray50 }}
        >
          <Text
            style={{
              color: isDarkMode ? colors.white : colors.black,
              fontSize: 14,
            }}
          >
            {item.label}
          </Text>
          <Ionicons
            name={isSelected ? "radio-button-on" : "radio-button-off"}
            size={18}
            color={isDarkMode ? colors.white : colors.primary}
          />
        </TouchableOpacity>
      );
    },
    [isDarkMode, onSelect, value],
  );

  return (
    <>
      <TouchableOpacity activeOpacity={0.7} onPress={open}>
        <View
          style={{
            ...pickerSelectStyles.inputAndroid,
            backgroundColor: isDarkMode ? colors.black : colors.white,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingRight: 10,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: value
                ? isDarkMode
                  ? colors.white
                  : colors.black
                : colors.gray600,
              flex: 1,
            }}
            numberOfLines={1}
          >
            {selectedLabel}
          </Text>
          <Ionicons
            name="chevron-down-sharp"
            size={18}
            color={colors.gray600}
          />
        </View>
      </TouchableOpacity>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={snapPoints}
        index={1}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        keyboardBehavior="interactive"
        backgroundStyle={{
          backgroundColor: isDarkMode ? colors.black : colors.white,
        }}
        handleIndicatorStyle={{
          backgroundColor: isDarkMode ? colors.gray600 : colors.slate300,
        }}
      >
        <BottomSheetView style={{ paddingHorizontal: 12, paddingTop: 10 }}>
          <View className="pb-3">
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Procurar..."
              placeholderTextColor={colors.gray600}
              style={{
                borderWidth: 1,
                borderColor: isDarkMode ? colors.gray600 : colors.slate300,
                borderRadius: 10,
                paddingHorizontal: 10,
                height: 44,
                color: isDarkMode ? colors.white : colors.black,
                backgroundColor: isDarkMode ? colors.black : colors.gray50,
              }}
            />
          </View>

          <FlatList
            data={filteredItems}
            keyExtractor={(item, idx) => `${item.value}-${idx}`}
            renderItem={renderItem}
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
};

const pickerSelectStyles = StyleSheet.create({
  iconContainer: {
    top: 15,
    right: 10,
  },
  placeholder: {
    color: colors.gray600,
    fontSize: 14,
    // fontWeight: 'bold',
  },
  inputAndroid: {
    fontSize: 14,
    borderWidth: 1,
    backgroundColor: colors.gray50,
    borderColor: colors.slate300,
    borderRadius: 10,
    paddingHorizontal: 5,
    height: 50,
  },
});
