import type { User } from "../generated/prisma/client.js";
import bcrypt from "bcryptjs";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  jwtSecret: "test-secret-with-at-least-thirty-two-characters",
  compare: vi.fn<(password: string, hash: string) => Promise<boolean>>(),
  hash: vi.fn<(password: string, salt: number) => Promise<string>>(),
  getUserByEmail: vi.fn<(email: string) => Promise<User | null>>(),
  createUser: vi.fn(),
  findDoctorById: vi.fn(),
  createUsersModel: vi.fn(() => ({
    getUserByEmail: mocks.getUserByEmail,
    createUser: mocks.createUser,
  })),
}));

vi.mock("bcryptjs", () => ({
  default: { compare: mocks.compare, hash: mocks.hash },
}));

vi.mock("../src/config/env.js", () => ({
  env: { JWT_SECRET: mocks.jwtSecret },
}));

vi.mock("../src/config/prisma.js", () => ({
  prisma: {
    doctor: { findUnique: mocks.findDoctorById },
    user: { create: mocks.createUser },
  },
}));

vi.mock("../src/models/usersModel.js", () => ({
  createUsersModel: mocks.createUsersModel,
}));

import { login, registerUser } from "../src/services/authService.js";

describe("auth service", () => {
  const user: User = {
    id: "a13c3378-e2a3-4408-b19e-4c9a7fd661a8",
    email: "doctor@example.com",
    passwordHash: "stored-password-hash",
    role: "MEDICO",
    doctorId: "b13c3378-e2a3-4408-b19e-4c9a7fd661a8",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects a login when the user does not exist", async () => {
    mocks.getUserByEmail.mockResolvedValue(null);

    await expect(login(user.email, "password")).rejects.toThrow(
      "Credenciales inválidas",
    );
    expect(mocks.getUserByEmail).toHaveBeenCalledWith(user.email);
    expect(mocks.compare).not.toHaveBeenCalled();
  });

  it("rejects a login when the password is incorrect", async () => {
    mocks.getUserByEmail.mockResolvedValue(user);
    mocks.compare.mockResolvedValue(false);

    await expect(login(user.email, "wrong-password")).rejects.toThrow(
      "Credenciales inválidas",
    );
  });

  it("logs in successfully and returns only public user data", async () => {
    mocks.getUserByEmail.mockResolvedValue(user);
    mocks.compare.mockResolvedValue(true);

    const result = await login(user.email, "correct-password");

    expect(result.user).toEqual({
      id: user.id,
      email: user.email,
      role: user.role,
      doctorId: user.doctorId,
    });
    expect(result.token).toEqual(expect.any(String));
    expect(result.user).not.toHaveProperty("passwordHash");
  });

  it("compares the supplied password with the stored hash", async () => {
    mocks.getUserByEmail.mockResolvedValue(user);
    mocks.compare.mockResolvedValue(true);

    await login(user.email, "correct-password");

    expect(mocks.compare).toHaveBeenCalledWith(
      "correct-password",
      "stored-password-hash",
    );
  });

  it("includes the user UUID and role in the JWT payload", async () => {
    mocks.getUserByEmail.mockResolvedValue(user);
    mocks.compare.mockResolvedValue(true);

    const { token } = await login(user.email, "correct-password");
    const payload = jwt.verify(token, mocks.jwtSecret);

    expect(payload).toMatchObject({
      sub: user.id,
      role: user.role,
    });
    expect(payload).not.toHaveProperty("password");
    expect(payload).not.toHaveProperty("passwordHash");
  });

  it("sets the JWT expiration to eight hours", async () => {
    mocks.getUserByEmail.mockResolvedValue(user);
    mocks.compare.mockResolvedValue(true);

    const { token } = await login(user.email, "correct-password");
    const payload = jwt.verify(token, mocks.jwtSecret) as JwtPayload;

    expect(payload.exp).toBeDefined();
    expect(payload.iat).toBeDefined();
    expect(payload.exp! - payload.iat!).toBe(60 * 60 * 8);
  });

  it("registers a user with a bcrypt hash and without exposing the password", async () => {
    mocks.findDoctorById.mockResolvedValue({ id: user.doctorId });
    mocks.hash.mockResolvedValue("hashed-password");
    mocks.createUser.mockResolvedValue({
      ...user,
      id: "new-user-id",
      email: "new-user@example.com",
      role: "RECEPCIONISTA",
      doctorId: null,
      passwordHash: "hashed-password",
    });

    const result = await registerUser({
      email: "New-User@Example.com",
      password: "supersecure123",
      role: "RECEPCIONISTA",
    });

    expect(mocks.hash).toHaveBeenCalledWith("supersecure123", 12);
    expect(mocks.createUser).toHaveBeenCalledWith({
      email: "new-user@example.com",
      passwordHash: "hashed-password",
      role: "RECEPCIONISTA",
    });
    expect(result).toEqual({
      id: "new-user-id",
      email: "new-user@example.com",
      role: "RECEPCIONISTA",
      doctorId: null,
    });
    expect(result).not.toHaveProperty("passwordHash");
  });

  it("rejects registration when the provided doctor does not exist", async () => {
    mocks.findDoctorById.mockResolvedValue(null);

    await expect(
      registerUser({
        email: "manager@example.com",
        password: "supersecure123",
        role: "GERENCIA",
        doctorId: "missing-doctor-id",
      }),
    ).rejects.toThrow("El doctor especificado no existe");
  });
});
