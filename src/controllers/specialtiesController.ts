import type { Request, Response } from "express";
import * as specialtiesService from "../services/specialtiesService.js";

export const getSpecialties = async (_req: Request, res: Response) => {
  try {
    const specialties = await specialtiesService.getSpecialties();

    return res.status(200).json({ data: specialties });
  } catch (error) {
    console.error("Error al consultar especialidades:", error);

    return res.status(500).json({
      message: "Error interno al consultar especialidades",
    });
  }
};
