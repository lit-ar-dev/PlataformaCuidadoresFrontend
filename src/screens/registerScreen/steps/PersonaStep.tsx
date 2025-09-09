import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import TextInputField from "../../../components/TextInputField";

export default function PersonaStep({
  values,
  handleChange,
  handleBlur,
  setFieldValue,
  errors,
  provincias,
  ciudades,
  generos,
  showDate,
  setShowDate,
  onProvinciaChange,
}: any) {
  return (
    <>
      <TextInputField
        label="Nombre"
        value={values.persona.nombre}
        onChangeText={handleChange("persona.nombre")}
        onBlur={handleBlur("persona.nombre")}
        error={errors["persona.nombre"]}
      />
      <TextInputField
        label="Apellido"
        value={values.persona.apellido}
        onChangeText={handleChange("persona.apellido")}
        onBlur={handleBlur("persona.apellido")}
        error={errors["persona.apellido"]}
      />

      <Text style={{ marginBottom: 6 }}>Fecha de Nacimiento</Text>
      <TouchableOpacity
        onPress={() => setShowDate(true)}
        style={{
          padding: 12,
          borderWidth: 1,
          borderRadius: 6,
        }}
      >
        <Text>
          {values.persona.fechaDeNacimiento
            ? values.persona.fechaDeNacimiento.toLocaleDateString()
            : "Seleccionar Fecha de Nacimiento..."}
        </Text>
      </TouchableOpacity>
      {errors["persona.fechaDeNacimiento"] && (
        <Text style={{ color: "red", marginTop: 6 }}>
          {errors["persona.fechaDeNacimiento"]}
        </Text>
      )}

      {showDate && (
        <DateTimePicker
          value={values.persona.fechaDeNacimiento ?? new Date(1990, 0, 1)}
          mode="date"
          display="default"
          accentColor="red"
          maximumDate={new Date()}
          onChange={(_, selectedDate) => {
            setShowDate(false);
            if (selectedDate)
              setFieldValue("persona.fechaDeNacimiento", selectedDate);
          }}
        />
      )}

      <View style={{ height: 12 }} />
      <TextInputField
        label="Teléfono"
        value={values.persona.telefono}
        onChangeText={handleChange("persona.telefono")}
        onBlur={handleBlur("persona.telefono")}
        error={errors["persona.telefono"]}
      />

      <Text>Provincia</Text>
      <View
        style={{
          borderWidth: 1,
          borderRadius: 6,
          marginTop: 6,
          overflow: "hidden",
        }}
      >
        <Picker
          selectedValue={values.persona.provinciaId}
          onValueChange={(val) => {
            setFieldValue("persona.provinciaId", val);
            onProvinciaChange(val);
          }}
        >
          <Picker.Item label="Seleccionar Provincia..." value={undefined} />
          {provincias.map((p: any) => (
            <Picker.Item key={p.id} label={p.nombre} value={p.id} />
          ))}
        </Picker>
      </View>
      {errors["persona.provinciaId"] && (
        <Text style={{ color: "red" }}>{errors["persona.provinciaId"]}</Text>
      )}

      <Text style={{ marginTop: 12 }}>Ciudad</Text>
      <View
        style={{
          borderWidth: 1,
          borderRadius: 6,
          marginTop: 6,
          overflow: "hidden",
        }}
      >
        <Picker
          selectedValue={values.persona.ciudadId}
          onValueChange={(val) => setFieldValue("persona.ciudadId", val)}
        >
          <Picker.Item label="Seleccionar Ciudad..." value={undefined} />
          {ciudades.map((c: any) => (
            <Picker.Item key={c.id} label={c.nombre} value={c.id} />
          ))}
        </Picker>
      </View>
      {errors["persona.ciudadId"] && (
        <Text style={{ color: "red" }}>{errors["persona.ciudadId"]}</Text>
      )}

      <Text style={{ marginTop: 12 }}>Género</Text>
      <View
        style={{
          borderWidth: 1,
          borderRadius: 6,
          marginTop: 6,
          overflow: "hidden",
        }}
      >
        <Picker
          selectedValue={values.persona.generoId}
          onValueChange={(val) => setFieldValue("persona.generoId", val)}
        >
          <Picker.Item label="Seleccionar Género..." value={undefined} />
          {generos.map((g: any) => (
            <Picker.Item key={g.id} label={g.nombre} value={g.id} />
          ))}
        </Picker>
      </View>
    </>
  );
}
