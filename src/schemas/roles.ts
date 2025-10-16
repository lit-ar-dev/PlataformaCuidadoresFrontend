import { z } from "zod";

export const rolesSchema = z.object({
  rolesId: z
    .array(z.preprocess((v) => Number(v), z.number().int()))
    .min(1, "Seleccioná al menos un rol"),
});

export type RolesForm = z.infer<typeof rolesSchema>;
