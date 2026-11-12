import { z } from "zod";

export const doctorsQuerySchema = z.object({
  specialty: z.string().trim().min(1).optional(),
});

export type DoctorsQuery = z.infer<typeof doctorsQuerySchema>;
