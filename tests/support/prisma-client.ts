import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";
import { requireTestDatabaseUrl, sanitizeTestDatabaseError } from "./test-database-url.js";

export function createIntegrationPrismaClient(): PrismaClient {
  const connectionString = requireTestDatabaseUrl(process.env.TEST_DATABASE_URL);

  try {
    const adapter = new PrismaPg({ connectionString });
    return new PrismaClient({ adapter });
  } catch (error) {
    throw sanitizeTestDatabaseError(error, connectionString);
  }
}
