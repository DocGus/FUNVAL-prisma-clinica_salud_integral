import { AppointmentStatus } from "../../generated/prisma/client.js";
import { prisma } from "../config/prisma.js";
import { createAppointmentsModel } from "../models/appointmentsModel.js";
import type { CreateAppointmentInput } from "../schemas/appointmentsSchema.js";

const appointmentsModel = createAppointmentsModel(prisma);

export const createAppointment = async (input: CreateAppointmentInput) => {
  const patient = await prisma.patient.findUnique({
    where: { id: input.patientId },
    select: { id: true },
  });

  if (!patient) {
    throw new Error("Paciente no encontrado");
  }

  const doctor = await prisma.doctor.findUnique({
    where: { id: input.doctorId },
    select: { id: true },
  });

  if (!doctor) {
    throw new Error("Médico no encontrado");
  }

  const scheduledAt = new Date(input.scheduledAt);

  if (scheduledAt <= new Date()) {
    throw new Error("La fecha y hora de la cita no puede ser pasada");
  }

  return appointmentsModel.createAppointment({
    scheduledAt,
    reason: input.reason ?? null,
    status: AppointmentStatus.PROGRAMADA,
    patient: {
      connect: {
        id: input.patientId,
      },
    },
    doctor: {
      connect: {
        id: input.doctorId,
      },
    },
  });
};

export const resolveAuthenticatedDoctorId = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, doctorId: true },
  });

  if (!user) {
    throw new Error("Usuario no autorizado");
  }

  if (user.role !== "MEDICO") {
    throw new Error("No tienes permisos para realizar esta acción");
  }

  if (!user.doctorId) {
    throw new Error("El usuario médico no está asociado a un doctor");
  }

  const doctor = await prisma.doctor.findUnique({
    where: { id: user.doctorId },
    select: { id: true },
  });

  if (!doctor) {
    throw new Error("El médico autenticado no existe");
  }

  return user.doctorId;
};

export const getDoctorAppointments = async (
  doctorId: string,
  from?: Date,
  to?: Date,
) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    select: { id: true },
  });

  if (!doctor) {
    throw new Error("Médico no encontrado");
  }

  return appointmentsModel.getDoctorAppointments(doctorId, from, to);
};

export const updateAppointmentStatus = async (
  id: string,
  status: "COMPLETADA" | "CANCELADA",
  doctorId?: string,
) => {
  const appointment = await appointmentsModel.getAppointmentById(id);

  if (!appointment) {
    throw new Error("Cita no encontrada");
  }

  if (doctorId && appointment.doctorId !== doctorId) {
    throw new Error("No tienes permisos para modificar esta cita");
  }

  return appointmentsModel.updateAppointmentStatus(id, status);
};
