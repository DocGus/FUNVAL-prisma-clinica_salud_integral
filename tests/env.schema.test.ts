import { describe, expect, it } from "vitest";
import { environmentSchema } from "../src/config/env.schema.js";

describe("environment schema", () => {
  it("accepts a valid URL and applies default values", () => {
    const result = environmentSchema.safeParse({
      DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        DATABASE_URL: "postgresql://test:test@localhost:5432/test",
        NODE_ENV: "development",
        PORT: 3000,
      });
    }
  });

  it.each([
    ["missing DATABASE_URL", { PORT: "3000" }],
    ["malformed DATABASE_URL", { DATABASE_URL: "not-a-url" }],
    [
      "unsupported NODE_ENV",
      {
        DATABASE_URL: "postgresql://test:test@localhost:5432/test",
        NODE_ENV: "staging",
      },
    ],
    [
      "non-positive PORT",
      {
        DATABASE_URL: "postgresql://test:test@localhost:5432/test",
        PORT: "0",
      },
    ],
  ])("rejects %s", (_description, input) => {
    expect(environmentSchema.safeParse(input).success).toBe(false);
  });
});
