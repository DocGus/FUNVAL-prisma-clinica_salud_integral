import type { Request, Response } from "express";
import { doctorsQuerySchema } from "../schemas/doctorsSchema.js";
import * as doctorsService from "../services/doctorsService.js";

export const getDoctors = async (req: Request, res: Response) => {
  const validation = doctorsQuerySchema.safeParse(req.query);

  if (!validation.success) {
    return res.status(400).json({
      message: "El filtro specialtyId debe ser un UUID válido",
      errors: validation.error.issues,
    });
  }

  try {
    const doctors = await doctorsService.getDoctors(
      validation.data.specialtyId,
    );

    return res.status(200).json({ data: doctors });
  } catch (error) {
    console.error("Error al consultar médicos:", error);

    return res.status(500).json({
      message: "Error interno al consultar médicos",
    });
  }
};
