import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  jwtSecret: "test-secret-with-at-least-thirty-two-characters",
}));

vi.mock("../src/config/env.js", () => ({
  env: { JWT_SECRET: mocks.jwtSecret },
}));

import { verifyToken } from "../src/middlewares/verifyToken.js";

const validId = "a13c3378-e2a3-4408-b19e-4c9a7fd661a8";

function createApp() {
  const app = express();
  const downstream = vi.fn();

  app.get("/protected", verifyToken, (req, res) => {
    downstream();
    return res.status(200).json({ user: req.user });
  });

  return { app, downstream };
}

function createToken(payload: object, options?: jwt.SignOptions): string {
  return jwt.sign(payload, mocks.jwtSecret, options);
}

describe("verifyToken middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("accepts a valid token and sets the authenticated user", async () => {
    const token = createToken(
      { sub: validId, role: "MEDICO" },
      { expiresIn: "1h" },
    );
    const { app, downstream } = createApp();

    const response = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.user).toEqual({ id: validId, role: "MEDICO" });
    expect(downstream).toHaveBeenCalledOnce();
  });

  it("rejects a request without Authorization", async () => {
    const { app, downstream } = createApp();

    await request(app).get("/protected").expect(401);
    expect(downstream).not.toHaveBeenCalled();
  });

  it("rejects an incorrectly formatted Bearer header", async () => {
    const { app, downstream } = createApp();

    await request(app)
      .get("/protected")
      .set("Authorization", "Basic invalid-token")
      .expect(401);
    expect(downstream).not.toHaveBeenCalled();
  });

  it("rejects an invalid token", async () => {
    const { app, downstream } = createApp();

    await request(app)
      .get("/protected")
      .set("Authorization", "Bearer invalid-token")
      .expect(401);
    expect(downstream).not.toHaveBeenCalled();
  });

  it("rejects an expired token", async () => {
    const token = createToken(
      { sub: validId, role: "MEDICO" },
      { expiresIn: -1 },
    );
    const { app, downstream } = createApp();

    await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`)
      .expect(401);
    expect(downstream).not.toHaveBeenCalled();
  });

  it("rejects a token without a valid subject UUID", async () => {
    const token = createToken({ sub: "not-a-uuid", role: "MEDICO" });
    const { app, downstream } = createApp();

    await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`)
      .expect(401);
    expect(downstream).not.toHaveBeenCalled();
  });

  it("rejects a token with an unsupported role", async () => {
    const token = createToken({ sub: validId, role: "ADMIN" });
    const { app, downstream } = createApp();

    await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`)
      .expect(401);
    expect(downstream).not.toHaveBeenCalled();
  });

  it("rejects a string payload", async () => {
    const token = jwt.sign("not-an-object", mocks.jwtSecret);
    const { app, downstream } = createApp();

    await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`)
      .expect(401);
    expect(downstream).not.toHaveBeenCalled();
  });
});
