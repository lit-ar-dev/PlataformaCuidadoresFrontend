import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, StyleSheet, TouchableOpacity } from "react-native";
import { z } from "zod";

import { login } from "@/src/api/auth";
import { ThemedText } from "@/src/components/themed-text";
import { ThemedView } from "@/src/components/themed-view";
import { PasswordInput } from "@/src/components/ui/pass-input";
import TextInputField from "@/src/components/ui/text-input-field";
import { useAuth } from "@/src/contexts/AuthContext";

const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  contraseña: z.string().min(6, "Mínimo 6 caracteres"),
});
type Values = z.infer<typeof LoginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, touchedFields },
    setError,
  } = useForm<Values>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", contraseña: "" },
    mode: "onTouched", // valida al tocar / blur; ajusta según prefieras
  });

  const onSubmit = async (values: Values) => {
    try {
      // isSubmitting está manejado por RHF al envolver la promesa retornada
      const data = await login(values);

      const token: string | undefined =
        (data && (data.token || data.accessToken || data.access_token)) ??
        undefined;

      const user = data?.user ?? null;

      if (token) {
        await signIn?.(token, user);
        router.replace("/(tabs)");
      } else {
        // setear error en campo email (ejemplo), similar a setErrors en Formik
        setError("email", {
          type: "server",
          message: "Credenciales inválidas",
        });
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Error de conexión o credenciales inválidas";

      // mapear a un field específico (email) o colocar un generalToast
      setError("email", { type: "server", message });
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Iniciar sesión</ThemedText>

      {/* Email */}
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <TextInputField
            label="Email"
            placeholder="tucorreo@ejemplo.com"
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
            error={touchedFields.email ? fieldState.error?.message : undefined}
          />
        )}
      />

      {/* Contraseña */}
      <Controller
        control={control}
        name="contraseña"
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <PasswordInput
            label="Contraseña"
            placeholder="******"
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
            error={
              touchedFields.contraseña ? fieldState.error?.message : undefined
            }
          />
        )}
      />

      <Button
        title={isSubmitting ? "Ingresando..." : "Ingresar"}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      />

      <ThemedView style={{ marginTop: 20, alignItems: "center" }}>
        <ThemedText>¿No tienes cuenta?</ThemedText>
        <TouchableOpacity style={{ marginTop: 8 }}>
          <Link href={{ pathname: "/(auth)/register/step1" }} asChild>
            <ThemedText style={{ color: "#0066CC", fontWeight: "600" }}>
              Crear una cuenta
            </ThemedText>
          </Link>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
});
