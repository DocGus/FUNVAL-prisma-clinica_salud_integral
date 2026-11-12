import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  jwtSecret: "test-secret-with-at-least-thirty-two-characters",
  getAppointmentsBySpecialty: vi.fn(),
  getDailyCutoff: vi.fn(),
}));

vi.mock("../src/config/env.js", () => ({
  env: { JWT_SECRET: mocks.jwtSecret },
}));

vi.mock("../src/services/reportsService.js", () => ({
  getAppointmentsBySpecialty: mocks.getAppointmentsBySpecialty,
  getDailyCutoff: mocks.getDailyCutoff,
}));

import reportsRoutes from "../src/routes/reportsRoutes.js";

const app = express();
app.use(express.json());
app.use("/api/reports", reportsRoutes);

const createToken = (role: "RECEPCIONISTA" | "MEDICO" | "GERENCIA") =>
  jwt.sign(
    {
      sub: "11111111-1111-4111-8111-111111111111",
      role,
    },
    mocks.jwtSecret,
    { expiresIn: "8h" },
  );

describe("reports controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the appointment volume by specialty for GERENCIA", async () => {
    const payload = [
      { specialtyId: "11111111-1111-4111-8111-111111111111", specialty: "Cardiología", totalAppointments: 4 },
      { specialtyId: "22222222-2222-4222-8222-222222222222", specialty: "Medicina General", totalAppointments: 0 },
    ];

    mocks.getAppointmentsBySpecialty.mockResolvedValue(payload);

    const response = await request(app)
      .get("/api/reports/appointments-by-specialty")
      .set("Authorization", `Bearer ${createToken("GERENCIA")}`)
      .expect(200);

    expect(response.body).toEqual({ data: payload });
    expect(mocks.getAppointmentsBySpecialty).toHaveBeenCalledTimes(1);
  });

  it("includes specialties without appointments", async () => {
    mocks.getAppointmentsBySpecialty.mockResolvedValue([
      { specialtyId: "33333333-3333-4333-8333-333333333333", specialty: "Pediatría", totalAppointments: 0 },
    ]);

    const response = await request(app)
      .get("/api/reports/appointments-by-specialty")
      .set("Authorization", `Bearer ${createToken("GERENCIA")}`)
      .expect(200);

    expect(response.body.data[0]).toMatchObject({
      specialty: "Pediatría",
      totalAppointments: 0,
    });
  });

  it("rejects reports without a token", async () => {
    await request(app).get("/api/reports/appointments-by-specialty").expect(401);
    expect(mocks.getAppointmentsBySpecialty).not.toHaveBeenCalled();
  });

  it("rejects non-GERENCIA roles for specialty reports", async () => {
    await request(app)
      .get("/api/reports/appointments-by-specialty")
      .set("Authorization", `Bearer ${createToken("RECEPCIONISTA")}`)
      .expect(403);

    expect(mocks.getAppointmentsBySpecialty).not.toHaveBeenCalled();
  });

  it("handles specialty report errors", async () => {
    mocks.getAppointmentsBySpecialty.mockRejectedValue(new Error("DB error"));

    const response = await request(app)
      .get("/api/reports/appointments-by-specialty")
      .set("Authorization", `Bearer ${createToken("GERENCIA")}`)
      .expect(500);

    expect(response.body).toEqual({
      message: "Error interno al consultar el reporte por especialidad",
    });
  });

  it("accepts a valid daily cutoff date", async () => {
    mocks.getDailyCutoff.mockResolvedValue({
      date: "2026-11-12",
      completed: 8,
      cancelled: 3,
      total: 11,
    });

    const response = await request(app)
      .get("/api/reports/daily-cutoff?date=2026-11-12")
      .set("Authorization", `Bearer ${createToken("GERENCIA")}`)
      .expect(200);

    expect(response.body).toEqual({
      data: {
        date: "2026-11-12",
        completed: 8,
        cancelled: 3,
        total: 11,
      },
    });
    expect(mocks.getDailyCutoff).toHaveBeenCalledWith("2026-11-12");
  });

  it("rejects missing date for the daily cutoff", async () => {
    await request(app)
      .get("/api/reports/daily-cutoff")
      .set("Authorization", `Bearer ${createToken("GERENCIA")}`)
      .expect(400);

    expect(mocks.getDailyCutoff).not.toHaveBeenCalled();
  });

  it("rejects invalid dates for the daily cutoff", async () => {
    await request(app)
      .get("/api/reports/daily-cutoff?date=2026-02-30")
      .set("Authorization", `Bearer ${createToken("GERENCIA")}`)
      .expect(400);

    expect(mocks.getDailyCutoff).not.toHaveBeenCalled();
  });

  it("rejects malformed daily cutoff requests", async () => {
    await request(app)
      .get("/api/reports/daily-cutoff?date=2026/11/12")
      .set("Authorization", `Bearer ${createToken("GERENCIA")}`)
      .expect(400);

    expect(mocks.getDailyCutoff).not.toHaveBeenCalled();
  });

  it("returns zero for a daily cutoff with no appointments", async () => {
    mocks.getDailyCutoff.mockResolvedValue({
      date: "2026-11-12",
      completed: 0,
      cancelled: 0,
      total: 0,
    });

    const response = await request(app)
      .get("/api/reports/daily-cutoff?date=2026-11-12")
      .set("Authorization", `Bearer ${createToken("GERENCIA")}`)
      .expect(200);

    expect(response.body).toEqual({
      data: {
        date: "2026-11-12",
        completed: 0,
        cancelled: 0,
        total: 0,
      },
    });
  });

  it("rejects daily cutoff access for MEDICO", async () => {
    await request(app)
      .get("/api/reports/daily-cutoff?date=2026-11-12")
      .set("Authorization", `Bearer ${createToken("MEDICO")}`)
      .expect(403);

    expect(mocks.getDailyCutoff).not.toHaveBeenCalled();
  });

  it("handles daily cutoff service errors", async () => {
    mocks.getDailyCutoff.mockRejectedValue(new Error("DB error"));

    const response = await request(app)
      .get("/api/reports/daily-cutoff?date=2026-11-12")
      .set("Authorization", `Bearer ${createToken("GERENCIA")}`)
      .expect(500);

    expect(response.body).toEqual({
      message: "Error interno al consultar el corte diario",
    });
  });
});
