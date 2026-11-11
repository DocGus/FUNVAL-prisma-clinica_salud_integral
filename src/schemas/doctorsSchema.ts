import { z } from "zod";

export const doctorsQuerySchema = z.object({
  specialtyId: z.uuid().optional(),
});

export type DoctorsQuery = z.infer<typeof doctorsQuerySchema>;
