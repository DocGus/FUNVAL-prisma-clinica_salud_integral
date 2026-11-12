import type { Request, Response } from "express";
import { dailyCutoffQuerySchema } from "../schemas/reportsSchema.js";
import * as reportsService from "../services/reportsService.js";

export const getAppointmentsBySpecialty = async (_req: Request, res: Response) => {
  try {
    const data = await reportsService.getAppointmentsBySpecialty();

    return res.status(200).json({ data });
  } catch (error) {
    console.error("Error al consultar volumen de citas por especialidad:", error);

    return res.status(500).json({
      message: "Error interno al consultar el reporte por especialidad",
    });
  }
};

export const getDailyCutoff = async (req: Request, res: Response) => {
  const validation = dailyCutoffQuerySchema.safeParse(req.query);

  if (!validation.success) {
    return res.status(400).json({
      message: "La fecha del corte diario es inválida",
      errors: validation.error.issues,
    });
  }

  try {
    const result = await reportsService.getDailyCutoff(validation.data.date);

    return res.status(200).json({ data: result });
  } catch (error) {
    console.error("Error al consultar el corte diario:", error);

    return res.status(500).json({
      message: "Error interno al consultar el corte diario",
    });
  }
};
