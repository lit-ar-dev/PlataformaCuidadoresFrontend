import React from "react";
import TextInputField from "../../../components/TextInputField";
import { PasswordInput } from "../../../components/PasswordInput";
import { getIn } from "formik";

export default function UsuarioStep({
  values,
  handleChange,
  handleBlur,
  errors,
}: any) {
  return (
    <>
      <TextInputField
        label="Email"
        placeholder="tu@ejemplo.com"
        value={values.usuario.email}
        onChangeText={handleChange("usuario.email")}
        onBlur={handleBlur("usuario.email")}
        error={getIn(errors, "usuario.email")}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <PasswordInput
        label="Contraseña"
        placeholder="Mínimo 6 caracteres"
        value={values.usuario.contraseña}
        onChangeText={handleChange("usuario.contraseña")}
        onBlur={handleBlur("usuario.contraseña")}
        error={getIn(errors, "usuario.contraseña")}
      />

      <PasswordInput
        placeholder="Repite la contraseña"
        value={values.usuario.confirmarContraseña}
        onChangeText={handleChange("usuario.confirmarContraseña")}
        onBlur={handleBlur("usuario.confirmarContraseña")}
        error={getIn(errors, "usuario.confirmarContraseña")}
      />
    </>
  );
}
