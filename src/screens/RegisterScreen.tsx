import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  SafeAreaView,
  Platform,
  TextInput,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import DateTimePicker from "@react-native-community/datetimepicker";
import TextInputField from "../components/TextInputField";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation";
import { Picker } from "@react-native-picker/picker";
import {
  getProvincias,
  getGeneros,
  Provincia,
  Genero,
  Ciudad,
  getCiudadesByProvincia,
} from "../services/utilidades";
import { getRoles, Rol } from "../services/auth";

const RegisterSchema = Yup.object().shape({
  usuario: Yup.object({
    email: Yup.string().email("Email inválido").required("Email requerido"),
    contraseña: Yup.string()
      .min(6, "Mínimo 6 caracteres")
      .required("Contraseña requerida"),
  }),
  persona: Yup.object({
    nombre: Yup.string().required("Nombre requerido"),
    apellido: Yup.string().required("Apellido requerido"),
    fechaDeNacimiento: Yup.date()
      .required("Fecha requerida")
      .max(new Date(), "Fecha inválida"),
    telefono: Yup.string().nullable(),
    provinciaId: Yup.number().required("Provincia requerida"),
    ciudadId: Yup.number().required("Ciudad requerida"),
    generoId: Yup.number().nullable(),
  }),
  cliente: Yup.object({
    domicilio: Yup.string().nullable(),
  }),
  roles: Yup.array().of(Yup.number().required("Rol requerido")),
});

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const [showDate, setShowDate] = useState(false);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Rol[]>([]);

  const onChangeProvincia = async (provinciaId: number) => {
    setCiudades([]);
    if (provinciaId) {
      const ciudades = await getCiudadesByProvincia(provinciaId);
      setCiudades(ciudades);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [c, g, r] = await Promise.all([
          getProvincias(),
          getGeneros(),
          getRoles(),
        ]);
        if (!mounted) return;
        setProvincias(c);
        setGeneros(g);
        setRoles(r);
      } catch (err: any) {
        console.error("Error cargando catálogos:", err);
        if (mounted) setLoadError("No se pudieron cargar Provincias/géneros");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ color: "red", marginBottom: 12 }}>{loadError}</Text>
        <TouchableOpacity
          onPress={() => {
            /* podrías reintentar */
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Formik
      initialValues={{
        usuario: { email: "", contraseña: "" },
        persona: {
          nombre: "",
          apellido: "",
          fechaDeNacimiento: undefined as Date | undefined,
          telefono: "",
          provinciaId: undefined as number | undefined,
          ciudadId: undefined as number | undefined,
          generoId: undefined as number | undefined,
        },
        cliente: {
          domicilio: undefined as string | undefined,
        },
        rolesId: [] as number[],
      }}
      validationSchema={RegisterSchema}
      validateOnChange={false}
      onSubmit={(values) => {
        const payload = {
          usuario: {
            email: values.usuario.email,
            contraseña: values.usuario.contraseña,
          },
          persona: {
            nombre: values.persona.nombre,
            apellido: values.persona.apellido,
            fechaDeNacimiento: values.persona.fechaDeNacimiento
              ? values.persona.fechaDeNacimiento.toISOString()
              : null,
            telefono: values.persona.telefono ?? null,
            provinciaId: values.persona.provinciaId ?? null,
            ciudadId: values.persona.ciudadId ?? null,
            generoId: values.persona.generoId ?? null,
          },
          cliente: {
            domicilio: values.cliente?.domicilio ?? null,
          },
          rolesId: values.rolesId || [],
        };

        console.log("Payload listo:", payload);
        Alert.alert("Payload", JSON.stringify(payload, null, 2));
      }}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        errors,
        touched,
        setFieldValue,
      }) => (
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0} // ajusta si tienes header
          >
            <ScrollView
              contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
            >
              {/* --- Usuario --- */}
              <TextInputField
                label="Email"
                placeholder="tu@ejemplo.com"
                value={values.usuario.email}
                onChangeText={handleChange("usuario.email")}
                onBlur={handleBlur("usuario.email")}
                error={
                  touched.usuario?.email
                    ? (errors.usuario as any)?.email
                    : undefined
                }
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInputField
                label="Contraseña"
                placeholder="Mínimo 6 caracteres"
                value={values.usuario.contraseña}
                onChangeText={handleChange("usuario.contraseña")}
                onBlur={handleBlur("usuario.contraseña")}
                error={
                  touched.usuario?.contraseña
                    ? (errors.usuario as any)?.contraseña
                    : undefined
                }
                secureTextEntry
              />

              {/* --- Persona --- */}
              <TextInputField
                label="Nombre"
                placeholder="Nombre"
                value={values.persona.nombre}
                onChangeText={handleChange("persona.nombre")}
                onBlur={handleBlur("persona.nombre")}
                error={
                  touched.persona?.nombre
                    ? (errors.persona as any)?.nombre
                    : undefined
                }
              />

              <TextInputField
                label="Apellido"
                placeholder="Apellido"
                value={values.persona.apellido}
                onChangeText={handleChange("persona.apellido")}
                onBlur={handleBlur("persona.apellido")}
                error={
                  touched.persona?.apellido
                    ? (errors.persona as any)?.apellido
                    : undefined
                }
              />

              {/* Fecha: abrimos DatePicker y guardamos Date en Formik */}
              <TouchableOpacity
                onPress={() => setShowDate(true)}
                style={{
                  padding: 12,
                  borderWidth: 1,
                  borderRadius: 6,
                  marginTop: 8,
                }}
              >
                <Text>
                  {values.persona.fechaDeNacimiento
                    ? values.persona.fechaDeNacimiento.toLocaleDateString()
                    : "Fecha de nacimiento"}
                </Text>
              </TouchableOpacity>
              {touched.persona?.fechaDeNacimiento &&
              (errors.persona as any)?.fechaDeNacimiento ? (
                <Text style={{ color: "red", marginTop: 6 }}>
                  {(errors.persona as any).fechaDeNacimiento}
                </Text>
              ) : null}

              {showDate && (
                <DateTimePicker
                  value={
                    values.persona.fechaDeNacimiento ?? new Date(1990, 0, 1)
                  }
                  mode="date"
                  display="default"
                  maximumDate={new Date()}
                  onChange={(_, selectedDate) => {
                    setShowDate(false);
                    if (selectedDate) {
                      setFieldValue("persona.fechaDeNacimiento", selectedDate);
                    }
                  }}
                />
              )}

              {/* --- Provincia --- */}
              <Text style={{ marginTop: 12 }}>Provincia</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={values.persona.provinciaId}
                  onValueChange={(val) => {
                    setFieldValue("persona.provinciaId", val);
                    onChangeProvincia(val);
                  }}
                >
                  <Picker.Item
                    label="Seleccionar Provincia..."
                    value={undefined}
                  />
                  {provincias.map((c) => (
                    <Picker.Item key={c.id} label={c.nombre} value={c.id} />
                  ))}
                </Picker>
              </View>
              {touched.persona?.provinciaId &&
              (errors.persona as any)?.provinciaId ? (
                <Text style={{ color: "red" }}>
                  {(errors.persona as any).provinciaId}
                </Text>
              ) : null}

              {/* --- Ciudad --- */}
              <Text style={{ marginTop: 12 }}>Ciudad</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={values.persona.ciudadId}
                  onValueChange={(val) =>
                    setFieldValue("persona.ciudadId", val)
                  }
                >
                  <Picker.Item
                    label="Seleccionar Ciudad..."
                    value={undefined}
                  />
                  {ciudades.map((c) => (
                    <Picker.Item key={c.id} label={c.nombre} value={c.id} />
                  ))}
                </Picker>
              </View>
              {touched.persona?.ciudadId &&
              (errors.persona as any)?.CiudadId ? (
                <Text style={{ color: "red" }}>
                  {(errors.persona as any).CiudadId}
                </Text>
              ) : null}

              {touched.persona?.provinciaId &&
              (errors.persona as any)?.provinciaId ? (
                <Text style={{ color: "red" }}>
                  {(errors.persona as any).provinciaId}
                </Text>
              ) : null}

              {/* --- Género --- */}
              <Text style={{ marginTop: 12 }}>Género</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={values.persona.generoId}
                  onValueChange={(val) =>
                    setFieldValue("persona.generoId", val)
                  }
                >
                  <Picker.Item label="No especificar" value={undefined} />
                  {generos.map((g) => (
                    <Picker.Item key={g.id} label={g.nombre} value={g.id} />
                  ))}
                </Picker>
              </View>

              {/* --- Roles --- */}
              <Text style={{ marginTop: 12 }}>Roles</Text>
              <View style={styles.pickerContainer}>
                {roles.map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 8,
                      paddingHorizontal: 4,
                    }}
                    onPress={() => {
                      const current = values.rolesId || [];
                      if (current.includes(r.id)) {
                        setFieldValue(
                          "rolesId",
                          current.filter((id: number) => id !== r.id)
                        );
                      } else {
                        setFieldValue("rolesId", [...current, r.id]);
                      }
                    }}
                  >
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        borderWidth: 1,
                        borderColor: "#888",
                        marginRight: 8,
                        backgroundColor: (values.rolesId || []).includes(r.id)
                          ? "#0b79ff"
                          : "#fff",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {(values.rolesId || []).includes(r.id) && (
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>
                          ✓
                        </Text>
                      )}
                    </View>
                    <Text>{r.nombre}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* --- Si es un cliente... --- */}
              {values.rolesId
                .map((id) => roles.find((r) => r.id === id)?.nombre)
                .includes("cliente") && (
                <>
                  <View style={{ marginTop: 12 }}>
                    <TextInputField
                      label="Domicilio"
                      placeholder="Ingrese su domicilio"
                      value={values.cliente?.domicilio}
                      onChangeText={handleChange("cliente.domicilio")}
                      onBlur={handleBlur("cliente.domicilio")}
                      error={
                        touched.cliente?.domicilio
                          ? (errors.cliente as any)?.domicilio
                          : undefined
                      }
                    />
                  </View>
                </>
              )}

              {/* Submit */}
              <TouchableOpacity
                onPress={() => handleSubmit()}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Siguiente</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      )}
    </Formik>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 6,
    marginTop: 6,
    overflow: "hidden",
  },
  button: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#0b79ff",
    borderRadius: 8,
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "700" },
});
