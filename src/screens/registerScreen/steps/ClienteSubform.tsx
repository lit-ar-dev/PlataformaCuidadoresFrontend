import React from "react";
import { View, Text } from "react-native";
import TextInputField from "../../../components/TextInputField";

export default function ClienteSubform({
  values,
  setFieldValue,
  errors,
}: {
  values: any;
  setFieldValue: (field: string, val: any) => void;
  errors: any;
}) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ fontWeight: "600", marginBottom: 8 }}>
        Datos del cliente
      </Text>

      <TextInputField
        label="Domicilio"
        placeholder="Calle 123, Piso 2"
        value={values.cliente?.domicilio}
        onChangeText={(t) => setFieldValue("cliente.domicilio", t)}
        error={errors["cliente.domicilio"]}
      />
    </View>
  );
}
