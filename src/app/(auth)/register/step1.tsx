import { checkEmailExists } from "@/src/api/auth";
import ImagePickerField from "@/src/components/forms/image-picker";
import { PasswordInput } from "@/src/components/ui/pass-input";
import TextInputField from "@/src/components/ui/text-input-field";
import { ThemedView } from "@/src/components/ui/themed-view";
import { useThemeColor } from "@/src/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  ActivityIndicator,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Step1() {
  const router = useRouter();
  const { control, trigger, formState, setError, clearErrors } =
    useFormContext();
  const [emailStatus, setEmailStatus] = React.useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const tint = useThemeColor({}, "tint");
  const danger = useThemeColor({}, "danger");

  const goNext = async () => {
    const ok = await trigger([
      "usuario.email",
      "usuario.contraseña",
      "usuario.confirmarContraseña",
      "usuario.foto",
    ]);
    if (!ok) console.log("step1 trigger errors=", formState.errors);
    if (ok) router.push("./step2");
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 120} // ajustar si tenés header
        >
          <ScrollView
            contentContainerStyle={{
              padding: 20,
              flexGrow: 1,
              paddingBottom: Platform.OS === "ios" ? 40 : 120, // espacio extra para el teclado
            }}
            keyboardShouldPersistTaps="handled"
          >
            <ImagePickerField
              name="usuario.foto"
              label="Foto de perfil"
              allowsEditing={true}
            />
            <Controller
              control={control}
              name="usuario.email"
              render={({ field: { onChange, onBlur, value }, fieldState }) => {
                const ICON_SIZE = 18;
                const IconWrapper = ({
                  children,
                }: {
                  children: React.ReactNode;
                }) => (
                  <TouchableOpacity
                    style={{ padding: 6 }}
                    accessibilityRole="imagebutton"
                  >
                    {children}
                  </TouchableOpacity>
                );

                const rightAccessory =
                  emailStatus === "checking" ? (
                    <ActivityIndicator size="small" />
                  ) : emailStatus === "available" ? (
                    <IconWrapper>
                      <Ionicons
                        name="checkmark-circle"
                        size={ICON_SIZE}
                        color={tint}
                      />
                    </IconWrapper>
                  ) : emailStatus === "taken" ? (
                    <IconWrapper>
                      <Ionicons
                        name="close-circle"
                        size={ICON_SIZE}
                        color={danger}
                      />
                    </IconWrapper>
                  ) : null;

                return (
                  <TextInputField
                    label="Email"
                    placeholder="tucorreo@ejemplo.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onChangeText={(text) => {
                      // clear server error and reset status while typing
                      clearErrors("usuario.email");
                      setEmailStatus("idle");
                      onChange(text);
                    }}
                    onBlur={async () => {
                      try {
                        onBlur();
                        if (value) {
                          setEmailStatus("checking");
                          const exists = await checkEmailExists(value);
                          if (exists) {
                            setError("usuario.email", {
                              type: "server",
                              message: "Email ya registrado",
                            });
                            setEmailStatus("taken");
                          } else {
                            setEmailStatus("available");
                          }
                        }
                      } catch (e) {
                        // network error: reset status
                        setEmailStatus("idle");
                      }
                    }}
                    value={value}
                    error={fieldState.error?.message}
                    rightAccessory={rightAccessory}
                  />
                );
              }}
            />

            <Controller
              control={control}
              name="usuario.contraseña"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <PasswordInput
                  label="Contraseña"
                  placeholder="******"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={fieldState.error?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="usuario.confirmarContraseña"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <PasswordInput
                  label="Confirmar contraseña"
                  placeholder="******"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={fieldState.error?.message}
                />
              )}
            />

            <Button title="Siguiente" onPress={goNext} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { marginBottom: 16 },
});
