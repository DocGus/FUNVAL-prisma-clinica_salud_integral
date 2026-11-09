import { describe, expect, it } from "vitest";
import { createIntegrationPrismaClient } from "../support/prisma-client.js";
import { sanitizeTestDatabaseError } from "../support/test-database-url.js";

describe("PostgreSQL integration connection", () => {
  it("connects with TEST_DATABASE_URL and returns SELECT 1", async () => {
    const connectionUrl = process.env.TEST_DATABASE_URL;
    let prisma: ReturnType<typeof createIntegrationPrismaClient> | undefined;

    try {
      prisma = createIntegrationPrismaClient();
      const result = await prisma.$queryRaw<{ result: number }[]>`SELECT 1 AS result`;

      expect(result).toEqual([{ result: 1 }]);
    } catch (error) {
      if (!connectionUrl) {
        throw error;
      }

      throw sanitizeTestDatabaseError(error, connectionUrl);
    } finally {
      if (prisma) {
        await prisma.$disconnect();
      }
    }
  });
});
