
import { z } from "zod";

const todayInMexico = () =>
  new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Mexico_City",
  });

export const createPatientSchema = z
  .object({
    firstName: z.string().trim().min(1, "El nombre es obligatorio"),
    lastName: z.string().trim().min(1, "El apellido es obligatorio"),
    email: z.string().trim().email("Correo electrónico inválido").toLowerCase(),
    birthDate: z
      .iso
      .date()
      .refine(
        (date) => date <= todayInMexico(),
        "La fecha de nacimiento no puede ser futura",
      )
      .transform((date) => new Date(`${date}T00:00:00.000Z`)),
    phone: z.string().trim().optional(),
  })
  .strict();

export const patientIdSchema = z.uuid();

export type CreatePatientInput = z.output<typeof createPatientSchema>;
