
import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createPatient: vi.fn(),
  getAllPatients: vi.fn(),
  getPatientById: vi.fn(),
}));

vi.mock("../src/services/patientsService.js", () => ({
  createPatient: mocks.createPatient,
  getAllPatients: mocks.getAllPatients,
  getPatientById: mocks.getPatientById,
}));

import patientsRoutes from "../src/routes/patientsRoutes.js";

const app = express();
app.use(express.json());
app.use("/api/patients", patientsRoutes);

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
      .send(validPatientInput)
      .expect(201);

    expect(response.body.data.email).toBe(patient.email);
    expect(mocks.createPatient).toHaveBeenCalledOnce();
  });

  it("returns 400 when patient data is invalid", async () => {
    await request(app)
      .post("/api/patients")
      .send({ ...validPatientInput, email: "invalid-email" })
      .expect(400);

    expect(mocks.createPatient).not.toHaveBeenCalled();
  });

  it("returns 409 when the email already exists", async () => {
    mocks.createPatient.mockRejectedValue({ code: "P2002" });

    const response = await request(app)
      .post("/api/patients")
      .send(validPatientInput)
      .expect(409);

    expect(response.body.message).toContain("correo electrónico");
  });

  it("returns all patients", async () => {
    mocks.getAllPatients.mockResolvedValue([patient]);

    const response = await request(app)
      .get("/api/patients")
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].email).toBe(patient.email);
  });

  it("returns a patient by ID", async () => {
    mocks.getPatientById.mockResolvedValue(patient);

    const response = await request(app)
      .get(`/api/patients/${patient.id}`)
      .expect(200);

    expect(response.body.data.id).toBe(patient.id);
  });

  it("returns 400 when the patient ID is not a valid UUID", async () => {
    await request(app)
      .get("/api/patients/invalid-id")
      .expect(400);

    expect(mocks.getPatientById).not.toHaveBeenCalled();
  });

  it("returns 404 when the patient does not exist", async () => {
    mocks.getPatientById.mockResolvedValue(null);

    await request(app)
      .get("/api/patients/00000000-0000-4000-8000-000000000001")
      .expect(404);
  });
});
