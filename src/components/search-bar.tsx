import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { colors } from "@/constants/colors";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  showFilter?: boolean;
  onFilterPress?: () => void;
}

const SearchBar = ({
  value,
  onChangeText,
  placeholder = "Pesquisar...",
  onClear,
  showFilter = false,
  onFilterPress,
}: SearchBarProps) => {
  const isDarkMode = useColorScheme() === "dark";
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (value && onClear) {
      onClear();
    }
  }, []);

  const handleClear = () => {
    onChangeText("");
    onClear?.();
  };

  return (
    <Animated.View entering={FadeInDown.duration(300)} className="px-4 py-3">
      <View
        className="flex-row items-center px-3 rounded-xl"
        style={{
          backgroundColor: isDarkMode ? "#1F2937" : "#F3F4F6",
          borderWidth: 1,
          borderColor: isFocused
            ? colors.primary
            : isDarkMode
              ? "#374151"
              : "#E5E7EB",
        }}
      >
        <Ionicons
          name="search"
          size={20}
          color={isDarkMode ? colors.lightestgray : colors.gray800}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={
            isDarkMode ? colors.lightestgray : colors.gray800
          }
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 ml-3 py-3"
          style={{
            color: isDarkMode ? "#F3F4F6" : "#111827",
            fontSize: 16,
          }}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={handleClear} className="p-1">
            <Ionicons
              name="close-circle"
              size={20}
              color={isDarkMode ? colors.lightestgray : colors.gray800}
            />
          </TouchableOpacity>
        )}
        {showFilter && (
          <TouchableOpacity
            onPress={onFilterPress}
            className="p-1 ml-2"
            style={{
              backgroundColor: isDarkMode ? "#374151" : "#E5E7EB",
              borderRadius: 6,
            }}
          >
            <Ionicons
              name="filter-outline"
              size={18}
              color={isDarkMode ? colors.gray100 : colors.gray600}
            />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

export default SearchBar;
