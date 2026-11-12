import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  jwtSecret: "test-secret-with-at-least-thirty-two-characters",
  getDoctors: vi.fn(),
}));

vi.mock("../src/config/env.js", () => ({
  env: { JWT_SECRET: mocks.jwtSecret },
}));

vi.mock("../src/services/doctorsService.js", () => ({
  getDoctors: mocks.getDoctors,
}));

import doctorsRoutes from "../src/routes/doctorsRoutes.js";

const app = express();
app.use(express.json());
app.use("/api/doctors", doctorsRoutes);

const createToken = (role: "RECEPCIONISTA" | "MEDICO" | "GERENCIA") =>
  jwt.sign(
    {
      sub: "a13c3378-e2a3-4408-b19e-4c9a7fd661a8",
      role,
    },
    mocks.jwtSecret,
    { expiresIn: "1h" },
  );

describe("Doctors controller", () => {
  const doctors = [
    {
      id: "a13c3378-e2a3-4408-b19e-4c9a7fd661a8",
      firstName: "Ana",
      lastName: "Lopez",
      professionalLicense: "LIC-123",
      email: "ana.lopez@example.com",
      specialty: {
        id: "b13c3378-e2a3-4408-b19e-4c9a7fd661a8",
        name: "Medicina general",
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the doctor directory without a filter", async () => {
    mocks.getDoctors.mockResolvedValue(doctors);

    const response = await request(app)
      .get("/api/doctors")
      .set("Authorization", `Bearer ${createToken("RECEPCIONISTA")}`)
      .expect(200);

    expect(response.body).toEqual({ data: doctors });
    expect(mocks.getDoctors).toHaveBeenCalledWith(undefined);
  });

  it("passes the specialty name filter to the service", async () => {
    mocks.getDoctors.mockResolvedValue(doctors);
    const specialtyName = doctors[0]!.specialty.name;

    const response = await request(app)
      .get(`/api/doctors?specialty=${encodeURIComponent(specialtyName)}`)
      .set("Authorization", `Bearer ${createToken("RECEPCIONISTA")}`)
      .expect(200);

    expect(response.body).toEqual({ data: doctors });
    expect(mocks.getDoctors).toHaveBeenCalledWith(specialtyName);
  });

  it("returns 400 for an empty specialty filter", async () => {
    await request(app)
      .get("/api/doctors?specialty=")
      .set("Authorization", `Bearer ${createToken("RECEPCIONISTA")}`)
      .expect(400);

    expect(mocks.getDoctors).not.toHaveBeenCalled();
  });

  it("returns 401 without a token", async () => {
    await request(app).get("/api/doctors").expect(401);
    expect(mocks.getDoctors).not.toHaveBeenCalled();
  });

  it("returns 403 for MEDICO", async () => {
    await request(app)
      .get("/api/doctors")
      .set("Authorization", `Bearer ${createToken("MEDICO")}`)
      .expect(403);

    expect(mocks.getDoctors).not.toHaveBeenCalled();
  });

  it("returns 403 for GERENCIA", async () => {
    await request(app)
      .get("/api/doctors")
      .set("Authorization", `Bearer ${createToken("GERENCIA")}`)
      .expect(403);

    expect(mocks.getDoctors).not.toHaveBeenCalled();
  });

  it("allows RECEPCIONISTA", async () => {
    mocks.getDoctors.mockResolvedValue(doctors);

    await request(app)
      .get("/api/doctors")
      .set("Authorization", `Bearer ${createToken("RECEPCIONISTA")}`)
      .expect(200);
  });

  it("returns an empty array when there are no doctors", async () => {
    mocks.getDoctors.mockResolvedValue([]);

    const response = await request(app)
      .get("/api/doctors")
      .set("Authorization", `Bearer ${createToken("RECEPCIONISTA")}`)
      .expect(200);

    expect(response.body).toEqual({ data: [] });
  });
});
