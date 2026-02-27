import Label from "@/components/form-items/custom-label";
import FormItemDescription from "@/components/form-items/form-item-description";
import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import NoContentPlaceholder from "../no-content-placeholder";
import SelectorHeader from "./selector-header";


type SelectModalProps = {
  label: string;
  showModal: boolean;
  setShowModal: (b: boolean) => void;
  setValue: (v: string) => void;
  itemsList: {
    label: string;
    value: string;
    description?: string;
    icon?: string;
  }[];
  mode?: "multi-select";
  searchPlaceholder?: string;
  emptyMessage?: string;
};

export default function CustomSingleSelector({
  showModal,
  label,
  setShowModal,
  setValue,
  itemsList,
  mode,
  searchPlaceholder,
  emptyMessage,
}: SelectModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState(itemsList);

  useEffect(() => {
    const filtered = itemsList.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredItems(filtered);
  }, [searchQuery, itemsList]);

  const renderItem = ({
    item,
  }: {
    item: { label: string; value: string; description?: string; icon?: string };
  }) => (
    <SelectItem
      item={item}
      setValue={setValue}
      mode={mode || "single-select"}
      setShowModal={setShowModal}
      setSearchQuery={setSearchQuery}
    />
  );

  return (
    <Modal
      presentationStyle="overFullScreen"
      animationType="slide"
      visible={showModal}
      statusBarTranslucent
    >
      <View className="flex-1 bg-white dark:bg-black">
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

        <View className="p-3">
          <FlatList
            ListHeaderComponent={
              <View className="mb-4">
                <FormItemDescription description={label} />
              </View>
            }
            showsVerticalScrollIndicator={false}
            ListFooterComponentStyle={{
              paddingBottom: 100,
            }}
            ListEmptyComponent={
              <NoContentPlaceholder
                message={emptyMessage || "Nenhum item encontrado"}
              />
            }
            ListFooterComponent={
              <View className="pb-24 h-16">
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery("");
                    setShowModal(false);
                  }}
                >
                  <Text>Cancelar</Text>
                </TouchableOpacity>
              </View>
            }
            data={filteredItems}
            renderItem={renderItem}
          />
        </View>
      </View>
    </Modal>
  );
}



const SelectItem = ({
  item,
  setValue,
  mode,
  setShowModal,
  setSearchQuery,
}: {
  item: { label: string; value: string; description?: string; icon?: string };
  setValue: (value: string) => void;
  mode: "multi-select" | "single-select";
  setShowModal: (show: boolean) => void;
  setSearchQuery: (text: string) => void;
}) => {
  return (
    <TouchableOpacity
      onPress={() => {
        setValue(item.value);
        if (mode !== "multi-select") {
          setShowModal(false);
          setSearchQuery("");
        }
      }}
      className="bg-gray-50 dark:bg-black my-2 min-h-15 items-center flex flex-row justify-between  border border-slate-100 dark:border-slate-700 px-3 text-[18px] shadow-xs shadow-black rounded-xl"
    >
      <View className="flex-1">
        <Label label={item.label} />
        {item.description && (
          <FormItemDescription description={item.description} />
        )}
      </View>
      <View className="w-4 h-4 border border-gray-400 rounded-full dark:border-gray-400" />
    </TouchableOpacity>
  );
};
