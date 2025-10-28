import { z } from "zod";

export const rolesSchema = z.object({
  rolesId: z
    .array(z.preprocess((v) => String(v), z.string()))
    .min(1, "Seleccioná al menos un rol"),
});

export type RolesForm = z.infer<typeof rolesSchema>;
