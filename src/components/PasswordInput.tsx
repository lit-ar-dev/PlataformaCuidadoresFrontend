import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TextInputField, { TextInputFieldProps } from "./TextInputField";
import { styles } from "./TextInputField";

type PasswordInputProps = Omit<TextInputFieldProps, "rightAccessory"> & {
  value: string;
  onChangeText: (text: string) => void;
};

export function PasswordInput({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  ...rest
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  const toggle = () => setVisible((v) => !v);

  const eyeButton = (
    <TouchableOpacity
      onPress={toggle}
      accessibilityRole="button"
      accessibilityLabel={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={styles.iconTouchable}
    >
      <Ionicons name={visible ? "eye-off" : "eye"} size={20} color="#6b6b6b" />
    </TouchableOpacity>
  );

  return (
    <TextInputField
      label={label}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      onBlur={onBlur}
      error={error}
      containerStyle={containerStyle}
      inputStyle={inputStyle}
      labelStyle={labelStyle}
      errorStyle={errorStyle}
      secureTextEntry={!visible}
      rightAccessory={eyeButton}
      {...rest}
    />
  );
}
