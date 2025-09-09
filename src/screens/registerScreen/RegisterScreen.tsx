import React, { useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Formik } from "formik";
import { registerSchema } from "../../validation/registerSchema";
import { useCatalogs } from "../../hooks/useCatalogs";
import UsuarioStep from "./steps/UsuarioStep";
import PersonaStep from "./steps/PersonaStep";
import RolesStep from "./steps/RolesStep";
import StepButtons from "../../components/StepButton";
import { FormValues } from "../../types/registerFormTypes";
import {
  checkEmailExists,
  register,
  RegisterPayload,
} from "../../services/auth";
import { RootStackParamList } from "../../navigation";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const { provincias, ciudades, generos, roles, loading, error, loadCiudades } =
    useCatalogs();
  const [step, setStep] = useState(0);
  const [showDate, setShowDate] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  if (error)
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ color: "red" }}>{error}</Text>
      </View>
    );

  const initialValues: FormValues = {
    usuario: { email: "", contraseña: "" },
    persona: {
      nombre: "",
      apellido: "",
      fechaDeNacimiento: undefined,
      telefono: "",
      provinciaId: undefined,
      ciudadId: undefined,
      generoId: undefined,
    },
    cliente: { domicilio: undefined },
    cuidador: {
      experiencia: undefined,
      descripcion: undefined,
      formacion: undefined,
      tarifas: undefined,
    },
    rolesId: [],
  };

  const lastStep = registerSchema.length - 1;

  return (
    <Formik<FormValues>
      initialValues={initialValues}
      validateOnChange={false}
      onSubmit={async (values, formikHelpers) => {
        const { setErrors } = formikHelpers;
        try {
          // valida todos los schemas (los que tengas en registerSchema)
          for (const schema of registerSchema) {
            await schema.validate(values, { abortEarly: false });
          }

          // si llegamos acá, todo validó OK -> enviar
          await register(values as RegisterPayload);
          Alert.alert("Registro exitoso", "Te has registrado correctamente");
          navigation.navigate("Login");
        } catch (err: any) {
          // mapear errores de Yup a estructura esperada por Formik
          const mapped: Record<string, any> = {};
          if (err.inner && Array.isArray(err.inner)) {
            err.inner.forEach((e: any) => {
              if (!e.path) return;
              // formik acepta keys anidadas, por ejemplo "cliente.domicilio"
              mapped[e.path] = e.message;
            });
          } else if (err.path) {
            mapped[err.path] = err.message;
          }
          setErrors(mapped);
        }
      }}
    >
      {({
        values,
        handleChange,
        handleBlur,
        setFieldValue,
        handleSubmit,
        setFieldError,
        setErrors,
        errors,
      }) => {
        const validateStep = async () => {
          const schema = registerSchema[step];
          try {
            await schema.validate(values, { abortEarly: false });
            const email = values.usuario.email;
            if (step === 0 && values.usuario?.email) {
              setCheckingEmail(true);
              try {
                const exists = await checkEmailExists(email);
                if (exists) {
                  setFieldError("usuario.email", "El email ya está registrado");
                  return; // no avanzamos
                }
              } catch (err) {
                // Manejo de error de red/servidor:
                // Bloquear avance y mostrar error
                setFieldError(
                  "usuario.email",
                  "No se pudo verificar el email. Verificá tu conexión o intentá más tarde"
                );
                return;
              } finally {
                setCheckingEmail(false);
              }
            }

            // si la validación es ok y es step de persona, cargamos ciudades si hace falta
            if (step === 1 && values.persona.provinciaId)
              await loadCiudades(values.persona.provinciaId);
            setStep((s) => Math.min(s + 1, lastStep));
          } catch (err: any) {
            const mapped: Record<string, any> = {};
            if (err.inner) {
              err.inner.forEach((e: any) => {
                if (e.path) mapped[e.path] = e.message;
              });
            } else if (err.path) mapped[err.path] = err.message;
            setErrors(mapped);
            console.log("Validation errors:", mapped);
          }
        };

        return (
          <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ flex: 1 }}
            >
              <ScrollView
                contentContainerStyle={{ padding: 16 }}
                keyboardShouldPersistTaps="handled"
              >
                <Text
                  style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}
                >
                  {["Cuenta", "Datos personales", "Roles"][step]}
                </Text>

                {step === 0 && (
                  <UsuarioStep
                    values={values}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    errors={errors}
                  />
                )}
                {step === 1 && (
                  <PersonaStep
                    values={values}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    setFieldValue={setFieldValue}
                    errors={errors}
                    provincias={provincias}
                    ciudades={ciudades}
                    generos={generos}
                    showDate={showDate}
                    setShowDate={setShowDate}
                    onProvinciaChange={(id: number) => loadCiudades(id)}
                  />
                )}
                {step === 2 && (
                  <RolesStep
                    values={values}
                    setFieldValue={setFieldValue}
                    roles={roles}
                    errors={errors}
                  />
                )}

                {checkingEmail && (
                  <View style={{ marginTop: 8, alignItems: "center" }}>
                    <ActivityIndicator size="small" />
                    <Text style={{ fontSize: 12, color: "#6b7280" }}>
                      Verificando email...
                    </Text>
                  </View>
                )}

                <StepButtons
                  step={step}
                  lastStep={lastStep}
                  onBack={() => setStep((s) => Math.max(0, s - 1))}
                  onNext={validateStep}
                  onSubmit={handleSubmit}
                />
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        );
      }}
    </Formik>
  );
}
