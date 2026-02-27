import { Ionicons } from "@expo/vector-icons";
import BottomSheetModal, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Participant {
  label: string;
  value: string;
}

interface ParticipantSelectBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  options: Participant[];
  selectedValues: string[];
  onConfirm: (selectedIds: string[]) => void;
  title: string;
}

export default function ParticipantSelectBottomSheet({
  visible,
  onClose,
  options,
  selectedValues,
  onConfirm,
  title,
}: ParticipantSelectBottomSheetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedValues);

  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;

    return options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [options, searchQuery]);

  const toggleSelection = (value: string) => {
    setSelectedIds((prev) =>
      prev.includes(value)
        ? prev.filter((id) => id !== value)
        : [...prev, value],
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedIds);
    handleClose();
  };

  const handleClose = () => {
    setSelectedIds(selectedValues);
    setSearchQuery("");
    onClose();
  };

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

  React.useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.snapToIndex(2);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const renderParticipantItem = ({ item }: { item: Participant }) => {
    const isSelected = selectedIds.includes(item.value);

    return (
      <TouchableOpacity
        onPress={() => toggleSelection(item.value)}
        className="flex-row items-center justify-between py-3 px-4 border-b border-gray-100 dark:border-gray-800"
      >
        <View className="flex-1 mr-3">
          <Text className="text-gray-900 dark:text-white font-medium text-base">
            {item.label}
          </Text>
        </View>
        <View
          className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
            isSelected
              ? "bg-green-500 border-green-500"
              : "border-gray-300 dark:border-gray-600"
          }`}
        >
          {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => (
    <View className="px-4 py-3 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-700">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-gray-600 dark:text-gray-400 text-sm">
          {selectedIds.length}{" "}
          {selectedIds.length === 1 ? "participante" : "participantes"}{" "}
          selecionado{selectedIds.length !== 1 ? "s" : ""}
        </Text>
      </View>
      <View className="flex-row space-x-3">
        <TouchableOpacity
          onPress={handleClose}
          className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 rounded-lg items-center justify-center"
        >
          <Text className="text-gray-700 dark:text-gray-300 font-medium">
            Cancelar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleConfirm}
          disabled={selectedIds.length === 0}
          className={`flex-1 py-3 px-4 rounded-lg items-center justify-center ${
            selectedIds.length > 0
              ? "bg-green-500"
              : "bg-gray-300 dark:bg-gray-700"
          }`}
        >
          <Text
            className={`font-medium ${
              selectedIds.length > 0
                ? "text-white"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Confirmar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}
      onClose={handleClose}
      enablePanDownToClose={true}
      enableOverDrag={true}
    >
      <BottomSheetView className="flex-1 bg-white dark:bg-black">
        <View className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white text-center">
            {title}
          </Text>
        </View>

        <View className="px-4 py-3">
          <View className="relative">
            <Ionicons
              name="search"
              size={20}
              color="#6B7280"
              className="absolute left-3 top-3 z-10"
            />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Pesquisar participantes..."
              placeholderTextColor="#9CA3AF"
              className="pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
            />
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((item) => (
              <View key={item.value}>{renderParticipantItem({ item })}</View>
            ))
          ) : (
            <View className="flex-1 items-center justify-center py-12">
              <Ionicons name="people-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 dark:text-gray-400 text-center mt-3">
                {searchQuery.trim()
                  ? "Nenhum participante encontrado"
                  : "Nenhum participante disponível"}
              </Text>
            </View>
          )}
        </ScrollView>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
