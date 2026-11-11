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
      include: {
        appointments: {
          include: {
            doctor: {
              include: {
                specialty: true;
              };
            };
          };
          orderBy: Prisma.AppointmentOrderByWithRelationInput;
        };
      };
    }): Promise<
      Prisma.PatientGetPayload<{
        include: {
          appointments: {
            include: {
              doctor: {
                include: {
                  specialty: true;
                };
              };
            };
          };
        };
      }> | null
    >;
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

  it("retrieves a patient by ID with appointments and their doctor specialty", async () => {
    mocks.findUnique.mockResolvedValue(null);

    await expect(
      patientsModel.getPatientById("a13c3378-e2a3-4408-b19e-4c9a7fd661a8"),
    ).resolves.toBeNull();
    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: { id: "a13c3378-e2a3-4408-b19e-4c9a7fd661a8" },
      include: {
        appointments: {
          include: {
            doctor: {
              include: {
                specialty: true,
              },
            },
          },
          orderBy: {
            startAt: "desc",
          },
        },
      },
    });
  });

  it("returns a patient with an empty appointment list when no appointments exist", async () => {
    const patientWithoutAppointments = {
      id: "a13c3378-e2a3-4408-b19e-4c9a7fd661a8",
      firstName: "Juan",
      lastName: "Perez",
      email: "juan.perez@example.com",
      birthDate: new Date("1990-05-15T00:00:00.000Z"),
      phone: null,
      appointments: [],
    } satisfies NonNullable<
      Awaited<ReturnType<typeof patientsModel.getPatientById>>
    >;
    mocks.findUnique.mockResolvedValue(patientWithoutAppointments);

    await expect(
      patientsModel.getPatientById(patientWithoutAppointments.id),
    ).resolves.toEqual(patientWithoutAppointments);
    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: { id: patientWithoutAppointments.id },
      include: {
        appointments: {
          include: {
            doctor: {
              include: {
                specialty: true,
              },
            },
          },
          orderBy: {
            startAt: "desc",
          },
        },
      },
    });
  });
});
