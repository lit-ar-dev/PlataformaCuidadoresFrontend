import React, { useCallback, useEffect, useState } from "react";
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import {
  ActivityIndicator,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/src/components/themed-text";
import { ThemedView } from "@/src/components/themed-view";
import TextInputField from "@/src/components/ui/text-input-field";

import { getRoles, Rol } from "@/src/api/auth";
import { useThemeColor } from "@/src/hooks/use-theme-color";
import { router } from "expo-router";

export default function Step3() {
  const { control, trigger, setValue } = useFormContext();
  const rolesId =
    (useWatch({ control, name: "rolesId" }) as number[] | undefined) ?? [];

  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // tokens semánticos
  const bg = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tint = useThemeColor({}, "tint");
  const cardBg = useThemeColor(
    { light: "#f2f2f2", dark: "#07101a" },
    "background"
  );
  const inputBg = useThemeColor(
    { light: "#fff", dark: "#07101a" },
    "background"
  );
  const borderColor = useThemeColor(
    { light: "#e5e7eb", dark: "#263144" },
    "text"
  );
  const placeholderColor = useThemeColor(
    { light: "#9ca3af", dark: "#6b7280" },
    "text"
  );
  const danger = useThemeColor({}, "danger");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getRoles()
      .then((r) => {
        if (mounted) setRoles(Array.isArray(r) ? r : []);
      })
      .catch((e) => {
        console.error(e);
        if (mounted) setError("No se pudieron cargar los roles");
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  function selectRole(id: number) {
    const idNum = Number(id);
    const current = Array.isArray(rolesId) ? rolesId.slice() : [];
    const idx = current.indexOf(idNum);

    if (idx === -1) {
      // add
      const next = [...current, idNum];
      setValue("rolesId", next, { shouldValidate: true, shouldDirty: true });
    } else {
      // remove
      const next = current.filter((x) => x !== idNum);
      setValue("rolesId", next, { shouldValidate: true, shouldDirty: true });
    }
  }

  const goNext = useCallback(async () => {
    const toCheck: string[] = ["rolesId"];
    if (Array.isArray(rolesId) && rolesId.includes(1)) {
      toCheck.push("cliente.domicilio");
    }
    if (Array.isArray(rolesId) && rolesId.includes(3)) {
      toCheck.push("cuidador.descripcion");
    }

    const ok = await trigger(toCheck);
    if (ok) router.push("./review");
  }, [router, trigger]);

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="title" style={styles.title}>
            Seleccioná un rol
          </ThemedText>

          {loading ? (
            <ActivityIndicator
              size="small"
              color={tint}
              style={{ marginVertical: 8 }}
            />
          ) : error ? (
            <ThemedText style={[styles.error, { marginVertical: 8 }]}>
              {error}
            </ThemedText>
          ) : (
            <View style={styles.rolesRow}>
              {roles.map((r) => {
                const selected = rolesId.includes(r.id);
                return (
                  <TouchableOpacity
                    key={r.id}
                    style={[
                      styles.roleCard,
                      {
                        backgroundColor: selected ? tint : cardBg,
                        borderColor: selected ? tint : borderColor,
                      },
                    ]}
                    onPress={() => selectRole(r.id)}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <ThemedText
                      style={[
                        styles.roleText,
                        selected ? { color: bg } : { color: textColor },
                      ]}
                    >
                      {r.nombre}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={styles.formSection}>
            {/* Si está seleccionado el rol Cliente (id === 1) */}
            {rolesId.includes(1) && (
              <View>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Datos de cliente
                </ThemedText>

                <Controller
                  control={control}
                  name="cliente.domicilio"
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState,
                  }) => (
                    <TextInputField
                      label="Domicilio"
                      placeholder="Calle 123, Piso 2"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value ?? ""}
                      error={fieldState.error?.message}
                      editable
                      inputStyle={{
                        backgroundColor: inputBg,
                        borderColor,
                        borderWidth: 1,
                        color: textColor,
                      }}
                      placeholderTextColor={placeholderColor}
                    />
                  )}
                />
              </View>
            )}

            {/* Si está seleccionado el rol Cuidador (id === 3) */}
            {rolesId.includes(3) && (
              <View>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Datos de cuidador
                </ThemedText>

                <Controller
                  control={control}
                  name="cuidador.descripcion"
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState,
                  }) => (
                    <TextInputField
                      label="Descripción"
                      placeholder="Contanos tu experiencia, estilo de trabajo..."
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value ?? ""}
                      error={fieldState.error?.message}
                      multiline
                      numberOfLines={4}
                      inputStyle={{
                        borderWidth: 1,
                        minHeight: 90,
                        textAlignVertical: "top",
                      }}
                      placeholderTextColor={placeholderColor}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="cuidador.tags"
                  render={({ field: { onChange, value }, fieldState }) => (
                    <TextInputField
                      label="Tags (separados por comas)"
                      placeholder="ej: niñera, cuidado personas mayores"
                      onChangeText={(text) => {
                        const arr = text
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean);
                        onChange(arr.length ? arr : null);
                      }}
                      value={(value && (value as string[]).join(", ")) ?? ""}
                      error={fieldState.error?.message}
                      editable
                      inputStyle={{
                        borderColor,
                        borderWidth: 1,
                      }}
                      placeholderTextColor={placeholderColor}
                    />
                  )}
                />

                <ExperienceField control={control} />
                <FormationField control={control} />
              </View>
            )}

            {/* hint cuando no hay rol seleccionado */}
            {rolesId.length === 0 && (
              <ThemedText style={[styles.hint, { color: placeholderColor }]}>
                Seleccioná al menos un rol para completar su formulario
              </ThemedText>
            )}

            <Button title="Siguiente" onPress={goNext} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

/** ----- Subcomponent: experiencia (useFieldArray) ----- */
function ExperienceField({ control }: { control: any }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "cuidador.experiencia",
  });

  const inputBg = useThemeColor(
    { light: "#fff", dark: "#07101a" },
    "background"
  );
  const borderColor = useThemeColor(
    { light: "#e5e7eb", dark: "#263144" },
    "text"
  );
  const textColor = useThemeColor({}, "text");
  const tint = useThemeColor({}, "tint");
  const placeholderColor = useThemeColor(
    { light: "#9ca3af", dark: "#6b7280" },
    "text"
  );

  return (
    <View style={{ marginTop: 12 }}>
      <ThemedText style={styles.label}>Experiencia</ThemedText>

      {fields.map((f, idx) => (
        <Controller
          key={f.id}
          control={control}
          name={`cuidador.experiencia.${idx}`}
          render={({ field: { onChange, value } }) => (
            <View style={styles.experienceRow}>
              <TextInputField
                placeholder={`Experiencia ${idx + 1}`}
                onChangeText={onChange}
                value={value ?? ""}
                inputStyle={{
                  backgroundColor: inputBg,
                  borderColor,
                  borderWidth: 1,
                  color: textColor,
                  flex: 1,
                }}
                placeholderTextColor={placeholderColor}
              />

              <TouchableOpacity
                onPress={() => remove(idx)}
                style={[styles.removeBtn]}
                activeOpacity={0.85}
                accessibilityRole="button"
              >
                <ThemedText style={styles.removeBtnText}>Eliminar</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        />
      ))}

      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: tint }]}
        onPress={() => append("")}
        activeOpacity={0.85}
      >
        <ThemedText style={styles.addBtnText}>Agregar experiencia</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

function FormationField({ control }: { control: any }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "cuidador.formacion",
  });

  const inputBg = useThemeColor(
    { light: "#fff", dark: "#07101a" },
    "background"
  );
  const borderColor = useThemeColor(
    { light: "#e5e7eb", dark: "#263144" },
    "text"
  );
  const textColor = useThemeColor({}, "text");
  const tint = useThemeColor({}, "tint");
  const placeholderColor = useThemeColor(
    { light: "#9ca3af", dark: "#6b7280" },
    "text"
  );

  return (
    <View style={{ marginTop: 12 }}>
      <ThemedText style={styles.label}>Formación</ThemedText>

      {fields.map((f, idx) => (
        <Controller
          key={f.id}
          control={control}
          name={`cuidador.formacion.${idx}`}
          render={({ field: { onChange, value } }) => (
            <View style={styles.formationRow}>
              <TextInputField
                placeholder={`Formación ${idx + 1}`}
                onChangeText={onChange}
                value={value ?? ""}
                inputStyle={{
                  backgroundColor: inputBg,
                  borderColor,
                  borderWidth: 1,
                  color: textColor,
                  flex: 1,
                }}
                placeholderTextColor={placeholderColor}
              />

              <TouchableOpacity
                onPress={() => remove(idx)}
                style={[styles.removeBtn]}
                activeOpacity={0.85}
                accessibilityRole="button"
              >
                <ThemedText style={styles.removeBtnText}>Eliminar</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        />
      ))}

      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: tint }]}
        onPress={() => append("")}
        activeOpacity={0.85}
      >
        <ThemedText style={styles.addBtnText}>Agregar formación</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { marginBottom: 16 },
  scrollContent: { paddingBottom: 32 },
  rolesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  roleCard: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  roleText: {
    fontWeight: "500",
  },
  roleTextSelected: {
    color: "#fff",
  },
  formSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    marginBottom: 6,
  },
  hint: {
    marginTop: 8,
  },
  addBtn: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  experienceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  formationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  removeBtn: {
    marginLeft: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  removeBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  error: {
    color: "#ef4444",
  },
});
