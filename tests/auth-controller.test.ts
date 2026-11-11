import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
}));

vi.mock("../src/services/authService.js", () => ({
  login: mocks.login,
}));

import authRoutes from "../src/routes/authRoutes.js";

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
});
