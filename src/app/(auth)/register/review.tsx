import React, { useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Button, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getRoles, register, Rol } from "@/src/api/auth";
import { ThemedText } from "@/src/components/themed-text";
import { ThemedView } from "@/src/components/themed-view";
import { useRouter } from "expo-router";

const formatDisplay = (isoDateString?: string | null) => {
  if (!isoDateString) return "";
  const parts = String(isoDateString).split("-");
  if (parts.length !== 3) return isoDateString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

export default function Review() {
  const router = useRouter();
  const { control } = useFormContext();
  const values = useWatch({ control }) as any;

  const [rolesMap, setRolesMap] = useState<Record<number, string>>({});
  useEffect(() => {
    let mounted = true;
    getRoles()
      .then((r) => {
        if (!mounted) return;
        if (Array.isArray(r)) {
          const map: Record<number, string> = {};
          r.forEach((x: Rol) => (map[x.id] = x.nombre));
          setRolesMap(map);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const usuario = values?.usuario ?? {};
  const persona = values?.persona ?? {};
  const rolesId: number[] = values?.rolesId ?? [];
  const cliente = values?.cliente ?? {};
  const cuidador = values?.cuidador ?? {};

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          <ThemedText type="title" style={styles.title}>
            Revisión de datos
          </ThemedText>

          <Section title="Usuario">
            <Row label="Email" value={usuario.email ?? ""} />
            {/* No mostrar contraseñas */}
          </Section>

          <Section title="Persona">
            <Row label="Nombre" value={persona.nombre ?? ""} />
            <Row label="Apellido" value={persona.apellido ?? ""} />
            <Row
              label="Fecha de nacimiento"
              value={formatDisplay(persona.fechaDeNacimiento)}
            />
            <Row label="Teléfono" value={persona.telefono ?? ""} />
            <Row
              label="Provincia ID"
              value={String(persona.provinciaId ?? "")}
            />
            <Row label="Ciudad ID" value={String(persona.ciudadId ?? "")} />
            <Row label="Género ID" value={String(persona.generoId ?? "")} />
          </Section>

          <Section title="Roles">
            {rolesId.length === 0 ? (
              <ThemedText>Ningún rol seleccionado</ThemedText>
            ) : (
              rolesId.map((id) => (
                <ThemedText key={id} style={styles.itemText}>
                  {rolesMap[id] ?? `ID ${id}`}
                </ThemedText>
              ))
            )}
          </Section>

          {rolesId.includes(1) && (
            <Section title="Datos de cliente">
              <Row label="Domicilio" value={cliente.domicilio ?? ""} />
            </Section>
          )}

          {rolesId.includes(3) && (
            <Section title="Datos de cuidador">
              <Row label="Descripción" value={cuidador.descripcion ?? ""} />
              <Row label="Formación" value={cuidador.formacion ?? ""} />
              <Row
                label="Tags"
                value={
                  (Array.isArray(cuidador.tags) && cuidador.tags.join(", ")) ||
                  ""
                }
              />
              <View style={{ marginTop: 8 }}>
                <ThemedText style={styles.subLabel}>Experiencia</ThemedText>
                {(Array.isArray(cuidador.experiencia) &&
                  cuidador.experiencia.map((e: string, idx: number) => (
                    <ThemedText key={idx} style={styles.itemText}>
                      {e}
                    </ThemedText>
                  ))) || <ThemedText style={styles.itemText}>-</ThemedText>}
              </View>
            </Section>
          )}

          <View style={{ marginTop: 16 }}>
            <Button title="Volver" onPress={() => router.back()} />
          </View>

          <View style={{ marginTop: 8 }}>
            <Button
              title="Confirmar y continuar"
              onPress={async () => {
                console.log("Revisar/confirmar:", values);
                await register(values);
              }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <ThemedText type="subtitle" style={{ marginBottom: 6 }}>
        {title}
      </ThemedText>
      <View>{children}</View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: 6 }}>
      <ThemedText style={{ fontSize: 13, color: "#6b7280" }}>
        {label}
      </ThemedText>
      <ThemedText style={{ marginTop: 2 }}>{value || "-"}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { marginBottom: 12 },
  subLabel: { fontSize: 13, marginBottom: 6 },
  itemText: { marginLeft: 6 },
});
