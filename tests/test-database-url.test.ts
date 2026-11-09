import { describe, expect, it } from "vitest";
import {
  requireTestDatabaseUrl,
  sanitizeTestDatabaseError,
} from "./support/test-database-url.js";

describe("integration test database URL guard", () => {
  it("accepts a PostgreSQL URL whose database name ends with _test", () => {
    const url = "postgresql://test:test@localhost:5432/funval_test?schema=public";

    expect(requireTestDatabaseUrl(url)).toBe(url);
  });

  it.each([undefined, ""])("rejects a missing or empty URL (%s)", (url) => {
    expect(() => requireTestDatabaseUrl(url)).toThrow(
      "TEST_DATABASE_URL is required for integration tests.",
    );
  });

  it.each([
    "not-a-url",
    "postgresql://test:test@localhost:5432/funval%ZZ_test",
  ])("rejects malformed URLs", (url) => {
    expect(() => requireTestDatabaseUrl(url)).toThrow(
      "TEST_DATABASE_URL must be a valid PostgreSQL connection URL.",
    );
  });

  it.each([
    "postgresql://test:test@localhost",
    "postgresql://test:test@localhost/",
  ])("rejects URLs without a database name", (url) => {
    expect(() => requireTestDatabaseUrl(url)).toThrow(
      "TEST_DATABASE_URL must include a database name.",
    );
  });

  it("rejects database names that do not end with _test", () => {
    expect(() =>
      requireTestDatabaseUrl("postgresql://test:test@localhost:5432/funval_test_extra"),
    ).toThrow("must target a database whose name ends with _test");
  });

  it("rejects non-PostgreSQL protocols", () => {
    expect(() => requireTestDatabaseUrl("https://localhost/funval_test")).toThrow(
      "must use the PostgreSQL protocol",
    );
  });

  it("preserves percent-encoded credentials unchanged", () => {
    const url =
      "postgresql://user%40domain:p%3Ass%2Fword@localhost:5432/funval_test?schema=public";

    expect(requireTestDatabaseUrl(url)).toBe(url);
  });

  it("redacts connection details while preserving useful technical errors", () => {
    const url =
      "postgresql://user%40domain:p%3Ass%2Fword@localhost:5432/funval_test?schema=public";
    const error = Object.assign(
      new Error(`password authentication failed for user "user@domain" at ${url}`),
      { code: "28P01" },
    );

    const safeError = sanitizeTestDatabaseError(error, url);

    expect(safeError.message).toContain("password authentication failed");
    expect(safeError.message).not.toContain(url);
    expect(safeError.message).not.toContain("user@domain");
    expect(safeError.message).not.toContain("user%40domain");
    expect(safeError.message).not.toContain("p:ss/word");
    expect(safeError.message).not.toContain("p%3Ass%2Fword");
    expect(safeError.name).toBe("Error");
    expect(safeError).toHaveProperty("code", "28P01");
  });
});
