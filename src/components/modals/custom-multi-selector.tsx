import { avatarPlaceholderUri } from "@/constants/image-uris";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ConfirmOrCancelButtons from "../buttons/confirm-or-cancel-button";
import SelectorHeader from "./selector-header";

interface ItemType {
  label: string;
  value: string;
  photo?: string;
  uaid?: string;
}

interface CustomMultiSelectorProps {
  showModal: boolean;
  setShowModal: (b: boolean) => void;
  onClose: () => void;
  options: ItemType[];
  selectedValues: string[];
  onConfirm: (selectedIds: string[]) => void;
  label: string;
  searchPlaceholder?: string;
}

export default function CustomMultiSelector({
  showModal,
  setShowModal,
  onClose,
  options,
  selectedValues,
  onConfirm,
  label,
  searchPlaceholder,
}: CustomMultiSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedValues);

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
    setShowModal(false);
  };

  const handleClose = () => {
    setSelectedIds(selectedValues);
    setSearchQuery("");
    onClose();
    setShowModal(false);
  };

  const renderParticipantItem = ({ item }: { item: ItemType }) => {
    const isSelected = selectedIds.includes(item.value);
    const isLastItem =
      filteredOptions[filteredOptions.length - 1]?.value === item.value;

    if (isLastItem) {
      console.log("Last item details:", {
        label: item.label,
        // photo: item.photo,
        photoType: typeof item.photo,
        photoLength: item.photo?.length,
        uaid: item.uaid,
        hasPhoto: !!item.photo && item.photo.trim() !== "",
      });
    }

    return (
      <TouchableOpacity
        onPress={() => toggleSelection(item.value)}
        className={`flex-row items-center justify-between py-3 px-4 mb-2 rounded-lg border ${
          isSelected
            ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
            : "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
        }`}
      >
        {/* Profile Photo */}
        <View className="mr-3">
          <Image
            source={{ uri: item.photo ?? avatarPlaceholderUri }}
            className="w-10 h-10 rounded-full"
            contentFit="cover"
          />
        </View>

        {/* Participant Info */}
        <View className="flex-1 mr-3">
          <Text
            className={`text-base font-medium ${
              isSelected
                ? "text-green-800 dark:text-green-200"
                : "text-gray-900 dark:text-white"
            }`}
          >
            {item.label}
          </Text>
          {item.uaid && (
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              ID: {item.uaid}
            </Text>
          )}
        </View>

        {/* Selection Checkbox */}
        <View
          className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
            isSelected
              ? "bg-green-500 border-green-500"
              : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          }`}
        >
          {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={showModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-white dark:bg-black pb-8">
        <StatusBar
          backgroundColor="#008000"
          barStyle="light-content"
          translucent={true}
        />

        <SelectorHeader
          label={label}
          searchPlaceholder={searchPlaceholder || "Procurar..."}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setShowModal={setShowModal}
        />

        {/* Participants List */}
        <FlatList
          data={filteredOptions}
          renderItem={({ item }) => renderParticipantItem({ item })}
          keyExtractor={(item) => item.value}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 120
          }}
          ListFooterComponent={()=><View className="h-24" />}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-16">
              <Ionicons name="people-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 dark:text-gray-400 text-center mt-3 text-base">
                {searchQuery.trim()
                  ? "Nenhum participante encontrado"
                  : "Nenhum participante disponível"}
              </Text>
            </View>
          }
          getItemLayout={(data, index) => ({
            length: 80, // Approximate height of each item
            offset: 80 * index,
            index,
          })}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={15}
          windowSize={10}
        />

        {/* Footer */}

        <View className="absolute bottom-10 left-0 right-0">
          <ConfirmOrCancelButtons
            onCancel={handleClose}
            onConfirm={handleConfirm}
            confirmText={`${selectedIds.length} selecionado${selectedIds.length !== 1 ? "s" : ""}`}
          />
        </View>
      </View>
    </Modal>
  );
}
