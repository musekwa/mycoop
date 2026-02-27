import { colors } from "@/constants/colors";
import React, { useState } from "react";
import { Text, TextInput, useColorScheme, View } from "react-native";

type CustomTextInputProps = {
  value: string | number | Date | undefined;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder: string;
  editable?: boolean;
  label: string;
  secureTextEntry?: boolean;
  keyboardType?:
    | "default"
    | "numeric"
    | "email-address"
    | "phone-pad"
    | "decimal-pad"
    | "number-pad";
  multiline?: boolean;
  numberOfLines?: number;
  autoCapitalize?: "none" | "sentences" | "words" | "characters" | undefined;
  autoComplete?: React.ComponentProps<typeof TextInput>["autoComplete"];
  /** @deprecated Use autoComplete instead */
  autoCompleteType?: React.ComponentProps<typeof TextInput>["autoComplete"];
  textContentType?: React.ComponentProps<typeof TextInput>["textContentType"];
  style?: any;
};

export default function CustomTextInput({
  value,
  onChangeText,
  onBlur,
  placeholder,
  label,
  secureTextEntry = false,
  keyboardType = "default",
  multiline = false,
  numberOfLines = 1,
  autoCapitalize = "none",
  editable = true,
  autoComplete,
  autoCompleteType,
  textContentType = "none",
  style = {},
}: CustomTextInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const isDarkMode = useColorScheme() === "dark";
  return (
    <View className="flex flex-col space-y-3">
      {label && (
        <Text className="text-[14px] font-normal text-black dark:text-white">
          {label}
        </Text>
      )}
      <TextInput
        editable={editable}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
        style={[
          style,
          {
            color: isDarkMode ? colors.white : colors.black,
          },
        ]}
        placeholderTextColor="#808080"
        placeholder={placeholder}
        autoComplete={autoComplete ?? autoCompleteType ?? "off"}
        value={value != null ? String(value) : undefined}
        onBlur={onBlur}
        onChangeText={onChangeText}
        onFocus={() => {
          // the text input must be visible when it is focused and the keyboard is open
        }}
        autoCapitalize={autoCapitalize}
        textContentType={textContentType}
        className="border border-slate-300 p-3 text-[14px] shadow-sm shadow-black rounded-xl bg-gray-50 dark:bg-black"
      />
    </View>
  );
}
