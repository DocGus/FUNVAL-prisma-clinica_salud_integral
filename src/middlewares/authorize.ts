import type { RequestHandler } from "express";
import type { UserRole } from "../../generated/prisma/client.js";

export const authorize = (...allowedRoles: UserRole[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Autenticación requerida",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "No tienes permisos para realizar esta acción",
      });
    }

    return next();
  };
};
