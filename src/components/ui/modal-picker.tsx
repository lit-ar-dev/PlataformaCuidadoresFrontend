import { useThemeColor } from "@/src/hooks/use-theme-color";
import React from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";

type Item = { id: number; nombre: string };

export default function ModalPicker({
  visible,
  items,
  onClose,
  onSelect,
}: {
  visible: boolean;
  items: Item[];
  onClose: () => void;
  onSelect: (item: Item) => void;
}) {
  const overlayColor = useThemeColor(
    { light: "rgba(0,0,0,0.12)", dark: "rgba(0,0,0,0.6)" },
    "background"
  );
  const border = useThemeColor({}, "border");
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent
    >
      <View style={[styles.backdrop, { backgroundColor: overlayColor }]}>
        <ThemedView style={styles.sheet}>
          <FlatList
            data={items}
            keyExtractor={(i) => String(i.id)}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => onSelect(item)}
                style={[styles.row, { borderBottomColor: border }]}
                accessibilityRole="button"
              >
                <ThemedText>{item.nombre}</ThemedText>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            onPress={onClose}
            style={styles.close}
            accessibilityRole="button"
          >
            <ThemedText type="link">Cerrar</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    // background is provided by ThemedView so we don't hardcode colors here
    maxHeight: "60%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 12,
  },
  row: { padding: 12, borderBottomWidth: 1 },
  close: { marginTop: 12, alignItems: "center" },
});
