import { z } from "zod";
import jwt from "jsonwebtoken";
import type { RequestHandler } from "express";
import { UserRole } from "../../generated/prisma/client.js";
import { env } from "../config/env.js";

const authorizationPattern = /^Bearer ([^\s]+)$/i;
const tokenPayloadSchema = z.object({
  sub: z.uuid(),
  role: z.enum(UserRole),
});

const unauthorized = (res: Parameters<RequestHandler>[1]) => {
  return res.status(401).json({ message: "Token inválido o ausente" });
};

export const verifyToken: RequestHandler = (req, res, next) => {
  const authorization = req.get("authorization");
  const authorizationMatch = authorization?.match(authorizationPattern);

  if (!authorizationMatch) {
    return unauthorized(res);
  }

  const token = authorizationMatch[1];

  if (!token) {
    return unauthorized(res);
  }

  let payload: string | jwt.JwtPayload;

  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch {
    return unauthorized(res);
  }

  if (typeof payload !== "object" || payload === null) {
    return unauthorized(res);
  }

  const validation = tokenPayloadSchema.safeParse(payload);

  if (!validation.success) {
    return unauthorized(res);
  }

  req.user = {
    id: validation.data.sub,
    role: validation.data.role,
  };

  return next();
};
