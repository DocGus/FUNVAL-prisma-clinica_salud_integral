import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { authorize } from "../src/middlewares/authorize.js";

function createApp(user?: Express.Request["user"]) {
  const app = express();
  const downstream = vi.fn();

  app.use((req, _res, next) => {
    if (user) {
      req.user = user;
    }
    next();
  });

  app.get("/protected", authorize("GERENCIA"), (req, res) => {
    downstream();
    return res.status(200).json({ id: req.user?.id, role: req.user?.role });
  });

  return { app, downstream };
}

describe("authorize middleware", () => {
  it("allows an authenticated user with an authorized role", async () => {
    const user = {
      id: "a13c3378-e2a3-4408-b19e-4c9a7fd661a8",
      role: "GERENCIA" as const,
    };
    const { app, downstream } = createApp(user);

    const response = await request(app).get("/protected").expect(200);

    expect(response.body).toEqual(user);
    expect(downstream).toHaveBeenCalledOnce();
  });

  it("returns 403 for an authenticated user with an unauthorized role", async () => {
    const { app, downstream } = createApp({
      id: "a13c3378-e2a3-4408-b19e-4c9a7fd661a8",
      role: "MEDICO",
    });

    const response = await request(app).get("/protected").expect(403);

    expect(response.body).toEqual({
      message: "No tienes permisos para realizar esta acción",
    });
    expect(downstream).not.toHaveBeenCalled();
  });

  it("returns 401 when no authenticated user is present", async () => {
    const { app, downstream } = createApp();

    const response = await request(app).get("/protected").expect(401);

    expect(response.body).toEqual({
      message: "Autenticación requerida",
    });
    expect(downstream).not.toHaveBeenCalled();
  });
});
