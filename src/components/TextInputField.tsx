import React, { forwardRef } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from "react-native";

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

    return (
      <View style={[styles.wrapper, containerStyle]}>
        {label ? <Text style={[styles.label, labelStyle]}>{label}</Text> : null}

        <View style={styles.inputWrapper}>
          <TextInput
            ref={ref}
            style={[styles.input, inputStyle, extraPadding, style]}
            placeholderTextColor="#9aa4b2"
            {...rest}
          />

          {rightAccessory ? (
            <View style={styles.rightAccessory} pointerEvents="box-none">
              {rightAccessory}
            </View>
          ) : null}
        </View>

        {error ? <Text style={[styles.error, errorStyle]}>{error}</Text> : null}
      </View>
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
