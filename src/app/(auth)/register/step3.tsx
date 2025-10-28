import TextInputField from "@/src/components/ui/text-input-field";
import { ThemedText } from "@/src/components/ui/themed-text";
import { ThemedView } from "@/src/components/ui/themed-view";
import { useCatalogs } from "@/src/hooks/use-catalogs";
import { useThemeColor } from "@/src/hooks/use-theme-color";
import { router } from "expo-router";
import React, { useCallback } from "react";
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import {
  ActivityIndicator,
  Button,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Step3() {
  const { control, trigger, setValue } = useFormContext();
  const rolesId =
    (useWatch({ control, name: "rolesId" }) as string[] | undefined) ?? [];
  console.log("rolesId=", rolesId);

  const { roles, loading, error } = useCatalogs();
  console.log("roles=", roles);
  const hasCliente = hasRoleByName(roles, rolesId, "Cliente");
  const hasCuidador = hasRoleByName(roles, rolesId, "Cuidador");

  // tokens semánticos
  const bg = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tint = useThemeColor({}, "tint");
  const cardBg = useThemeColor({}, "inputBackground");
  const inputBg = useThemeColor({}, "inputBackground");
  const borderColor = useThemeColor({}, "border");
  const placeholderColor = useThemeColor({}, "placeholder");
  const danger = useThemeColor({}, "danger");

  function hasRoleByName(
    roles: { id: string; nombre: string }[],
    rolesId: string[],
    name: string
  ) {
    const role = roles.find((r) => r.nombre === name);
    return !!role && rolesId.includes(role.id);
  }

  function selectRole(id: string) {
    console.log("selectRole id=", id);
    const current = Array.isArray(rolesId) ? rolesId.slice() : [];
    console.log("current rolesId=", current);
    const idx = current.indexOf(id);
    console.log(rolesId.includes("Cliente"));

    if (idx === -1) {
      // add
      const next = [...current, id];
      setValue("rolesId", next, { shouldValidate: true, shouldDirty: true });

      // inicializar campos dependientes si es necesario
      if (hasCliente) {
        // sólo si no existe ya (evita sobreescribir)
        const cur =
          (control?._getWatch ? control._getWatch("cliente") : undefined) ??
          undefined;
        // más simple: comprobar el valor actual
        const existing =
          (control && (control as any).getValues?.("cliente")) ?? undefined;
        if (!existing || existing.domicilio === undefined) {
          setValue("cliente.domicilio", "", {
            shouldValidate: true,
            shouldDirty: true,
          });
        }
      }
      if (hasCuidador) {
        const existing =
          (control && (control as any).getValues?.("cuidador")) ?? undefined;
        if (!existing || existing.descripcion === undefined) {
          setValue("cuidador.descripcion", "", {
            shouldValidate: true,
            shouldDirty: true,
          });
        }
      }
    } else {
      // remove
      const next = current.filter((x) => x !== id);
      setValue("rolesId", next, { shouldValidate: true, shouldDirty: true });

      // limpiar los datos del rol si se quitó
      if (hasCliente) {
        setValue("cliente", undefined, {
          shouldValidate: true,
          shouldDirty: true,
        });
        // o limpiar solo el campo: setValue('cliente.domicilio', undefined)
      }
      if (hasCuidador) {
        setValue("cuidador", undefined, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    }
  }

  const goNext = useCallback(async () => {
    const toCheck: string[] = ["rolesId"];
    if (Array.isArray(rolesId) && hasCliente) {
      toCheck.push("cliente.domicilio");
    }
    if (Array.isArray(rolesId) && hasCuidador) {
      toCheck.push("cuidador.descripcion");
    }

    const ok = await trigger(toCheck);
    if (ok) router.push("./review");
  }, [router, trigger, hasCliente, hasCuidador]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "padding"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 80}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={{
                padding: 20,
                flexGrow: 1,
                paddingBottom: Platform.OS === "ios" ? 40 : 140,
              }}
              keyboardShouldPersistTaps="handled"
            >
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
                {hasCliente && (
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
                {hasCuidador && (
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
                          placeholder="Contanos un poco de vos..."
                          onChangeText={onChange}
                          onBlur={onBlur}
                          value={value ?? ""}
                          error={fieldState.error?.message}
                          multiline
                          numberOfLines={4}
                          inputStyle={{
                            backgroundColor: inputBg,
                            borderColor,
                            borderWidth: 1,
                            textAlignVertical: "top",
                            color: textColor,
                            padding: 10,
                            borderRadius: 8,
                          }}
                          placeholderTextColor={placeholderColor}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="cuidador.tags"
                      render={({ field: { onChange, value }, fieldState }) => (
                        <View>
                          <ThemedText style={styles.label}>Tags</ThemedText>
                          <TagInput
                            value={(value as string[] | null) ?? null}
                            onChange={(next) => onChange(next)}
                            placeholder="ej: niñera, cuidado personas mayores"
                            error={fieldState.error?.message}
                          />
                        </View>
                      )}
                    />

                    {/* Separa los bloques para evitar superposición */}
                    <View style={{ marginTop: 12, marginBottom: 8 }}>
                      <ExperienceField control={control} />
                    </View>

                    <View style={{ marginTop: 12, marginBottom: 8 }}>
                      <FormationField control={control} />
                    </View>
                  </View>
                )}

                {/* hint cuando no hay rol seleccionado */}
                {rolesId.length === 0 && (
                  <ThemedText
                    style={[styles.hint, { color: placeholderColor }]}
                  >
                    Seleccioná al menos un rol para completar su formulario
                  </ThemedText>
                )}

                {rolesId.length !== 0 && (
                  <Button title="Siguiente" onPress={goNext} />
                )}
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </ThemedView>
    </SafeAreaView>
  );
}

/** ----- Subcomponent: experiencia (useFieldArray) ----- */
function ExperienceField({ control }: { control: any }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "cuidador.experiencia",
  });

  const inputBg = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");
  const tint = useThemeColor({}, "tint");
  const placeholderColor = useThemeColor({}, "placeholder");

  return (
    <View style={{ marginTop: 12 }}>
      <ThemedText style={styles.label}>Experiencia</ThemedText>

      {fields.map((f, idx) => (
        <Controller
          key={f.id}
          control={control}
          name={`cuidador.experiencia.${idx}`}
          render={({ field: { onChange, value } }) => (
            <ThemedView style={styles.experienceRow}>
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
            </ThemedView>
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

/** TagInput: convierte texto separado por , o ; en chips y permite eliminarlos */
function TagInput({
  value,
  onChange,
  placeholder,
  error,
}: {
  value: string[] | null;
  onChange: (v: string[] | null) => void;
  placeholder?: string;
  error?: string | null;
}) {
  const [text, setText] = React.useState("");
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "inputBackground");
  const tint = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "border");
  const placeholderColor = useThemeColor({}, "placeholder");

  const tags = Array.isArray(value) ? value.slice() : [];

  const pushTagsFromText = (t: string) => {
    const parts = t
      .split(/[;,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    const next = [...tags, ...parts];
    onChange(next.length ? next : null);
  };

  const handleChangeText = (t: string) => {
    // if user typed a separator, flush parts except last
    if (/[;,]/.test(t)) {
      const parts = t.split(/[;,]/);
      const toAdd = parts
        .slice(0, -1)
        .map((s) => s.trim())
        .filter(Boolean);
      const last = parts[parts.length - 1] ?? "";
      if (toAdd.length) {
        const next = [...tags, ...toAdd];
        onChange(next.length ? next : null);
      }
      setText(last);
    } else {
      setText(t);
    }
  };

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (trimmed) {
      pushTagsFromText(trimmed);
      setText("");
    }
  };

  const removeTag = (idx: number) => {
    const next = tags.filter((_, i) => i !== idx);
    onChange(next.length ? next : null);
  };

  return (
    <ThemedView>
      <ThemedView style={[styles.tagContainer, { borderColor }]}>
        {tags.map((tag, idx) => (
          <TouchableOpacity
            key={`${tag}-${idx}`}
            style={[styles.tagChip, { backgroundColor: backgroundColor }]}
            onPress={() => removeTag(idx)}
            activeOpacity={0.8}
          >
            <ThemedText>{tag}</ThemedText>
          </TouchableOpacity>
        ))}

        <TextInputField
          style={[styles.tagInput, { color: useThemeColor({}, "text") }]}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          value={text}
          onChangeText={handleChangeText}
          onSubmitEditing={handleSubmit}
        />
      </ThemedView>
      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
    </ThemedView>
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
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    padding: 6,
    gap: 8,
  },
  tagChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    marginRight: 8,
  },
  tagInput: { minWidth: 120, padding: 6 },
});
