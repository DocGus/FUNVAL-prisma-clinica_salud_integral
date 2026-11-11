import type { Request, Response } from "express";
import { loginSchema } from "../schemas/authSchema.js";
import * as authService from "../services/authService.js";

const INVALID_CREDENTIALS_MESSAGE = "Credenciales inválidas";

export const login = async (req: Request, res: Response) => {
  const validation = loginSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Datos de inicio de sesión inválidos",
      errors: validation.error.issues,
    });
  }

  try {
    const result = await authService.login(
      validation.data.email,
      validation.data.password,
    );

    return res.status(200).json(result);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === INVALID_CREDENTIALS_MESSAGE
    ) {
      return res.status(401).json({
        message: INVALID_CREDENTIALS_MESSAGE,
      });
    }

    console.error("Error al iniciar sesión:", error);

    return res.status(500).json({
      message: "Error interno al iniciar sesión",
    });
  }
};
