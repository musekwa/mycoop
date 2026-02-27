import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

import { colors } from "@/constants/colors";

interface CustomDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "call" | "default";
}

const CustomDialog = ({
  visible,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  type = "default",
}: CustomDialogProps) => {
  const isDarkMode = useColorScheme() === "dark";

  const getIconAndColor = () => {
    switch (type) {
      case "call":
        return {
          icon: "call" as const,
          color: "#10B981",
          bgColor: isDarkMode ? "#064E3B" : "#D1FAE5",
        };
      default:
        return {
          icon: "information-circle" as const,
          color: "#3B82F6",
          bgColor: isDarkMode ? "#1E3A8A" : "#DBEAFE",
        };
    }
  };

  const { icon, color, bgColor } = getIconAndColor();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View
        className="flex-1 justify-center items-center px-6"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <View
          className="rounded-2xl p-6 w-full max-w-sm"
          style={{
            backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          {/* Icon */}
          <View className="items-center mb-4">
            <View
              className="w-16 h-16 rounded-full items-center justify-center"
              style={{ backgroundColor: bgColor }}
            >
              <Ionicons name={icon} size={32} color={color} />
            </View>
          </View>

          {/* Title */}
          <Text
            className="text-lg font-semibold text-center mb-2"
            style={{
              color: isDarkMode ? "#F3F4F6" : "#111827",
            }}
          >
            {title}
          </Text>

          {/* Message */}
          <Text
            className="text-sm text-center mb-6 leading-relaxed"
            style={{
              color: isDarkMode ? "#9CA3AF" : "#6B7280",
            }}
          >
            {message}
          </Text>

          {/* Buttons */}
          <View className="flex-row gap-3">
            {/* Cancel Button */}
            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 py-3 px-4 rounded-xl items-center"
              style={{
                backgroundColor: isDarkMode ? "#374151" : "#F3F4F6",
              }}
            >
              <Text
                className="font-medium"
                style={{
                  color: isDarkMode ? "#F3F4F6" : "#111827",
                }}
              >
                {cancelText}
              </Text>
            </TouchableOpacity>

            {/* Confirm Button */}
            <TouchableOpacity
              onPress={onConfirm}
              className="flex-1 py-3 px-4 rounded-xl items-center"
              style={{
                backgroundColor: type === "call" ? "#10B981" : colors.primary,
              }}
            >
              <Text className="font-medium text-white">{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomDialog;
