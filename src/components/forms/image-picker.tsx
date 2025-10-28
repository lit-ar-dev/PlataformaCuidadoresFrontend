import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { useController, useFormContext } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "../ui/themed-text";

type Props = {
  name: string; // ej: "persona.foto"
  label?: string;
  size?: number;
  quality?: number; // 0..1
  allowsEditing?: boolean;
};

export default function ImagePickerField({
  name,
  label = "Foto",
  size = 120,
  quality = 0.7,
  allowsEditing = true,
}: Props) {
  const { control, setValue } = useFormContext();
  const {
    field: { value },
    fieldState,
  } = useController({ name, control });

  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      setLoading(true);
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Permiso denegado",
          "Necesitamos permiso para acceder a la galería."
        );
        setLoading(false);
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality,
        allowsEditing,
      });

      // manejo compatibilidad con versiones: res.cancelled o res.canceled
      const cancelled = (res as any).cancelled ?? (res as any).canceled;
      if (cancelled) {
        setLoading(false);
        return;
      }

      // expo SDK reciente -> res.assets is an array
      // fallback a res.uri si viene de versiones antiguas
      const asset = (res as any).assets?.[0] ?? res;
      const localUri: string = asset.uri;
      if (!localUri) {
        setLoading(false);
        return;
      }

      // ---- validar tamaño máximo (2 MB) ----
      const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
      // intentar obtener tamaño desde la respuesta del picker
      let sizeInBytes: number | null =
        (asset.fileSize as number) ??
        (asset.size as number) ??
        (asset.fileSizeInBytes as number) ??
        null;

      // si no está disponible, hacer fetch y medir el blob
      if (sizeInBytes == null) {
        try {
          const resp = await fetch(localUri);
          const blob = await resp.blob();
          sizeInBytes = blob.size;
        } catch (e) {
          console.warn("No se pudo determinar el tamaño del archivo:", e);
          sizeInBytes = null;
        }
      }

      if (sizeInBytes != null && sizeInBytes > MAX_BYTES) {
        Alert.alert(
          "Imagen demasiado grande",
          "La imagen debe ser menor a 2 MB. Intentá reducir la calidad o elegir otra imagen."
        );
        setLoading(false);
        return;
      }
      // ---- fin validación tamaño ----

      const filename =
        asset.fileName ??
        localUri.split("/").pop() ??
        `photo-${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1] : "jpg";
      const mime = `image/${ext === "jpg" ? "jpeg" : ext}`;

      // En RN, FormData acepta objetos { uri, name, type }
      const fileObj = { uri: localUri, name: filename, type: mime };

      // Guardamos en el form (puede ser string | fileObj). Validación opcional.
      setValue(name, fileObj, { shouldValidate: true, shouldDirty: true });
    } catch (e) {
      console.error("pickImage error", e);
      Alert.alert("Error", "No se pudo seleccionar la imagen.");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setValue(name, null, { shouldValidate: true, shouldDirty: true });
  };

  // value puede ser: null | string(url) | { uri, name, type }
  const uri = value?.uri ?? (typeof value === "string" ? value : undefined);

  return (
    <View style={styles.container}>
      <ThemedText>{label}</ThemedText>

      <View style={styles.row}>
        {uri ? (
          <Image
            source={{ uri }}
            style={[
              styles.preview,
              { width: size, height: size, borderRadius: 8 },
            ]}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.preview,
              {
                width: size,
                height: size,
                borderRadius: 8,
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <Text style={{ color: "#9ca3af" }}>Sin foto</Text>
          </View>
        )}

        <View style={{ marginLeft: 12, justifyContent: "center" }}>
          <TouchableOpacity
            onPress={pickImage}
            accessibilityRole="button"
            style={styles.actionBtn}
          >
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.actionText}>Elegir</Text>
            )}
          </TouchableOpacity>

          {uri ? (
            <TouchableOpacity
              onPress={removeImage}
              style={[styles.actionBtn, { marginTop: 8 }]}
            >
              <Text style={[styles.actionText, { color: "#ef4444" }]}>
                Quitar
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {fieldState?.error?.message ? (
        <Text style={styles.error}>{String(fieldState.error.message)}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { marginBottom: 6, fontWeight: "600" },
  row: { flexDirection: "row", alignItems: "center" },
  preview: {
    backgroundColor: "#f3f4f6",
    overflow: "hidden",
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#e5e7eb",
  },
  actionText: { fontWeight: "600" },
  error: { color: "#ef4444", marginTop: 6 },
});
