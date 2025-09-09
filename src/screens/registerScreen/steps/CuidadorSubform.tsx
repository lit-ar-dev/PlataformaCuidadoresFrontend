// src/steps/roles/CuidadorSubform.tsx
import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { getIn } from "formik";
import TextInputField from "../../../components/TextInputField";
import { useCatalogs } from "../../../hooks/useCatalogs";

type Tarifa = { precio?: number; servicios?: string[]; grupoId?: number };

export default function CuidadorSubform({
  values,
  setFieldValue,
  errors,
  touched, // opcional, mejor pasar desde Formik para mostrar touched
}: {
  values: any;
  setFieldValue: (field: string, val: any) => void;
  errors: any;
  touched?: any;
}) {
  const { grupos } = useCatalogs();
  const tarifas: Tarifa[] = values.cuidador?.tarifas ?? [];
  const tags: string[] = values.cuidador?.tags ?? [];

  const addTarifa = () => {
    const current: Tarifa[] = values.cuidador?.tarifas ?? [];
    setFieldValue("cuidador.tarifas", [
      ...current,
      { precio: undefined, servicios: [], grupoId: undefined },
    ]);
  };

  const removeTarifa = (index: number) => {
    const current: Tarifa[] = values.cuidador?.tarifas ?? [];
    const copy = current.slice();
    copy.splice(index, 1);
    setFieldValue("cuidador.tarifas", copy);
  };

  const updateTarifaField = (
    index: number,
    field: keyof Tarifa,
    value: any
  ) => {
    const current: Tarifa[] = values.cuidador?.tarifas ?? [];
    const copy = current.slice();
    copy[index] = { ...(copy[index] ?? {}), [field]: value };
    setFieldValue("cuidador.tarifas", copy);
  };

  // helper: errores anidados con Formik
  const tarifaError = (index: number, field: string) =>
    getIn(errors, `cuidador.tarifas[${index}].${field}`);

  const tarifaTouched = (index: number, field: string) =>
    getIn(touched, `cuidador.tarifas[${index}].${field}`);

  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ fontWeight: "600", marginBottom: 8 }}>
        Datos del cuidador
      </Text>

      <TextInputField
        label="Descripción"
        placeholder="Ej: Soy un cuidador de adultos mayores"
        value={values.cuidador?.descripcion}
        onChangeText={(t) => setFieldValue("cuidador.descripcion", t)}
        error={errors["cuidador.descripcion"]}
      />

      <TextInputField
        label="Experiencia"
        placeholder="Ej: Trabajé en una residencia de ancianos"
        value={values.cuidador?.experiencia}
        onChangeText={(t) => setFieldValue("cuidador.experiencia", t)}
        error={errors["cuidador.experiencia"]}
      />

      <TextInputField
        label="Formación"
        placeholder="Ej: Curso de cuidado de adultos mayores"
        value={values.cuidador?.formacion}
        onChangeText={(t) => setFieldValue("cuidador.formacion", t)}
        error={errors["cuidador.formacion"]}
      />

      {/* --- Tarifas dinámicas --- */}
      <View style={{ marginTop: 16 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "600" }}>Tarifas</Text>
          <TouchableOpacity onPress={addTarifa} style={{ padding: 6 }}>
            <Text style={{ color: "#0b79ff" }}>+ Agregar tarifa</Text>
          </TouchableOpacity>
        </View>

        {tarifas.length === 0 && (
          <Text style={{ color: "#666", marginTop: 8 }}>
            No agregaste tarifas aún
          </Text>
        )}

        {tarifas.map((t: Tarifa, i: number) => (
          <View
            key={i}
            style={{
              borderWidth: 1,
              borderRadius: 8,
              padding: 10,
              marginTop: 10,
              borderColor: "#ddd",
            }}
          >
            {/* Precio */}
            <TextInput
              placeholder="Precio (ej: 1500)"
              keyboardType="numeric"
              value={
                t.precio !== undefined && t.precio !== null
                  ? String(t.precio)
                  : ""
              }
              onChangeText={(text) => {
                // permitir que el usuario escriba y guardamos número (o undefined)
                const num =
                  text === "" ? undefined : Number(text.replace(",", "."));
                updateTarifaField(i, "precio", num);
              }}
              style={{
                borderWidth: 1,
                borderRadius: 6,
                padding: 8,
                marginBottom: 8,
              }}
            />
            {tarifaError(i, "precio") && (
              <Text style={{ color: "red", marginBottom: 6 }}>
                {tarifaError(i, "precio")}
              </Text>
            )}

            {/* Servicios -> input como coma-separados */}
            <TextInput
              placeholder="Servicios (separados por coma) - ej: baño, medicación"
              value={(t.servicios || []).join(", ")}
              onChangeText={(txt) => {
                const arr = txt
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);
                updateTarifaField(i, "servicios", arr);
              }}
              style={{
                borderWidth: 1,
                borderRadius: 6,
                padding: 8,
                marginBottom: 8,
              }}
            />
            {tarifaError(i, "servicios") && (
              <Text style={{ color: "red", marginBottom: 6 }}>
                {tarifaError(i, "servicios")}
              </Text>
            )}

            {/* GrupoId -> usamos Picker (puedes pasar 'grupos' desde el padre) */}
            <Text style={{ marginBottom: 6 }}>Grupo</Text>
            <View
              style={{
                borderWidth: 1,
                borderRadius: 6,
                overflow: "hidden",
                marginBottom: 8,
              }}
            >
              <Picker
                selectedValue={t.grupoId}
                onValueChange={(val) => updateTarifaField(i, "grupoId", val)}
              >
                <Picker.Item label="Seleccionar grupo..." value={undefined} />
                {grupos.map((g) => (
                  <Picker.Item key={g.id} label={g.nombre} value={g.id} />
                ))}
              </Picker>
            </View>
            {tarifaError(i, "grupoId") && (
              <Text style={{ color: "red", marginBottom: 6 }}>
                {tarifaError(i, "grupoId")}
              </Text>
            )}

            {/* Botón eliminar */}
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity
                onPress={() => removeTarifa(i)}
                style={{ padding: 6 }}
              >
                <Text style={{ color: "crimson" }}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Tags */}
        <Text style={{ marginTop: 6, marginBottom: 6 }}>Tags</Text>
      </View>
    </View>
  );
}
