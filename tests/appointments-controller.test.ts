import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  jwtSecret: "test-secret-with-at-least-thirty-two-characters",
  createAppointment: vi.fn(),
  resolveAuthenticatedDoctorId: vi.fn(),
  getDoctorAppointments: vi.fn(),
  updateAppointmentStatus: vi.fn(),
}));

vi.mock("../src/config/env.js", () => ({
  env: { JWT_SECRET: mocks.jwtSecret },
}));

vi.mock("../src/services/appointmentsService.js", () => ({
  createAppointment: mocks.createAppointment,
  resolveAuthenticatedDoctorId: mocks.resolveAuthenticatedDoctorId,
  getDoctorAppointments: mocks.getDoctorAppointments,
  updateAppointmentStatus: mocks.updateAppointmentStatus,
}));

import appointmentsRoutes from "../src/routes/appointmentsRoutes.js";
import doctorsRoutes from "../src/routes/doctorsRoutes.js";

const app = express();
app.use(express.json());
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/doctors", doctorsRoutes);

const createToken = (role: "RECEPCIONISTA" | "MEDICO" | "GERENCIA") =>
  jwt.sign(
    {
      sub: "11111111-1111-4111-8111-111111111111",
      role,
    },
    mocks.jwtSecret,
    { expiresIn: "8h" },
  );

