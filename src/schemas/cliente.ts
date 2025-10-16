import { z } from "zod";

export const clienteSchema = z.object({
  cliente: z.object({
    domicilio: z.string().nonempty("Domicilio requerido"),
  }),
});

export type ClienteForm = z.infer<typeof clienteSchema>;
