import { z } from "zod";

export const tarifaSchema = z.object({
  precio: z.preprocess(
    (v) => (v === "" ? undefined : Number(v)),
    z
      .number({ invalid_type_error: "Debe ser un número" })
      .min(1, "Precio mínimo 1")
  ),
  servicios: z.array(z.string()).nullable().optional(),
  grupoId: z.preprocess(
    (v) => (v === "" ? undefined : Number(v)),
    z.number().int().min(1, "Grupo requerido")
  ),
});

export type Tarifa = z.infer<typeof tarifaSchema>;
