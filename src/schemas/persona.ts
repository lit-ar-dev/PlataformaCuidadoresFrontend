import { z } from "zod";

export const personaSchema = z.object({
  persona: z.object({
    nombre: z.string().nonempty("Nombre requerido"),
    apellido: z.string().nonempty("Apellido requerido"),
    fechaDeNacimiento: z.preprocess((val) => {
      if (!val) return undefined;
      const d = val instanceof Date ? val : new Date(String(val));
      return isNaN(d.getTime()) ? undefined : d;
    }, z.date({ required_error: "Fecha requerida", invalid_type_error: "Fecha inválida" }).max(new Date(), "Fecha inválida")),
    telefono: z.string().nullable().optional(),
    provinciaId: z.preprocess(
      (v) => (v == null || v === "" ? undefined : Number(v)),
      z.number({ required_error: "Provincia requerida" })
    ),
    ciudadId: z.preprocess(
      (v) => (v == null || v === "" ? undefined : Number(v)),
      z.number({ required_error: "Ciudad requerida" })
    ),
    generoId: z.preprocess(
      (v) => (v == null || v === "" ? undefined : Number(v)),
      z.number().int().nullable().optional()
    ),
  }),
});

export type PersonaForm = z.infer<typeof personaSchema>;
