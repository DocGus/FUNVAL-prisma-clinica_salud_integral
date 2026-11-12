
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  jwtSecret: "test-secret-with-at-least-thirty-two-characters",
}));

vi.mock("../src/config/env.js", () => ({
  env: { JWT_SECRET: mocks.jwtSecret },
}));

// Evita inicializar Prisma durante las pruebas de la aplicación HTTP.
vi.mock("../src/services/patientsService.js", () => ({
  createPatient: vi.fn(),
  getAllPatients: vi.fn(),
  getPatientById: vi.fn(),
}));

vi.mock("../src/services/authService.js", () => ({
  login: vi.fn(),
}));

vi.mock("../src/services/doctorsService.js", () => ({
  getDoctors: vi.fn(),
}));

vi.mock("../src/services/specialtiesService.js", () => ({
  getSpecialties: vi.fn().mockResolvedValue([]),
}));

import { app } from "../src/app.js";

describe("HTTP application", () => {
  it("returns a healthy status", async () => {
    await request(app)
      .get("/health")
      .expect("Content-Type", /json/)
      .expect(200, { status: "ok" });
  });

  it("registers the public authentication endpoint", async () => {
    await request(app)
      .post("/api/auth")
      .send({ email: "invalid-email", password: "" })
      .expect(400);
  });

  it("registers the protected doctors directory endpoint", async () => {
    await request(app)
      .get("/api/doctors")
      .expect(401);
  });

  it("registers the public specialties catalog endpoint", async () => {
    await request(app)
      .get("/api/specialties")
      .expect(200, { data: [] });
  });

  it("serves the Swagger UI documentation", async () => {
    const response = await request(app)
      .get("/api/docs")
      .redirects(1)
      .expect(200);

    expect(response.headers["content-type"]).toMatch(/html/);
    expect(response.text).toContain("swagger-ui");
  });

  it("exposes Bearer authentication and protected API operations in Swagger UI", async () => {
    const response = await request(app)
      .get("/api/docs/swagger-ui-init.js")
      .expect(200);

    expect(response.text).toContain("bearerAuth");
    expect(response.text).toMatch(/"scheme":\s*"bearer"/);
    expect(response.text).toMatch(/"bearerFormat":\s*"JWT"/);
    expect(response.text).toMatch(
      /"security":\s*\[\s*\{\s*"bearerAuth":\s*\[\s*\]\s*\}\s*\]/,
    );
    expect(response.text).toContain("/api/auth");
    expect(response.text).toContain("/api/patients");
    expect(response.text).toContain("/api/doctors");
    expect(response.text).toContain("/api/specialties");
  });

  it("returns 404 for an unknown route", async () => {
    await request(app)
      .get("/route-that-does-not-exist")
      .expect(404);
  });

  it("returns 400 for malformed JSON", async () => {
    await request(app)
      .post("/health")
      .set("Content-Type", "application/json")
      .send('{"invalid":')
      .expect(400);
  });
});
