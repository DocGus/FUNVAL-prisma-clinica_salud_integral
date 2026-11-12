import { z } from "zod";
import { UserRole } from "../../generated/prisma/client.js";

export const loginSchema = z
  .object({
    email: z
      .string()
      .email("Correo electrónico inválido")
      .refine((email) => email === email.trim(), {
        message: "El correo no debe contener espacios exteriores",
      }),
    password: z.string().min(1, "La contraseña es obligatoria"),
  })
  .strict();

export const registerSchema = z
  .object({
    email: z
      .string()
      .email("Correo electrónico inválido")
      .trim()
      .toLowerCase()
      .refine((email) => email === email.trim(), {
        message: "El correo no debe contener espacios exteriores",
      }),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    role: z.enum(UserRole),
    doctorId: z.uuid("DoctorId inválido").optional(),
  })
  .strict();

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
