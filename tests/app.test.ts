import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";

describe("HTTP application", () => {
  it("returns a healthy status", async () => {
    await request(app)
      .get("/health")
      .expect("Content-Type", /json/)
      .expect(200, { status: "ok" });
  });

  it("serves the Swagger UI documentation", async () => {
    const response = await request(app).get("/api/docs").redirects(1).expect(200);

    expect(response.headers["content-type"]).toMatch(/html/);
    expect(response.text).toContain("swagger-ui");
  });

  it("returns 404 for an unknown route", async () => {
    await request(app).get("/route-that-does-not-exist").expect(404);
  });

  it("returns 400 for malformed JSON", async () => {
    await request(app)
      .post("/health")
      .set("Content-Type", "application/json")
      .send('{"invalid":')
      .expect(400);
  });
});
