import ModalPicker from "@/src/components/ui/modal-picker";
import TextInputField from "@/src/components/ui/text-input-field";
import { ThemedText } from "@/src/components/ui/themed-text";
import { ThemedView } from "@/src/components/ui/themed-view";
import { useCatalogs } from "@/src/hooks/use-catalogs";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
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
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SafeAreaView } from "react-native-safe-area-context";

/** ----- Helpers ----- */
function formatDisplay(value: string) {
  if (!value) return "";
  const [y, m, d] = value.split("-");
  const date = new Date(Number(y), Number(m) - 1, Number(d)); // construye en zona local
  const tzOffsetMs = date.getTimezoneOffset() * 60000; // minutos -> ms
  const localDate = new Date(date.getTime() + tzOffsetMs);
  return localDate.toLocaleDateString();
}

/**
 * Normaliza distintos shapes de items (por si ModalPicker o la API usan label/value en vez de id/nombre).
 * Devuelve siempre [{ id: number, nombre: string }]
 */
const normalizeItems = (items: any[] | undefined) => {
  if (!Array.isArray(items)) return [];
  return items.map((it) => {
    if (it == null) return { id: NaN, nombre: "" };
    // soporta: { id, nombre }  |  { value, label }  |  primitivo
    const id = it.id ?? it.value ?? it.key ?? it;
    const nombre = it.nombre ?? it.label ?? it.name ?? String(it);
    return { id: Number(id), nombre: String(nombre) };
  });
};

