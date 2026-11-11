import { z } from "zod";

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

export type LoginInput = z.infer<typeof loginSchema>;
