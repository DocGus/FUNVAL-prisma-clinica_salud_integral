import type { Prisma } from "../generated/prisma/client.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSpecialtiesModel } from "../src/models/specialtiesModel.js";

type SpecialtySelect = {
  id: true;
  name: true;
};

type Specialty = Prisma.SpecialtyGetPayload<{ select: SpecialtySelect }>;

type SpecialtiesModelClient = {
  specialty: {
    findMany(args: {
      orderBy: Prisma.SpecialtyOrderByWithRelationInput[];
      select: SpecialtySelect;
    }): Promise<Specialty[]>;
  };
};

const mocks = vi.hoisted(() => ({
  findMany: vi.fn<SpecialtiesModelClient["specialty"]["findMany"]>(),
}));

describe("specialties model", () => {
  const specialtiesClient = {
    specialty: {
      findMany: mocks.findMany,
    },
  } satisfies SpecialtiesModelClient;
  const specialtiesModel = createSpecialtiesModel(specialtiesClient);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retrieves specialties ordered by name without loading doctors", async () => {
    const specialties: Specialty[] = [
      {
        id: "a13c3378-e2a3-4408-b19e-4c9a7fd661a8",
        name: "Cardiologia",
      },
      {
        id: "b13c3378-e2a3-4408-b19e-4c9a7fd661a8",
        name: "Pediatria",
      },
    ];
    mocks.findMany.mockResolvedValue(specialties);

    await expect(specialtiesModel.getSpecialties()).resolves.toEqual(specialties);
    expect(mocks.findMany).toHaveBeenCalledWith({
      orderBy: [{ name: "asc" }],
      select: { id: true, name: true },
    });
  });

  it("returns an empty list when there are no specialties", async () => {
    mocks.findMany.mockResolvedValue([]);

    await expect(specialtiesModel.getSpecialties()).resolves.toEqual([]);
  });
});
