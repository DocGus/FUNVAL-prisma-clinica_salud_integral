import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createPatient: vi.fn(),
  getAllPatients: vi.fn(),
  getPatientById: vi.fn(),
  createPatientsModel: vi.fn(() => ({
    createPatient: mocks.createPatient,
    getAllPatients: mocks.getAllPatients,
    getPatientById: mocks.getPatientById,
  })),
}));

vi.mock("../src/models/patientsModel.js", () => ({
  createPatientsModel: mocks.createPatientsModel,
}));

vi.mock("../src/config/prisma.js", () => ({
  prisma: {},
}));

import * as patientsService from "../src/services/patientsService.js";

describe("patients service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps validated patient data and delegates creation to the model", async () => {
    const input = {
      firstName: "Juan",
      lastName: "Perez",
      email: "juan.perez@example.com",
      birthDate: new Date("1990-05-15T00:00:00.000Z"),
    };
    const patient = { id: "patient-id", ...input, phone: null };
    mocks.createPatient.mockResolvedValue(patient);

    await expect(patientsService.createPatient(input)).resolves.toEqual(patient);
    expect(mocks.createPatient).toHaveBeenCalledWith({
      ...input,
      phone: null,
    });
  });

  it("delegates patient listing to the model", async () => {
    const patients = [{ id: "patient-id" }];
    mocks.getAllPatients.mockResolvedValue(patients);

    await expect(patientsService.getAllPatients()).resolves.toEqual(patients);
    expect(mocks.getAllPatients).toHaveBeenCalledOnce();
  });

  it("delegates patient lookup to the model", async () => {
    const patient = { id: "patient-id" };
    mocks.getPatientById.mockResolvedValue(patient);

    await expect(patientsService.getPatientById("patient-id")).resolves.toEqual(patient);
    expect(mocks.getPatientById).toHaveBeenCalledWith("patient-id");
  });
});
