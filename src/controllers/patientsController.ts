
import type { Request, Response } from "express";
import {
  createPatientSchema,
  patientIdSchema,
} from "../schemas/patientsSchema.js";
import * as patientsService from "../services/patientsService.js";

const isUniqueConstraintError = (error: unknown): boolean => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
};

export const createPatient = async (req: Request, res: Response) => {
  const validation = createPatientSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Datos del paciente inválidos",
      errors: validation.error.issues,
    });
  }

  try {
    const patient = await patientsService.createPatient(validation.data);

    return res.status(201).json({
      message: "Paciente registrado correctamente",
      data: patient,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return res.status(409).json({
        message: "Ya existe un paciente con ese correo electrónico",
      });
    }

    console.error("Error al registrar paciente:", error);

    return res.status(500).json({
      message: "Error interno al registrar el paciente",
    });
  }
};

export const getAllPatients = async (_req: Request, res: Response) => {
  try {
    const patients = await patientsService.getAllPatients();

    return res.status(200).json({
      data: patients,
    });
  } catch (error) {
    console.error("Error al consultar pacientes:", error);

    return res.status(500).json({
      message: "Error interno al consultar pacientes",
    });
  }
};

export const getPatientById = async (req: Request, res: Response) => {
  const validation = patientIdSchema.safeParse(req.params.id);

  if (!validation.success) {
    return res.status(400).json({
      message: "El ID del paciente no es un UUID válido",
    });
  }

  try {
    const patient = await patientsService.getPatientById(validation.data);

    if (!patient) {
      return res.status(404).json({
        message: "Paciente no encontrado",
      });
    }

    return res.status(200).json({
      data: patient,
    });
  } catch (error) {
    console.error("Error al consultar paciente:", error);

    return res.status(500).json({
      message: "Error interno al consultar el paciente",
    });
  }
};
