import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { createUsersModel } from "../models/usersModel.js";
import type { RegisterInput } from "../schemas/authSchema.js";

const usersModel = createUsersModel(prisma);
const INVALID_CREDENTIALS_MESSAGE = "Credenciales inválidas";

const isUniqueConstraintError = (error: unknown): boolean => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
};

export const login = async (email: string, password: string) => {
  const user = await usersModel.getUserByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new Error(INVALID_CREDENTIALS_MESSAGE);
  }

  const token = jwt.sign(
    { sub: user.id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: "8h" },
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

export const registerUser = async (input: RegisterInput) => {
  const normalizedEmail = input.email.trim().toLowerCase();

  if (input.doctorId) {
    const doctorExists = await prisma.doctor.findUnique({
      where: { id: input.doctorId },
      select: { id: true },
    });

    if (!doctorExists) {
      throw new Error("El doctor especificado no existe");
    }
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  try {
    const user = await usersModel.createUser({
      email: normalizedEmail,
      passwordHash,
      role: input.role,
      ...(input.doctorId ? { doctorId: input.doctorId } : {}),
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      doctorId: user.doctorId,
    };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new Error("Ya existe un usuario con ese correo electrónico");
    }

    throw error;
  }
};
