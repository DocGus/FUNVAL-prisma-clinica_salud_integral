import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSpecialties: vi.fn(),
}));

vi.mock("../src/services/specialtiesService.js", () => ({
  getSpecialties: mocks.getSpecialties,
}));

import specialtiesRoutes from "../src/routes/specialtiesRoutes.js";

const app = express();
app.use("/api/specialties", specialtiesRoutes);

describe("specialties controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the specialty catalog from the public endpoint", async () => {
    const specialties = [
      { id: "specialty-id", name: "Cardiologia" },
    ];
    mocks.getSpecialties.mockResolvedValue(specialties);

    await request(app)
      .get("/api/specialties")
      .expect(200, { data: specialties });
    expect(mocks.getSpecialties).toHaveBeenCalledOnce();
  });

  it("returns an empty catalog when no specialties exist", async () => {
    mocks.getSpecialties.mockResolvedValue([]);

    await request(app)
      .get("/api/specialties")
      .expect(200, { data: [] });
  });

  it("returns 500 when the catalog query fails", async () => {
    mocks.getSpecialties.mockRejectedValue(new Error("database failure"));

    await request(app)
      .get("/api/specialties")
      .expect(500, {
        message: "Error interno al consultar especialidades",
      });
  });
});
