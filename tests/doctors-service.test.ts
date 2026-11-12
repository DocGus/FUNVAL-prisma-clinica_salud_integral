import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getDoctors: vi.fn(),
  createDoctorsModel: vi.fn(() => ({
    getDoctors: mocks.getDoctors,
  })),
}));

vi.mock("../src/models/doctorsModel.js", () => ({
  createDoctorsModel: mocks.createDoctorsModel,
}));

vi.mock("../src/config/prisma.js", () => ({
  prisma: {},
}));

import * as doctorsService from "../src/services/doctorsService.js";

describe("doctors service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates an unfiltered directory query to the model", async () => {
    const doctors = [{ id: "doctor-id" }];
    mocks.getDoctors.mockResolvedValue(doctors);

    await expect(doctorsService.getDoctors()).resolves.toEqual(doctors);
    expect(mocks.getDoctors).toHaveBeenCalledWith(undefined);
  });

  it("delegates the specialty-name filter to the model", async () => {
    const doctors = [{ id: "doctor-id" }];
    mocks.getDoctors.mockResolvedValue(doctors);

    await expect(
      doctorsService.getDoctors("Medicina General"),
    ).resolves.toEqual(doctors);
    expect(mocks.getDoctors).toHaveBeenCalledWith("Medicina General");
  });
});
