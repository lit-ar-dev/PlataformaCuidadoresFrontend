import React from "react";
import { View, Button, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TextInputField from "../components/TextInputField";
import { login } from "../services/auth";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation";
import { PasswordInput } from "../components/PasswordInput";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Email inválido").required("Requerido"),
  contraseña: Yup.string().min(6, "Mínimo 6 caracteres").required("Requerido"),
});

export default function LoginScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>

      <Formik
        initialValues={{ email: "", contraseña: "" }}
        validationSchema={LoginSchema}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          try {
            const data = await login(values);
            const token = data.token;
            if (token) {
              await AsyncStorage.setItem("@Cuidadores:token", token);
              navigation.replace("Home");
            } else {
              setErrors({ email: "Credenciales invalidas" } as any);
            }
          } catch (err: any) {
            console.error(err);
            setErrors({
              email: "Error de conexión o credenciales inválidas",
            } as any);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          isSubmitting,
        }) => (
          <>
            <TextInputField
              label="Email"
              placeholder="tucorreo@ejemplo.com"
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
              value={values.email}
              error={touched.email ? errors.email : undefined}
            />

            <PasswordInput
              label="Contraseña"
              placeholder="******"
              onChangeText={handleChange("contraseña")}
              onBlur={handleBlur("contraseña")}
              value={values.contraseña}
              error={touched.contraseña ? errors.contraseña : undefined}
            />

            <Button
              title={isSubmitting ? "Ingresando..." : "Ingresar"}
              onPress={handleSubmit as any}
              disabled={isSubmitting}
            />
          </>
        )}
      </Formik>

      <View style={{ marginTop: 20, alignItems: "center" }}>
        <Text>¿No tienes cuenta?</Text>

        {/* Botón para ir a Register */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Register")}
          style={{ marginTop: 8 }}
        >
          <Text style={{ color: "#0066CC", fontWeight: "600" }}>
            Crear una cuenta
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
