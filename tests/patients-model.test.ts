import type { Patient, Prisma } from "../generated/prisma/client.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createPatientsModel } from "../src/models/patientsModel.js";

type PatientModelClient = {
  patient: {
    create(args: { data: Prisma.PatientCreateInput }): Promise<Patient>;
    findMany(args: {
      orderBy: Prisma.PatientOrderByWithRelationInput[];
    }): Promise<Patient[]>;
    findUnique(args: {
      where: Prisma.PatientWhereUniqueInput;
    }): Promise<Patient | null>;
  };
};

const mocks = vi.hoisted(() => ({
  create: vi.fn<PatientModelClient["patient"]["create"]>(),
  findMany: vi.fn<PatientModelClient["patient"]["findMany"]>(),
  findUnique: vi.fn<PatientModelClient["patient"]["findUnique"]>(),
}));

describe("patients model", () => {
  const patientClient = {
    patient: {
      create: mocks.create,
      findMany: mocks.findMany,
      findUnique: mocks.findUnique,
    },
  } satisfies PatientModelClient;
  const patientsModel = createPatientsModel(patientClient);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a patient through Prisma", async () => {
    const data: Prisma.PatientCreateInput = {
      firstName: "Juan",
      lastName: "Perez",
      email: "juan.perez@example.com",
      birthDate: new Date("1990-05-15T00:00:00.000Z"),
      phone: null,
    };
    const patient: Patient = {
      id: "a13c3378-e2a3-4408-b19e-4c9a7fd661a8",
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      birthDate: new Date("1990-05-15T00:00:00.000Z"),
      phone: data.phone ?? null,
    };
    mocks.create.mockResolvedValue(patient);

    await expect(patientsModel.createPatient(data)).resolves.toEqual(patient);
    expect(mocks.create).toHaveBeenCalledWith({ data });
  });

  it("retrieves patients ordered by last name and first name", async () => {
    const patients: Patient[] = [{
      id: "a13c3378-e2a3-4408-b19e-4c9a7fd661a8",
      firstName: "Juan",
      lastName: "Perez",
      email: "juan.perez@example.com",
      birthDate: new Date("1990-05-15T00:00:00.000Z"),
      phone: null,
    }];
    mocks.findMany.mockResolvedValue(patients);

    await expect(patientsModel.getAllPatients()).resolves.toEqual(patients);
    expect(mocks.findMany).toHaveBeenCalledWith({
      orderBy: [
        { lastName: "asc" },
        { firstName: "asc" },
      ],
    });
  });

  it("retrieves a patient by ID", async () => {
    const patient: Patient = {
      id: "a13c3378-e2a3-4408-b19e-4c9a7fd661a8",
      firstName: "Juan",
      lastName: "Perez",
      email: "juan.perez@example.com",
      birthDate: new Date("1990-05-15T00:00:00.000Z"),
      phone: null,
    };
    mocks.findUnique.mockResolvedValue(patient);

    await expect(
      patientsModel.getPatientById(patient.id),
    ).resolves.toEqual(patient);
    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: { id: patient.id },
    });
  });
});