/** ----- Component ----- */
export default function Step2() {
  const router = useRouter();
  const { control, trigger, setValue } = useFormContext();

  const {
    provincias: provinciasRaw,
    ciudades: ciudadesRaw,
    generos: generosRaw,
    loading,
    error,
    loadCiudades,
  } = useCatalogs();

  // pickers UI
  const [showProvinciaPicker, setShowProvinciaPicker] = useState(false);
  const [showCiudadPicker, setShowCiudadPicker] = useState(false);
  const [showGeneroPicker, setShowGeneroPicker] = useState(false);

  // datepicker
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  // valores del formulario (watch)
  const provinciaId = useWatch({ name: "persona.provinciaId", control });

  // normalizados para los pickers
  const provincias = useMemo(
    () => normalizeItems(provinciasRaw),
    [provinciasRaw]
  );
  const ciudades = useMemo(() => normalizeItems(ciudadesRaw), [ciudadesRaw]);
  const generos = useMemo(() => normalizeItems(generosRaw), [generosRaw]);

  // cargar ciudades cuando cambie la provincia (delegado a useCatalogs)
  useEffect(() => {
    const idNum = provinciaId ? Number(provinciaId) : NaN;
    if (!Number.isFinite(idNum) || Number.isNaN(idNum)) {
      loadCiudades(undefined).catch(() => {});
      return;
    }
    loadCiudades(idNum).catch(() => {});
  }, [provinciaId, loadCiudades]);

  // seleccion anterior para mostrar label
  const selectedProvinciaNombre = (provinciaId: number) => {
    const id = Number(provinciaId);
    return provincias.find((p) => p.id === id)?.nombre ?? "";
  };

  const selectedCiudadNombre = (ciudadId: number) => {
    const id = Number(ciudadId);
    return ciudades.find((c) => c.id === id)?.nombre ?? "";
  };

  const selectedGeneroNombre = (generoId: number) => {
    const id = Number(generoId);
    return generos.find((g) => g.id === id)?.nombre ?? "";
  };

  const goNext = useCallback(async () => {
    const toCheck = [
      "persona.nombre",
      "persona.apellido",
      "persona.fechaDeNacimiento",
      "persona.telefono",
      "persona.provinciaId",
      "persona.ciudadId",
    ];
    const ok = await trigger(toCheck);
    if (ok) router.push("./step3");
  }, [provinciaId, router, trigger]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        {loading && <ActivityIndicator />}
        {error && <ThemedText style={{ color: "red" }}>{error}</ThemedText>}

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "padding"}
          style={{ flex: 1 }}
          // si tenés un header fijo (expo-router) ajustá este offset (ej: 80)
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
              {/* Nombre */}
              <Controller
                control={control}
                name="persona.nombre"
                render={({
                  field: { onChange, onBlur, value },
                  fieldState,
                }) => (
                  <TextInputField
                    label="Nombre"
                    placeholder="Nombre"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    error={fieldState.error?.message}
                  />
                )}
              />

              {/* Apellido */}
              <Controller
                control={control}
                name="persona.apellido"
                render={({
                  field: { onChange, onBlur, value },
                  fieldState,
                }) => (
                  <TextInputField
                    label="Apellido"
                    placeholder="Apellido"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    error={fieldState.error?.message}
                  />
                )}
              />

              {/* Fecha de nacimiento */}
              <Controller
                control={control}
                name="persona.fechaDeNacimiento"
                render={({ field: { onChange, value }, fieldState }) => {
                  const parsedDate = value
                    ? (() => {
                        // value puede ser "YYYY-MM-DD" o algo vacío
                        const [y, m, d] = String(value).split("-");
                        return new Date(Number(y), Number(m) - 1, Number(d));
                      })()
                    : new Date(2000, 0, 1);

                  return (
                    <View>
                      <TouchableOpacity
                        onPress={() => setDatePickerVisible(true)}
                        accessibilityRole="button"
                      >
                        <TextInputField
                          label="Fecha de nacimiento"
                          placeholder="DD/MM/AAAA"
                          value={value ? formatDisplay(value) : ""}
                          editable={false}
                          error={fieldState.error?.message}
                        />
                      </TouchableOpacity>

                      <DateTimePickerModal
                        isVisible={isDatePickerVisible}
                        mode="date"
                        display={
                          Platform.OS === "android" ? "spinner" : "default"
                        }
                        date={parsedDate}
                        maximumDate={new Date()}
                        minimumDate={new Date(1900, 0, 1)}
                        onConfirm={(pickedDate: Date) => {
                          const tzOffsetMs =
                            pickedDate.getTimezoneOffset() * 60000; // minutos -> ms
                          const localDate = new Date(
                            pickedDate.getTime() - tzOffsetMs
                          );

                          // 2) extraer componentes desde localDate (ya en la zona local)
                          const y = localDate.getFullYear();
                          const m = String(localDate.getMonth() + 1).padStart(
                            2,
                            "0"
                          );
                          const d = String(localDate.getDate()).padStart(
                            2,
                            "0"
                          );
                          const fechaSolo = `${y}-${m}-${d}`;
                          console.log(
                            "pickedDate=",
                            pickedDate,
                            "fechaSolo=",
                            fechaSolo
                          );
                          onChange(fechaSolo);
                          setDatePickerVisible(false);
                          // revalidar
                          trigger(["persona.fechaDeNacimiento"]).catch(
                            () => {}
                          );
                        }}
                        onCancel={() => setDatePickerVisible(false)}
                      />
                    </View>
                  );
                }}
              />

              {/* Teléfono */}
              <Controller
                control={control}
                name="persona.telefono"
                render={({
                  field: { onChange, onBlur, value },
                  fieldState,
                }) => (
                  <TextInputField
                    label="Teléfono"
                    placeholder="Número de teléfono"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    keyboardType="phone-pad"
                    error={fieldState.error?.message}
                  />
                )}
              />

              {/* Provincia */}
              <Controller
                control={control}
                name="persona.provinciaId"
                render={({ field: { onChange, value }, fieldState }) => (
                  <View>
                    <TouchableOpacity
                      onPress={() => setShowProvinciaPicker(true)}
                      accessibilityRole="button"
                    >
                      <TextInputField
                        label="Provincia"
                        placeholder="Seleccioná provincia"
                        value={selectedProvinciaNombre(value) || ""}
                        editable={false}
                        error={fieldState.error?.message}
                      />
                    </TouchableOpacity>

                    <ModalPicker
                      visible={showProvinciaPicker}
                      items={provincias}
                      onClose={() => setShowProvinciaPicker(false)}
                      onSelect={(item: any) => {
                        const id = Number(item?.id ?? item);
                        onChange(id);
                        // limpio ciudad anterior
                        setValue("persona.ciudadId", undefined);
                        // revalidar
                        trigger([
                          "persona.provinciaId",
                          "persona.ciudadId",
                        ]).catch(() => {});
                        setShowProvinciaPicker(false);
                      }}
                    />
                  </View>
                )}
              />

              {/* Ciudad */}
              <Controller
                control={control}
                name="persona.ciudadId"
                render={({ field: { onChange, value }, fieldState }) => {
                  if (!provinciaId) {
                    return (
                      <TextInputField
                        label="Ciudad"
                        placeholder="Seleccioná primero una provincia"
                        value={""}
                        editable={false}
                        error={null}
                      />
                    );
                  }

                  return (
                    <View>
                      <TouchableOpacity
                        onPress={() => setShowCiudadPicker(true)}
                        accessibilityRole="button"
                      >
                        <TextInputField
                          label="Ciudad"
                          placeholder="Seleccioná ciudad"
                          value={selectedCiudadNombre(value) || ""}
                          editable={false}
                          error={fieldState.error?.message}
                        />
                      </TouchableOpacity>

                      <ModalPicker
                        visible={showCiudadPicker}
                        items={ciudades}
                        onClose={() => setShowCiudadPicker(false)}
                        onSelect={(item: any) => {
                          const id = Number(item?.id ?? item);
                          onChange(id);
                          trigger(["persona.ciudadId"]).catch(() => {});
                          setShowCiudadPicker(false);
                        }}
                      />
                    </View>
                  );
                }}
              />

              {/* Género */}
              <Controller
                control={control}
                name="persona.generoId"
                render={({ field: { onChange, value }, fieldState }) => (
                  <View>
                    <TouchableOpacity
                      onPress={() => setShowGeneroPicker(true)}
                      accessibilityRole="button"
                    >
                      <TextInputField
                        label="Género"
                        placeholder="Seleccioná género"
                        value={selectedGeneroNombre(value) || ""}
                        editable={false}
                        error={fieldState.error?.message}
                      />
                    </TouchableOpacity>

                    <ModalPicker
                      visible={showGeneroPicker}
                      items={generos}
                      onClose={() => setShowGeneroPicker(false)}
                      onSelect={(item: any) => {
                        const id = Number(item?.id ?? item);
                        onChange(id);
                        trigger(["persona.generoId"]).catch(() => {});
                        setShowGeneroPicker(false);
                      }}
                    />
                  </View>
                )}
              />

              <Button title="Siguiente" onPress={goNext} />
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { marginBottom: 16 },
});
