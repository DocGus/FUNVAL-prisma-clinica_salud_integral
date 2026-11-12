import type { Request, Response } from "express";
import {
  createAppointmentSchema,
  appointmentIdSchema,
  doctorAppointmentsQuerySchema,
  updateAppointmentStatusSchema,
} from "../schemas/appointmentsSchema.js";
import * as appointmentsService from "../services/appointmentsService.js";

export const createAppointment = async (req: Request, res: Response) => {
  const validation = createAppointmentSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Datos de la cita inválidos",
      errors: validation.error.issues,
    });
  }

  try {
    const appointment = await appointmentsService.createAppointment(
      validation.data,
    );

    return res.status(201).json({
      message: "Cita registrada correctamente",
      data: appointment,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Paciente no encontrado") {
      return res.status(404).json({
        message: "Paciente no encontrado",
      });
    }

    if (error instanceof Error && error.message === "Médico no encontrado") {
      return res.status(404).json({
        message: "Médico no encontrado",
      });
    }

    if (
      error instanceof Error &&
      error.message === "La fecha y hora de la cita no puede ser pasada"
    ) {
      return res.status(400).json({
        message: "La fecha y hora de la cita no puede ser pasada",
      });
    }

    console.error("Error al registrar cita:", error);

    return res.status(500).json({
      message: "Error interno al registrar la cita",
    });
  }
};

export const getDoctorAppointments = async (req: Request, res: Response) => {
  const doctorValidation = appointmentIdSchema.safeParse(req.params.id);

  if (!doctorValidation.success) {
    return res.status(400).json({
      message: "El ID del médico no es un UUID válido",
    });
  }

  const queryValidation = doctorAppointmentsQuerySchema.safeParse(req.query);

  if (!queryValidation.success) {
    return res.status(400).json({
      message: "Los filtros de agenda son inválidos",
      errors: queryValidation.error.issues,
    });
  }

  try {
    const appointments = await appointmentsService.getDoctorAppointments(
      doctorValidation.data,
      queryValidation.data.from,
      queryValidation.data.to,
    );

    return res.status(200).json({
      data: appointments,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Médico no encontrado") {
      return res.status(404).json({
        message: "Médico no encontrado",
      });
    }

    console.error("Error al consultar agenda del médico:", error);

    return res.status(500).json({
      message: "Error interno al consultar la agenda",
    });
  }
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
  const appointmentValidation = appointmentIdSchema.safeParse(req.params.id);

  if (!appointmentValidation.success) {
    return res.status(400).json({
      message: "El ID de la cita no es un UUID válido",
    });
  }

  const statusValidation = updateAppointmentStatusSchema.safeParse(req.body);

  if (!statusValidation.success) {
    return res.status(400).json({
      message: "El estado de la cita es inválido",
      errors: statusValidation.error.issues,
    });
  }

  try {
    const appointment = await appointmentsService.updateAppointmentStatus(
      appointmentValidation.data,
      statusValidation.data.status,
    );

    return res.status(200).json({
      message: "Estado de la cita actualizado correctamente",
      data: appointment,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Cita no encontrada") {
      return res.status(404).json({
        message: "Cita no encontrada",
      });
    }

    console.error("Error al actualizar cita:", error);

    return res.status(500).json({
      message: "Error interno al actualizar la cita",
    });
  }
};
