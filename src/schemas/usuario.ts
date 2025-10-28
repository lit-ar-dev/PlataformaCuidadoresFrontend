import { z } from "zod";

const pickedImageSchema = z.object({
  uri: z.string().url().or(z.string()).optional(), // permitimos uris locales también
  name: z.string().optional(),
  type: z.string().optional(),
});

export const usuarioSchema = z.object({
  usuario: z
    .object({
      email: z
        .string()
        .nonempty("El email es obligatorio")
        .email("Email inválido"),
      contraseña: z
        .string()
        .nonempty("La contraseña es obligatoria")
        .min(6, "Mínimo 6 caracteres"),
      confirmarContraseña: z
        .string()
        .nonempty("Confirmar contraseña requerida"),
      foto: z.union([z.string(), pickedImageSchema]).nullable().optional(),
    })
    .superRefine((obj, ctx) => {
      if (obj.contraseña !== obj.confirmarContraseña) {
        ctx.addIssue({
          code: "custom",
          message: "Las contraseñas no coinciden",
          path: ["confirmarContraseña"],
        });
      }
    }),
});

export type UsuarioForm = z.infer<typeof usuarioSchema>;
