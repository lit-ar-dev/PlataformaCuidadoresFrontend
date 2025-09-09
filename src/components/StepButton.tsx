import React from "react";
import { View, TouchableOpacity, Text } from "react-native";

export default function StepButtons({
  step,
  lastStep,
  onBack,
  onNext,
  onSubmit,
}: {
  step: number;
  lastStep: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
      }}
    >
      {step > 0 ? (
        <TouchableOpacity
          onPress={onBack}
          style={{
            flex: 1,
            marginRight: 8,
            padding: 12,
            backgroundColor: "#ccc",
            borderRadius: 8,
          }}
        >
          <Text style={{ textAlign: "center" }}>Atrás</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ flex: 1 }} />
      )}

      {step < lastStep ? (
        <TouchableOpacity
          onPress={onNext}
          style={{
            flex: 1,
            padding: 12,
            backgroundColor: "#0b79ff",
            borderRadius: 8,
          }}
        >
          <Text style={{ textAlign: "center", color: "#fff" }}>Siguiente</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={onSubmit}
          style={{
            flex: 1,
            padding: 12,
            backgroundColor: "#0b79ff",
            borderRadius: 8,
          }}
        >
          <Text style={{ textAlign: "center", color: "#fff" }}>Enviar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
