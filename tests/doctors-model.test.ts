import type { Prisma } from "../generated/prisma/client.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createDoctorsModel } from "../src/models/doctorsModel.js";

type DoctorDirectorySelect = {
  id: true;
  firstName: true;
  lastName: true;
  professionalLicense: true;
  email: true;
  specialty: {
    select: {
      id: true;
      name: true;
    };
  };
};

type DoctorDirectoryEntry = Prisma.DoctorGetPayload<{
  select: DoctorDirectorySelect;
}>;

type DoctorsModelClient = {
  doctor: {
    findMany(args: {
      where?: Prisma.DoctorWhereInput;
      select: DoctorDirectorySelect;
    }): Promise<DoctorDirectoryEntry[]>;
  };
};

const mocks = vi.hoisted(() => ({
  findMany: vi.fn<DoctorsModelClient["doctor"]["findMany"]>(),
}));

describe("doctors model", () => {
  const doctorsClient = {
    doctor: {
      findMany: mocks.findMany,
    },
  } satisfies DoctorsModelClient;
  const doctorsModel = createDoctorsModel(doctorsClient);

  const doctor: DoctorDirectoryEntry = {
    id: "a13c3378-e2a3-4408-b19e-4c9a7fd661a8",
    firstName: "Ana",
    lastName: "Lopez",
    professionalLicense: "LIC-123",
    email: "ana.lopez@example.com",
    specialty: {
      id: "b13c3378-e2a3-4408-b19e-4c9a7fd661a8",
      name: "Medicina general",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retrieves the doctor directory with specialty data only", async () => {
    mocks.findMany.mockResolvedValue([doctor]);

    await expect(doctorsModel.getDoctors()).resolves.toEqual([doctor]);
    expect(mocks.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        professionalLicense: true,
        email: true,
        specialty: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  });

  it("filters doctors by specialty name with case-insensitive exact comparison", async () => {
    mocks.findMany.mockResolvedValue([doctor]);

    await expect(
      doctorsModel.getDoctors("medicina general"),
    ).resolves.toEqual([doctor]);
    expect(mocks.findMany).toHaveBeenCalledWith({
      where: {
        specialty: {
          is: {
            name: {
              equals: "medicina general",
              mode: "insensitive",
            },
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        professionalLicense: true,
        email: true,
        specialty: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  });

  it("returns an empty list when no doctors match", async () => {
    mocks.findMany.mockResolvedValue([]);

    await expect(doctorsModel.getDoctors()).resolves.toEqual([]);
  });
});
