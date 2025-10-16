import { z } from "zod";
import { tarifaSchema } from "./tarifa";

export const cuidadorSchema = z.object({
  cuidador: z.object({
    descripcion: z
      .string()
      .nonempty("Descripción requerida")
      .min(30, "Mínimo 30 caracteres"),
    experiencia: z.array(z.string()).nullable().optional(),
    formacion: z.array(z.string()).nullable().optional(),
    tarifas: z.array(tarifaSchema).nullable().optional(),
    tags: z.array(z.string()).nullable().optional(),
  }),
});

export type CuidadorForm = z.infer<typeof cuidadorSchema>;
