import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { createUsersModel } from "../models/usersModel.js";

const usersModel = createUsersModel(prisma);
const INVALID_CREDENTIALS_MESSAGE = "Credenciales inválidas";

export const login = async (email: string, password: string) => {
  const user = await usersModel.getUserByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new Error(INVALID_CREDENTIALS_MESSAGE);
  }

  const token = jwt.sign(
    { sub: user.id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      doctorId: user.doctorId,
    },
  };
};
