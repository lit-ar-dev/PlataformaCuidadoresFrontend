import React, { useMemo, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  AccessibilityState,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ClienteSubform from "./ClienteSubform";
import CuidadorSubform from "./CuidadorSubform";

export default function RolesStep({
  values,
  setFieldValue,
  roles,
  errors,
}: any) {
  // Encontrar rol "usuario" y asegurarlo en values.rolesId
  const usuarioRole = roles.find(
    (r: any) => r.nombre?.toLowerCase() === "usuario"
  );
  const usuarioRoleId = usuarioRole?.id;

  useEffect(() => {
    if (usuarioRoleId && !(values.rolesId || []).includes(usuarioRoleId)) {
      setFieldValue("rolesId", [...(values.rolesId || []), usuarioRoleId]);
    }
  }, [usuarioRoleId]);

  // selectedRoleNames (incluye siempre 'usuario')
  const selectedRoleNames = useMemo(() => {
    const ids = new Set(
      [...(values.rolesId || []), usuarioRoleId].filter(Boolean)
    );
    return Array.from(ids).map((id: number) =>
      roles.find((r: any) => r.id === id)?.nombre?.toLowerCase()
    );
  }, [values.rolesId, roles, usuarioRoleId]);

  const isClienteSelected = selectedRoleNames.includes("cliente");
  const isCuidadorSelected = selectedRoleNames.includes("cuidador");

  // Roles a mostrar (excluye "usuario")
  const rolesToShow = roles.filter(
    (r: any) => r.nombre?.toLowerCase() !== "usuario"
  );

  // función para alternar selección y limpiar subform si se deselecciona
  const toggleRole = (role: any) => {
    const current = values.rolesId || [];
    if (current.includes(role.id)) {
      // quitar
      const next = current.filter((id: number) => id !== role.id);
      setFieldValue("rolesId", next);

      // limpiar datos del subform correspondiente (evita datos huérfanos)
      const name = role.nombre?.toLowerCase();
      if (name === "cliente") {
        setFieldValue("cliente", { domicilio: undefined });
      } else if (name === "cuidador") {
        setFieldValue("cuidador", {
          descripcion: undefined,
          experiencia: undefined,
          formacion: undefined,
          tarifas: undefined,
          tags: undefined,
        });
      }
    } else {
      // agregar
      setFieldValue("rolesId", [...current, role.id]);
    }
  };

  // Componente interno: Chip para rol
  function RoleChip({ role }: { role: any }) {
    const selected = (values.rolesId || []).includes(role.id);
    const roleName = role.nombre ?? "Rol";
    const accessibilityState: AccessibilityState = { selected };

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => toggleRole(role)}
        style={[styles.chip, selected && styles.chipSelected]}
        accessibilityRole="button"
        accessibilityState={accessibilityState}
        accessibilityLabel={`Seleccionar ${roleName}`}
      >
        <View style={styles.chipLeft}>
          <Ionicons
            name={selected ? "checkmark-circle" : "person-circle-outline"}
            size={18}
            color={selected ? "#fff" : "#4b5563"}
          />
          <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
            {roleName}
          </Text>
        </View>

        {/* si está seleccionado mostramos un pequeño badge */}
        {selected && (
          <View style={styles.badge}>
            <Ionicons name="checkmark" size={12} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={{ marginTop: 8 }}>
      {/* Contenedor de chips (sin título) */}
      <View style={styles.chipsContainer}>
        {rolesToShow.map((r: any) => (
          <RoleChip key={r.id} role={r} />
        ))}
      </View>

      {/* Error general de roles */}
      {errors && errors["rolesId"] ? (
        <Text style={styles.errorText}>{errors["rolesId"]}</Text>
      ) : null}

      {/* Subformularios condicionales (se muestran bajo los chips) */}
      {isClienteSelected && (
        <View style={styles.subformWrap}>
          <ClienteSubform
            values={values}
            setFieldValue={setFieldValue}
            errors={errors}
          />
        </View>
      )}

      {isCuidadorSelected && (
        <View style={styles.subformWrap}>
          <CuidadorSubform
            values={values}
            setFieldValue={setFieldValue}
            errors={errors}
          />
        </View>
      )}
    </View>
  );
}

/* ----- Estilos ----- */
const styles = StyleSheet.create({
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8, // si tu RN no soporta gap, lo puedes simular con margin en .chip
    marginTop: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E6EEF7",
    marginRight: 8,
    marginBottom: 8,
    minHeight: 40,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  chipSelected: {
    backgroundColor: "#0b79ff",
    borderColor: "#0b79ff",
  },
  chipLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chipText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  chipTextSelected: {
    color: "#fff",
  },
  badge: {
    marginLeft: 8,
    backgroundColor: "#0747a6",
    padding: 6,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: { color: "#E03131", marginTop: 6 },
  subformWrap: { marginTop: 12 },
});
