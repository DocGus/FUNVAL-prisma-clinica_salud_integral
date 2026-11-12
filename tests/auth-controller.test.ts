import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
  jwtSecret: "test-secret-with-at-least-thirty-two-characters",
}));

vi.mock("../src/config/env.js", () => ({
  env: { JWT_SECRET: mocks.jwtSecret },
}));

vi.mock("../src/services/authService.js", () => ({
  login: mocks.login,
  registerUser: mocks.register,
}));

import authRoutes from "../src/routes/authRoutes.js";

const createToken = (role: "GERENCIA" | "MEDICO" | "RECEPCIONISTA") =>
  jwt.sign(
    { sub: "11111111-1111-4111-8111-111111111111", role },
    mocks.jwtSecret,
    { expiresIn: "8h" },
  );

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

describe("Auth controller", () => {
  const validCredentials = {
    email: "doctor@example.com",
    password: "password",
  };
  const loginResult = {
    token: "signed.jwt.token",
    user: {
      id: "a13c3378-e2a3-4408-b19e-4c9a7fd661a8",
      email: validCredentials.email,
      role: "MEDICO",
      doctorId: "b13c3378-e2a3-4408-b19e-4c9a7fd661a8",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with a token and public user data on successful login", async () => {
    mocks.login.mockResolvedValue(loginResult);

    const response = await request(app)
      .post("/api/auth")
      .send(validCredentials)
      .expect(200);

    expect(response.body).toEqual(loginResult);
    expect(response.body.user).not.toHaveProperty("passwordHash");
    expect(mocks.login).toHaveBeenCalledWith(
      validCredentials.email,
      validCredentials.password,
    );
  });

  it("returns 401 with a generic message for invalid credentials", async () => {
    mocks.login.mockRejectedValue(new Error("Credenciales inválidas"));

    const response = await request(app)
      .post("/api/auth")
      .send(validCredentials)
      .expect(401);

    expect(response.body).toEqual({ message: "Credenciales inválidas" });
  });

  it("returns 400 when the login data is invalid", async () => {
    const response = await request(app)
      .post("/api/auth")
      .send({ email: "invalid-email", password: "" })
      .expect(400);

    expect(response.body.message).toBe("Datos de inicio de sesión inválidos");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(mocks.login).not.toHaveBeenCalled();
  });

  it("returns 400 when the email has exterior whitespace", async () => {
    await request(app)
      .post("/api/auth")
      .send({ ...validCredentials, email: " doctor@example.com " })
      .expect(400);

    expect(mocks.login).not.toHaveBeenCalled();
  });

  it("returns 500 without exposing unexpected error details", async () => {
    mocks.login.mockRejectedValue(new Error("internal detail"));

    const response = await request(app)
      .post("/api/auth")
      .send(validCredentials)
      .expect(500);

    expect(response.body).toEqual({
      message: "Error interno al iniciar sesión",
    });
    expect(response.text).not.toContain("internal detail");
  });

  it("returns 201 when a GERENCIA account can register a valid user", async () => {
    mocks.register.mockResolvedValue({
      id: "new-user-id",
      email: "recepcionista@example.com",
      role: "RECEPCIONISTA",
      doctorId: null,
    });

    const response = await request(app)
      .post("/api/auth/register")
      .set("Authorization", `Bearer ${createToken("GERENCIA")}`)
      .send({
        email: "recepcionista@example.com",
        password: "supersecure123",
        role: "RECEPCIONISTA",
      })
      .expect(201);

    expect(response.body).toEqual({
      message: "Usuario registrado correctamente",
      data: {
        id: "new-user-id",
        email: "recepcionista@example.com",
        role: "RECEPCIONISTA",
        doctorId: null,
      },
    });
    expect(mocks.register).toHaveBeenCalledWith({
      email: "recepcionista@example.com",
      password: "supersecure123",
      role: "RECEPCIONISTA",
    });
  });

  it("rejects registration without a token", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        email: "recepcionista@example.com",
        password: "supersecure123",
        role: "RECEPCIONISTA",
      })
      .expect(401);
  });

  it("returns 403 when the token belongs to a non-GERENCIA role", async () => {
    await request(app)
      .post("/api/auth/register")
      .set("Authorization", `Bearer ${createToken("RECEPCIONISTA")}`)
      .send({
        email: "recepcionista@example.com",
        password: "supersecure123",
        role: "RECEPCIONISTA",
      })
      .expect(403);
  });

  it("returns 400 when register payload is invalid", async () => {
    await request(app)
      .post("/api/auth/register")
      .set("Authorization", `Bearer ${createToken("GERENCIA")}`)
      .send({
        email: "invalid-email",
        password: "short",
        role: "INVALID",
      })
      .expect(400);
  });
});