describe("appointments controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.resolveAuthenticatedDoctorId.mockResolvedValue(
      "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    );
  });

  it("creates an appointment for a receptionist with valid data", async () => {
    const appointment = {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      patientId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      doctorId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      scheduledAt: "2030-05-20T10:00:00.000Z",
      reason: "Consulta general",
      status: "PROGRAMADA",
      patient: {
        id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        firstName: "Ana",
        lastName: "López",
        email: "ana@example.com",
      },
    };

    mocks.createAppointment.mockResolvedValue(appointment);

    const response = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${createToken("RECEPCIONISTA")}`)
      .send({
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        scheduledAt: appointment.scheduledAt,
        reason: appointment.reason,
      })
      .expect(201);

    expect(response.body).toEqual({
      message: "Cita registrada correctamente",
      data: appointment,
    });
    expect(mocks.createAppointment).toHaveBeenCalledWith({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      scheduledAt: new Date(appointment.scheduledAt),
      reason: appointment.reason,
    });
  });

  it("rejects appointment creation without a token", async () => {
    await request(app)
      .post("/api/appointments")
      .send({
        patientId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        doctorId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
        scheduledAt: "2030-05-20T10:00:00.000Z",
      })
      .expect(401);
  });

  it("rejects appointment creation for a non-receptionist role", async () => {
    await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${createToken("MEDICO")}`)
      .send({
        patientId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        doctorId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
        scheduledAt: "2030-05-20T10:00:00.000Z",
      })
      .expect(403);
  });

  it("returns 400 for invalid appointment payload", async () => {
    await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${createToken("RECEPCIONISTA")}`)
      .send({
        patientId: "invalid",
        doctorId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
        scheduledAt: "2020-01-01T00:00:00.000Z",
      })
      .expect(400);
  });

  it("returns 404 when the patient does not exist", async () => {
    mocks.createAppointment.mockRejectedValue(new Error("Paciente no encontrado"));

    const response = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${createToken("RECEPCIONISTA")}`)
      .send({
        patientId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        doctorId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
        scheduledAt: "2030-05-20T10:00:00.000Z",
      })
      .expect(404);

    expect(response.body).toEqual({ message: "Paciente no encontrado" });
  });

  it("returns 404 when the doctor does not exist", async () => {
    mocks.createAppointment.mockRejectedValue(new Error("Médico no encontrado"));

    const response = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${createToken("RECEPCIONISTA")}`)
      .send({
        patientId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        doctorId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
        scheduledAt: "2030-05-20T10:00:00.000Z",
      })
      .expect(404);

    expect(response.body).toEqual({ message: "Médico no encontrado" });
  });

  it("returns doctor agenda with patient data and range filters", async () => {
    const appointments = [
      {
        id: "11111111-1111-4111-8111-111111111111",
        patientId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        doctorId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
        scheduledAt: "2030-05-20T09:00:00.000Z",
        status: "PROGRAMADA",
        patient: {
          id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          firstName: "Ana",
          lastName: "López",
          email: "ana@example.com",
        },
      },
    ];

    mocks.getDoctorAppointments.mockResolvedValue(appointments);

    const response = await request(app)
      .get(
        "/api/doctors/cccccccc-cccc-4ccc-8ccc-cccccccccccc/appointments?from=2030-05-20T00:00:00.000Z&to=2030-05-22T00:00:00.000Z",
      )
      .set("Authorization", `Bearer ${createToken("MEDICO")}`)
      .expect(200);

    expect(response.body).toEqual({ data: appointments });
    expect(mocks.resolveAuthenticatedDoctorId).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
    );
    expect(mocks.getDoctorAppointments).toHaveBeenCalledWith(
      "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      new Date("2030-05-20T00:00:00.000Z"),
      new Date("2030-05-22T00:00:00.000Z"),
    );
  });

  it("returns the full agenda when only one date boundary is provided", async () => {
    const appointments = [
      {
        id: "11111111-1111-4111-8111-111111111111",
        patientId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        doctorId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
        scheduledAt: "2030-05-20T09:00:00.000Z",
        status: "PROGRAMADA",
        patient: {
          id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          firstName: "Ana",
          lastName: "López",
          email: "ana@example.com",
        },
      },
    ];

    mocks.getDoctorAppointments.mockResolvedValue(appointments);

    await request(app)
      .get(
        "/api/doctors/cccccccc-cccc-4ccc-8ccc-cccccccccccc/appointments?from=2030-05-20T00:00:00.000Z",
      )
      .set("Authorization", `Bearer ${createToken("MEDICO")}`)
      .expect(200);

    expect(mocks.getDoctorAppointments).toHaveBeenCalledWith(
      "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      undefined,
      undefined,
    );
  });

  it("rejects agenda queries for another doctor", async () => {
    mocks.resolveAuthenticatedDoctorId.mockResolvedValue(
      "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
    );

    const response = await request(app)
      .get(
        "/api/doctors/cccccccc-cccc-4ccc-8ccc-cccccccccccc/appointments",
      )
      .set("Authorization", `Bearer ${createToken("MEDICO")}`)
      .expect(403);

    expect(response.body).toEqual({
      message: "No tienes permisos para consultar la agenda de este médico",
    });
  });

  it("rejects agenda queries without a token", async () => {
    await request(app)
      .get("/api/doctors/cccccccc-cccc-4ccc-8ccc-cccccccccccc/appointments")
      .expect(401);
  });

  it("rejects agenda queries for non-medical roles", async () => {
    await request(app)
      .get("/api/doctors/cccccccc-cccc-4ccc-8ccc-cccccccccccc/appointments")
      .set("Authorization", `Bearer ${createToken("RECEPCIONISTA")}`)
      .expect(403);
  });

  it("accepts status updates to COMPLETADA", async () => {
    const appointment = {
      id: "11111111-1111-4111-8111-111111111111",
      patientId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      doctorId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      scheduledAt: "2030-05-20T09:00:00.000Z",
      status: "COMPLETADA",
      patient: {
        id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        firstName: "Ana",
        lastName: "López",
        email: "ana@example.com",
      },
    };

    mocks.updateAppointmentStatus.mockResolvedValue(appointment);

    const response = await request(app)
      .patch(`/api/appointments/${appointment.id}/status`)
      .set("Authorization", `Bearer ${createToken("MEDICO")}`)
      .send({ status: "COMPLETADA" })
      .expect(200);

    expect(response.body).toEqual({
      message: "Estado de la cita actualizado correctamente",
      data: appointment,
    });
    expect(mocks.updateAppointmentStatus).toHaveBeenCalledWith(
      appointment.id,
      "COMPLETADA",
      "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    );
  });

  it("rejects status updates for another doctor's appointment", async () => {
    mocks.resolveAuthenticatedDoctorId.mockResolvedValue(
      "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
    );
    mocks.updateAppointmentStatus.mockRejectedValue(
      new Error("No tienes permisos para modificar esta cita"),
    );

    const response = await request(app)
      .patch("/api/appointments/11111111-1111-4111-8111-111111111111/status")
      .set("Authorization", `Bearer ${createToken("MEDICO")}`)
      .send({ status: "COMPLETADA" })
      .expect(403);

    expect(response.body).toEqual({
      message: "No tienes permisos para modificar esta cita",
    });
  });

  it("accepts status updates to CANCELADA", async () => {
    mocks.updateAppointmentStatus.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      patientId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      doctorId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      scheduledAt: "2030-05-20T09:00:00.000Z",
      status: "CANCELADA",
      patient: {
        id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        firstName: "Ana",
        lastName: "López",
        email: "ana@example.com",
      },
    });

    await request(app)
      .patch("/api/appointments/11111111-1111-4111-8111-111111111111/status")
      .set("Authorization", `Bearer ${createToken("MEDICO")}`)
      .send({ status: "CANCELADA" })
      .expect(200);
  });

  it("rejects invalid status updates", async () => {
    await request(app)
      .patch("/api/appointments/11111111-1111-4111-8111-111111111111/status")
      .set("Authorization", `Bearer ${createToken("MEDICO")}`)
      .send({ status: "PROGRAMADA" })
      .expect(400);
  });

  it("returns 404 when the appointment does not exist", async () => {
    mocks.updateAppointmentStatus.mockRejectedValue(
      new Error("Cita no encontrada"),
    );

    const response = await request(app)
      .patch("/api/appointments/11111111-1111-4111-8111-111111111111/status")
      .set("Authorization", `Bearer ${createToken("MEDICO")}`)
      .send({ status: "COMPLETADA" })
      .expect(404);

    expect(response.body).toEqual({ message: "Cita no encontrada" });
  });

  it("rejects status updates for a doctor without an associated doctor record", async () => {
    mocks.resolveAuthenticatedDoctorId.mockRejectedValue(
      new Error("El usuario médico no está asociado a un doctor"),
    );

    const response = await request(app)
      .patch("/api/appointments/11111111-1111-4111-8111-111111111111/status")
      .set("Authorization", `Bearer ${createToken("MEDICO")}`)
      .send({ status: "COMPLETADA" })
      .expect(403);

    expect(response.body).toEqual({
      message: "No tienes permisos para modificar esta cita",
    });
  });

  it("rejects status updates without a token", async () => {
    await request(app)
      .patch("/api/appointments/11111111-1111-4111-8111-111111111111/status")
      .send({ status: "COMPLETADA" })
      .expect(401);
  });

  it("rejects status updates for non-medical roles", async () => {
    await request(app)
      .patch("/api/appointments/11111111-1111-4111-8111-111111111111/status")
      .set("Authorization", `Bearer ${createToken("RECEPCIONISTA")}`)
      .send({ status: "COMPLETADA" })
      .expect(403);
  });
});
