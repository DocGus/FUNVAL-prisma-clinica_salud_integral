import { z } from "zod";

export const createAppointmentSchema = z
  .object({
    patientId: z.uuid("El ID del paciente no es un UUID válido"),
    doctorId: z.uuid("El ID del médico no es un UUID válido"),
    scheduledAt: z
      .coerce.date()
      .refine((date) => date > new Date(), {
        message: "La fecha y hora de la cita no puede ser pasada",
      }),
    reason: z.string().trim().max(500).optional(),
  })
  .strict();

export const appointmentIdSchema = z.uuid();

export const updateAppointmentStatusSchema = z
  .object({
    status: z.enum(["COMPLETADA", "CANCELADA"], {
      error: "El estado de la cita no es válido",
    }),
  })
  .strict();

export const doctorAppointmentsQuerySchema = z
  .object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .strict();

export type CreateAppointmentInput = z.output<typeof createAppointmentSchema>;
export type UpdateAppointmentStatusInput = z.output<
  typeof updateAppointmentStatusSchema
>;
export type DoctorAppointmentsQueryInput = z.output<
  typeof doctorAppointmentsQuerySchema
>;
