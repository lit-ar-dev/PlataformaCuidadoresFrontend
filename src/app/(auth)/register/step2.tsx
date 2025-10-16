import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import DateTimePickerModal from "react-native-modal-datetime-picker";

import { ThemedView } from "@/src/components/themed-view";
import ModalPicker from "@/src/components/ui/modal-picker";
import TextInputField from "@/src/components/ui/text-input-field";

import {
  getCiudadesByProvincia,
  getGeneros,
  getProvincias,
} from "@/src/api/utilidades";

/** ----- Helpers ----- */
const isoFromDate = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const formatDisplay = (isoDateString?: string | null) => {
  if (!isoDateString) return "";
  const parts = String(isoDateString).split("-");
  if (parts.length !== 3) return isoDateString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

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
  const { control, trigger, watch, setValue } = useFormContext();

  const colorScheme = useColorScheme(); // 'dark' | 'light' | null
  const isDark = colorScheme === "dark";

  // datos
  const [provinciasRaw, setProvinciasRaw] = useState<any[]>([]);
  const [ciudadesRaw, setCiudadesRaw] = useState<any[]>([]);
  const [generosRaw, setGenerosRaw] = useState<any[]>([]);

  // pickers UI
  const [showProvinciaPicker, setShowProvinciaPicker] = useState(false);
  const [showCiudadPicker, setShowCiudadPicker] = useState(false);
  const [showGeneroPicker, setShowGeneroPicker] = useState(false);

  // datepicker
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  // valores del formulario (watch)
  const provinciaId = watch("persona.provinciaId");
  const ciudadId = watch("persona.ciudadId");
  const generoId = watch("persona.generoId");

  // normalizados para los pickers
  const provincias = useMemo(
    () => normalizeItems(provinciasRaw),
    [provinciasRaw]
  );
  const ciudades = useMemo(() => normalizeItems(ciudadesRaw), [ciudadesRaw]);
  const generos = useMemo(() => normalizeItems(generosRaw), [generosRaw]);

  // obtener provincias y géneros al montar
  useEffect(() => {
    (async () => {
      try {
        const [p, g] = await Promise.all([getProvincias(), getGeneros()]);
        setProvinciasRaw(Array.isArray(p) ? p : []);
        setGenerosRaw(Array.isArray(g) ? g : []);
      } catch (err) {
        // opcional: log o toast
        console.warn("Error al cargar provincias/géneros", err);
      }
    })();
  }, []);

  // cargar ciudades cuando cambie la provincia (provinciaId puede venir string|number|undefined)
  useEffect(() => {
    const idNum = provinciaId ? Number(provinciaId) : NaN;
    if (!Number.isFinite(idNum) || Number.isNaN(idNum)) {
      setCiudadesRaw([]);
      return;
    }
    let mounted = true;
    getCiudadesByProvincia(idNum)
      .then((c) => {
        if (mounted) setCiudadesRaw(Array.isArray(c) ? c : []);
      })
      .catch((err) => {
        console.warn("Error al cargar ciudades", err);
        if (mounted) setCiudadesRaw([]);
      });
    return () => {
      mounted = false;
    };
  }, [provinciaId]);

  // seleccion anterior para mostrar label
  const selectedProvinciaNombre = useMemo(() => {
    const id = Number(provinciaId);
    return provincias.find((p) => p.id === id)?.nombre ?? "";
  }, [provinciaId, provincias]);

  const selectedCiudadNombre = useMemo(() => {
    const id = Number(ciudadId);
    return ciudades.find((c) => c.id === id)?.nombre ?? "";
  }, [ciudadId, ciudades]);

  const selectedGeneroNombre = useMemo(() => {
    const id = Number(generoId);
    return generos.find((g) => g.id === id)?.nombre ?? "";
  }, [generoId, generos]);

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
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          {/* Nombre */}
          <Controller
            control={control}
            name="persona.nombre"
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
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
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
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
                    display={Platform.OS === "android" ? "spinner" : "default"}
                    date={parsedDate}
                    maximumDate={new Date()}
                    minimumDate={new Date(1900, 0, 1)}
                    onConfirm={(pickedDate: Date) => {
                      onChange(isoFromDate(pickedDate));
                      setDatePickerVisible(false);
                      // revalidar
                      trigger(["persona.fechaDeNacimiento"]).catch(() => {});
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
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
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
                    value={
                      selectedProvinciaNombre || (value ? String(value) : "")
                    }
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
                    trigger(["persona.provinciaId", "persona.ciudadId"]).catch(
                      () => {}
                    );
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
                      value={
                        selectedCiudadNombre || (value ? String(value) : "")
                      }
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

          {/* Género (ahora con Controller para que RHF controle) */}
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
                    value={selectedGeneroNombre || (value ? String(value) : "")}
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
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { marginBottom: 16 },
});

export const options = {
  title: "Registro — Persona",
};
