import { getRoles, register, Rol, uploadFotoUsuario } from "@/src/api/auth";
import { ThemedText } from "@/src/components/ui/themed-text";
import { ThemedView } from "@/src/components/ui/themed-view";
import { useAuth } from "@/src/contexts/AuthContext";
import { useCatalogs } from "@/src/hooks/use-catalogs";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Button, Image, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const formatDisplay = (isoDateString?: string | null) => {
  if (!isoDateString) return "";
  const parts = String(isoDateString).split("-");
  if (parts.length !== 3) return isoDateString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

export default function Review() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { control } = useFormContext();
  const { ciudades, generos, provincias, loadCiudades } = useCatalogs();
  const values = useWatch({ control }) as any;

  console.log("Review values=", values);
  console.log("ciudades=", ciudades);

  const [rolesMap, setRolesMap] = useState<Record<string, string>>({});
  useEffect(() => {
    let mounted = true;
    getRoles()
      .then((r) => {
        if (!mounted) return;
        if (Array.isArray(r)) {
          const map: Record<string, string> = {};
          r.forEach((x: Rol) => (map[x.id] = x.nombre));
          setRolesMap(map);
        }
      })
      .catch(() => {});
    loadCiudades(values?.persona?.provinciaId);
    return () => {
      mounted = false;
    };
  }, []);

  const usuario = values?.usuario ?? {};
  const persona = values?.persona ?? {};
  const usuarioFoto = usuario?.foto ?? undefined;
  console.log("usuarioFoto=", usuarioFoto);
  const cliente = values?.cliente ?? undefined;
  const cuidador = values?.cuidador ?? undefined;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          <Section title="Usuario">
            {usuarioFoto !== undefined ? (
              <Image
                source={{ uri: usuarioFoto.uri }}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 8,
                  marginBottom: 12,
                }}
                resizeMode="cover"
              />
            ) : null}
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
              label="Provincia"
              value={
                provincias?.find(
                  (p: any) => String(p.id) === String(persona.provinciaId)
                )?.nombre ?? String(persona.provinciaId ?? "")
              }
            />
            <Row
              label="Ciudad"
              value={
                ciudades?.find(
                  (c: any) => String(c.id) === String(persona.ciudadId)
                )?.nombre ?? String(persona.ciudadId ?? "")
              }
            />
            <Row
              label="Género"
              value={
                generos?.find(
                  (g: any) => String(g.id) === String(persona.generoId)
                )?.nombre ?? String(persona.generoId ?? "")
              }
            />
          </Section>

          {cliente && (
            <Section title="Datos de cliente">
              <Row label="Domicilio" value={cliente.domicilio ?? ""} />
            </Section>
          )}

          {cuidador && (
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
                const payload = { ...values, usuario: { ...values.usuario } };
                payload.persona.fechaDeNacimiento = new Date(
                  values.persona.fechaDeNacimiento
                ).toISOString();
                delete payload.usuario?.confirmarContraseña;
                const foto = values?.usuario?.foto;
                delete payload.usuario?.foto;
                delete payload.persona?.provinciaId;
                console.log("Register=", payload);
                const usuario = await register(payload);
                console.log("usuario=", usuario);
                signIn(usuario.token);
                const form = new FormData();
                if (foto && foto.uri) {
                  const uri = foto.uri.startsWith("file://")
                    ? foto.uri
                    : foto.uri;
                  form.append("foto", {
                    uri,
                    name: foto.name || `photo-${Date.now()}.jpg`,
                    type: foto.type || "image/jpeg",
                  } as any);
                }
                await uploadFotoUsuario(form, usuario.token);
                await router.replace("/(tabs)");
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
