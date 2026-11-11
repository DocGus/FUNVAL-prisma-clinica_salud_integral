
import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  jwtSecret: "test-secret-with-at-least-thirty-two-characters",
  createPatient: vi.fn(),
  getPatientById: vi.fn(),
}));

vi.mock("../src/config/env.js", () => ({
  env: { JWT_SECRET: mocks.jwtSecret },
}));

vi.mock("../src/services/patientsService.js", () => ({
  createPatient: mocks.createPatient,
  getPatientById: mocks.getPatientById,
}));

import patientsRoutes from "../src/routes/patientsRoutes.js";

const app = express();
app.use(express.json());
app.use("/api/patients", patientsRoutes);

const createToken = (role: "RECEPCIONISTA" | "MEDICO" | "GERENCIA") =>
  jwt.sign(
    {
      sub: "a13c3378-e2a3-4408-b19e-4c9a7fd661a8",
      role,
    },
    mocks.jwtSecret,
    { expiresIn: "1h" },
  );

describe("Patients controller", () => {
  const patient = {
    id: "a13c3378-e2a3-4408-b19e-4c9a7fd661a8",
    firstName: "Juan",
    lastName: "Perez",
    email: "juan.perez@example.com",
    birthDate: new Date("1990-05-15T00:00:00.000Z"),
    phone: "5512345678",
  };

  const validPatientInput = {
    firstName: "Juan",
    lastName: "Perez",
    email: "juan.perez@example.com",
    birthDate: "1990-05-15",
    phone: "5512345678",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a patient and returns 201", async () => {
    mocks.createPatient.mockResolvedValue(patient);

    const response = await request(app)
      .post("/api/patients")
      .set("Authorization", `Bearer ${createToken("RECEPCIONISTA")}`)
      .send(validPatientInput)
      .expect(201);

    expect(response.body.data.email).toBe(patient.email);
    expect(mocks.createPatient).toHaveBeenCalledOnce();
  });

  it("returns 400 when patient data is invalid", async () => {
    await request(app)
      .post("/api/patients")
      .set("Authorization", `Bearer ${createToken("RECEPCIONISTA")}`)
      .send({ ...validPatientInput, email: "invalid-email" })
      .expect(400);

    expect(mocks.createPatient).not.toHaveBeenCalled();
  });

  it("returns 409 when the email already exists", async () => {
    mocks.createPatient.mockRejectedValue({ code: "P2002" });

    const response = await request(app)
      .post("/api/patients")
      .set("Authorization", `Bearer ${createToken("RECEPCIONISTA")}`)
      .send(validPatientInput)
      .expect(409);

    expect(response.body.message).toContain("correo electrónico");
  });

  it("returns 401 when creating a patient without a token", async () => {
    await request(app)
      .post("/api/patients")
      .send(validPatientInput)
      .expect(401);

    expect(mocks.createPatient).not.toHaveBeenCalled();
  });

  it.each(["MEDICO", "GERENCIA"] as const)(
    "returns 403 when %s attempts to create a patient",
    async (role) => {
      await request(app)
        .post("/api/patients")
        .set("Authorization", `Bearer ${createToken(role)}`)
        .send(validPatientInput)
        .expect(403);

      expect(mocks.createPatient).not.toHaveBeenCalled();
    },
  );

  it("returns a patient record with the complete appointment history", async () => {
    const patientWithHistory = {
      ...patient,
      appointments: [
        {
          id: "c13c3378-e2a3-4408-b19e-4c9a7fd661a8",
          startAt: "2026-11-12T16:00:00.000Z",
          status: "COMPLETADA",
          doctor: {
            id: "d13c3378-e2a3-4408-b19e-4c9a7fd661a8",
            firstName: "Ana",
            lastName: "Lopez",
            specialty: { id: "e13c3378-e2a3-4408-b19e-4c9a7fd661a8", name: "General" },
          },
        },
        {
          id: "f13c3378-e2a3-4408-b19e-4c9a7fd661a8",
          startAt: "2026-11-13T16:00:00.000Z",
          status: "CANCELADA",
          doctor: {
            id: "d13c3378-e2a3-4408-b19e-4c9a7fd661a8",
            firstName: "Ana",
            lastName: "Lopez",
            specialty: { id: "e13c3378-e2a3-4408-b19e-4c9a7fd661a8", name: "General" },
          },
        },
      ],
    };
    mocks.getPatientById.mockResolvedValue(patientWithHistory);

    const response = await request(app)
      .get(`/api/patients/${patient.id}`)
      .set("Authorization", `Bearer ${createToken("RECEPCIONISTA")}`)
      .expect(200);

    expect(response.body.data).toEqual({
      ...patientWithHistory,
      birthDate: patient.birthDate.toISOString(),
    });
    expect(response.body.data.appointments).toHaveLength(2);
    expect(response.body.data.appointments[0].doctor.specialty.name).toBe("General");
  });

  it("returns 401 when consulting a patient record without a token", async () => {
    await request(app)
      .get(`/api/patients/${patient.id}`)
      .expect(401);

    expect(mocks.getPatientById).not.toHaveBeenCalled();
  });

  it.each(["MEDICO", "GERENCIA"] as const)(
    "returns 403 when %s attempts to consult a patient record",
    async (role) => {
      await request(app)
        .get(`/api/patients/${patient.id}`)
        .set("Authorization", `Bearer ${createToken(role)}`)
        .expect(403);

      expect(mocks.getPatientById).not.toHaveBeenCalled();
    },
  );

  it("returns 404 for the removed patient list endpoint", async () => {
    await request(app)
      .get("/api/patients")
      .set("Authorization", `Bearer ${createToken("RECEPCIONISTA")}`)
      .expect(404);
  });

  it("returns 400 when the patient ID is not a valid UUID", async () => {
    await request(app)
      .get("/api/patients/invalid-id")
      .set("Authorization", `Bearer ${createToken("RECEPCIONISTA")}`)
      .expect(400);

    expect(mocks.getPatientById).not.toHaveBeenCalled();
  });

  it("returns 404 when the patient does not exist", async () => {
    mocks.getPatientById.mockResolvedValue(null);

    await request(app)
      .get("/api/patients/00000000-0000-4000-8000-000000000001")
      .set("Authorization", `Bearer ${createToken("RECEPCIONISTA")}`)
      .expect(404);
  });
});
