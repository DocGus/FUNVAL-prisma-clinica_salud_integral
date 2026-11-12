import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSpecialties: vi.fn(),
}));

vi.mock("../src/models/specialtiesModel.js", () => ({
  createSpecialtiesModel: () => ({
    getSpecialties: mocks.getSpecialties,
  }),
}));

vi.mock("../src/config/prisma.js", () => ({
  prisma: {},
}));

import * as specialtiesService from "../src/services/specialtiesService.js";

describe("specialties service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates the query to the model", async () => {
    const specialties = [{ id: "specialty-id", name: "Cardiologia" }];
    mocks.getSpecialties.mockResolvedValue(specialties);

    await expect(specialtiesService.getSpecialties()).resolves.toEqual(
      specialties,
    );
    expect(mocks.getSpecialties).toHaveBeenCalledOnce();
  });
});
