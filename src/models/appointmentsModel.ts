import type { Prisma } from "../../generated/prisma/client.js";
import { AppointmentStatus } from "../../generated/prisma/client.js";
import { prisma } from "../config/prisma.js";

const appointmentPatientSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
} satisfies Prisma.PatientSelect;

export type AppointmentWithPatient = Prisma.AppointmentGetPayload<{
  include: {
    patient: {
      select: typeof appointmentPatientSelect;
    };
  };
}>;

type AppointmentsModelClient = Pick<typeof prisma, "appointment">;

export const createAppointmentsModel = (client: AppointmentsModelClient) => ({
  createAppointment: (data: Prisma.AppointmentCreateInput) => {
    return client.appointment.create({
      data,
      include: {
        patient: { select: appointmentPatientSelect },
      },
    });
  },

  getAppointmentById: (id: string) => {
    return client.appointment.findUnique({
      where: { id },
      include: {
        patient: { select: appointmentPatientSelect },
      },
    });
  },

  getDoctorAppointments: (
    doctorId: string,
    from?: Date,
    to?: Date,
  ) => {
    return client.appointment.findMany({
      where: {
        doctorId,
        ...(from || to
          ? {
              scheduledAt: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            }
          : {}),
      },
      include: {
        patient: { select: appointmentPatientSelect },
      },
      orderBy: {
        scheduledAt: "asc",
      },
    });
  },

  updateAppointmentStatus: (id: string, status: AppointmentStatus) => {
    return client.appointment.update({
      where: { id },
      data: { status },
      include: {
        patient: { select: appointmentPatientSelect },
      },
    });
  },
});
