import { useThemeColor } from "@/src/hooks/use-theme-color";
import React, { forwardRef, useState } from "react";
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

type TextInputFieldProps = TextInputProps & {
  label?: string;
  error?: string | null;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  /** componente que se renderiza a la derecha (ej: botón ojo) */
  rightAccessory?: React.ReactNode;
};

const TextInputField = forwardRef<TextInput, TextInputFieldProps>(
  (
    {
      label,
      error,
      containerStyle,
      inputStyle,
      labelStyle,
      errorStyle,
      rightAccessory,
      style, // mantenemos compatibilidad si alguien pasó `style`
      ...rest
    },
    ref
  ) => {
    // reservamos espacio automáticamente si hay rightAccessory
    const extraPadding = rightAccessory ? { paddingRight: 44 } : undefined;
    const [focused, setFocused] = useState(false);
    const textColor = useThemeColor({}, "text");
    const placeholderColor = useThemeColor({}, "placeholder");
    const borderColor = useThemeColor({}, "border");
    const inputBackground = useThemeColor({}, "inputBackground");
    const labelColor = useThemeColor({}, "label");
    const errorColor = useThemeColor({}, "danger");
    const tint = useThemeColor({}, "tint");

    return (
      <ThemedView style={[styles.wrapper, containerStyle]}>
        {label ? (
          <ThemedText style={[styles.label, labelStyle, { color: labelColor }]}>
            {label}
          </ThemedText>
        ) : null}

        <ThemedView style={styles.inputWrapper}>
          <TextInput
            ref={ref}
            style={[
              styles.input,
              {
                color: textColor,
                borderColor: focused ? tint : borderColor,
                backgroundColor: inputBackground,
              },
              inputStyle,
              extraPadding,
              style,
            ]}
            placeholderTextColor={placeholderColor}
            onFocus={(e) => {
              setFocused(true);
              if (rest.onFocus) rest.onFocus(e as any);
            }}
            onBlur={(e) => {
              setFocused(false);
              if (rest.onBlur) rest.onBlur(e as any);
            }}
            {...rest}
          />

          {rightAccessory ? (
            <View style={styles.rightAccessory} pointerEvents="box-none">
              {rightAccessory}
            </View>
          ) : null}
        </ThemedView>

        {error ? (
          <ThemedText style={[styles.error, errorStyle, { color: errorColor }]}>
            {error}
          </ThemedText>
        ) : null}
      </ThemedView>
    );
  }
);

export const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  label: { marginBottom: 6, fontSize: 13, color: "#344054", fontWeight: "600" },
  inputWrapper: { position: "relative" },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#E6EEF7",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    fontSize: 15,
  },
  rightAccessory: {
    position: "absolute",
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  iconTouchable: {
    padding: 6,
    borderRadius: 8,
  },
  error: { marginTop: 6, color: "#E03131", fontSize: 12 },
});

export default TextInputField;
export type { TextInputFieldProps };
