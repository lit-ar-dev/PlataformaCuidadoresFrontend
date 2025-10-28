import { clienteSchema } from "@/src/schemas/cliente";
import { cuidadorSchema } from "@/src/schemas/cuidador";
import { personaSchema } from "@/src/schemas/persona";
import { rolesSchema } from "@/src/schemas/roles";
import { usuarioSchema } from "@/src/schemas/usuario";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack } from "expo-router";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

export const FullSchema = z.object({
  usuario: usuarioSchema.shape.usuario,
  persona: personaSchema.shape.persona,
  rolesId: rolesSchema.shape.rolesId,
  cliente: clienteSchema.shape.cliente.optional(),
  cuidador: cuidadorSchema.shape.cuidador.optional(),
});

export default function RegisterLayout() {
  const methods = useForm({
    resolver: zodResolver(FullSchema),
    defaultValues: {
      usuario: { email: "", contraseña: "", confirmarContraseña: "" },
      persona: {
        nombre: "",
        apellido: "",
        provinciaId: undefined,
        ciudadId: undefined,
        fechaDeNacimiento: undefined,
        generoId: undefined,
      },
      rolesId: [],
    },
    mode: "onSubmit",
  });

  return (
    <FormProvider {...methods}>
      <Stack>
        <Stack.Screen name="step1" options={{ title: "Paso 1 - Usuario" }} />
        <Stack.Screen name="step2" options={{ title: "Paso 2 - Persona" }} />
        <Stack.Screen name="step3" options={{ title: "Paso 3 - Roles" }} />
        <Stack.Screen name="review" options={{ title: "Revisión" }} />
      </Stack>
    </FormProvider>
  );
}
