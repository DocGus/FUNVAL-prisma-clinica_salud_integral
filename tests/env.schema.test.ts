import { describe, expect, it } from "vitest";
import { environmentSchema } from "../src/config/env.schema.js";

describe("environment schema", () => {
  it("accepts a valid URL and applies default values", () => {
    const result = environmentSchema.safeParse({
      JWT_SECRET: "a-secure-test-secret-with-at-least-32-chars",
      DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        JWT_SECRET: "a-secure-test-secret-with-at-least-32-chars",
        DATABASE_URL: "postgresql://test:test@localhost:5432/test",
        NODE_ENV: "development",
        PORT: 3000,
      });
    }
  });

  it.each([
    [
      "missing DATABASE_URL",
      {
        JWT_SECRET: "a-secure-test-secret-with-at-least-32-chars",
        PORT: "3000",
      },
    ],
    [
      "malformed DATABASE_URL",
      {
        DATABASE_URL: "not-a-url",
        JWT_SECRET: "a-secure-test-secret-with-at-least-32-chars",
      },
    ],
    [
      "missing JWT_SECRET",
      { DATABASE_URL: "postgresql://localhost:5432/test" },
    ],
    [
      "short JWT_SECRET",
      {
        DATABASE_URL: "postgresql://localhost:5432/test",
        JWT_SECRET: "too-short",
      },
    ],
    [
      "unsupported NODE_ENV",
      {
        DATABASE_URL: "postgresql://test:test@localhost:5432/test",
        JWT_SECRET: "a-secure-test-secret-with-at-least-32-chars",
        NODE_ENV: "staging",
      },
    ],
    [
      "non-positive PORT",
      {
        DATABASE_URL: "postgresql://test:test@localhost:5432/test",
        JWT_SECRET: "a-secure-test-secret-with-at-least-32-chars",
        PORT: "0",
      },
    ],
  ])("rejects %s", (_description, input) => {
    expect(environmentSchema.safeParse(input).success).toBe(false);
  });
});
