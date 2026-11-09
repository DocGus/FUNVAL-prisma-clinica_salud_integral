import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("integration Prisma client configuration", () => {
  it.each([undefined, "not-a-database-url"])(
    "uses TEST_DATABASE_URL when DATABASE_URL is %s",
    async (databaseUrl) => {
      vi.stubEnv("DATABASE_URL", databaseUrl);
      vi.stubEnv(
        "TEST_DATABASE_URL",
        "postgresql://funval_test_user:fake@localhost:5432/funval_template_test?schema=public",
      );

      const { createIntegrationPrismaClient } = await import(
        "./support/prisma-client.js"
      );
      const client = createIntegrationPrismaClient();

      await expect(client.$disconnect()).resolves.toBeUndefined();
    },
  );

  it("does not fall back to DATABASE_URL when TEST_DATABASE_URL is missing", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://fake@localhost:5432/funval_dev");
    vi.stubEnv("TEST_DATABASE_URL", undefined);

    const { createIntegrationPrismaClient } = await import(
      "./support/prisma-client.js"
    );

    expect(() => createIntegrationPrismaClient()).toThrow(
      "TEST_DATABASE_URL is required for integration tests.",
    );
  });
});
