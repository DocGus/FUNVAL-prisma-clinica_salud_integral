import { randomUUID } from "node:crypto";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
} from "vitest";
import { createPatientsModel } from "../../src/models/patientsModel.js";
import { createIntegrationPrismaClient } from "../support/prisma-client.js";

type IntegrationPrismaClient = ReturnType<typeof createIntegrationPrismaClient>;
type PatientsModel = ReturnType<typeof createPatientsModel>;

let prisma: IntegrationPrismaClient | undefined;
let patientsModel: PatientsModel | undefined;
const testEmails = new Set<string>();

function getPatientsModel(): PatientsModel {
  if (!patientsModel) {
    throw new Error("Patients model is not initialized for integration tests.");
  }

  return patientsModel;
}

function getPrismaClient(): IntegrationPrismaClient {
  if (!prisma) {
    throw new Error("Integration Prisma Client is not initialized.");
  }

  return prisma;
}

function createTestEmail(): string {
  const email = `patient-integration-${randomUUID()}@example.test`;
  testEmails.add(email);
  return email;
}

function createTestPatient(firstName: string, lastName: string) {
  return getPatientsModel().createPatient({
    firstName,
    lastName,
    email: createTestEmail(),
    birthDate: new Date("1990-05-15T00:00:00.000Z"),
    phone: null,
  });
}

describe("patients model PostgreSQL integration", () => {
  beforeAll(() => {
    prisma = createIntegrationPrismaClient();
    patientsModel = createPatientsModel(prisma);
  });

  afterEach(async () => {
    const emails = [...testEmails];

    try {
      if (emails.length > 0) {
        await getPrismaClient().patient.deleteMany({
          where: { email: { in: emails } },
        });
      }
    } finally {
      testEmails.clear();
    }
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });

  it("creates a patient in PostgreSQL", async () => {
    const email = createTestEmail();
    const patient = await getPatientsModel().createPatient({
      firstName: "Integration",
      lastName: "Create",
      email,
      birthDate: new Date("1990-05-15T00:00:00.000Z"),
      phone: null,
    });

    expect(patient.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(patient.email).toBe(email);
    expect(patient.birthDate.toISOString()).toBe("1990-05-15T00:00:00.000Z");
  });

  it("lists patients ordered by last name and first name", async () => {
    const createdPatients = [
      await createTestPatient("Zoe", "Zulu"),
      await createTestPatient("Bea", "Alvarez"),
      await createTestPatient("Ana", "Alvarez"),
    ];

    const listedPatients = await getPatientsModel().getAllPatients();
    const listedTestPatients = listedPatients.filter((patient) =>
      testEmails.has(patient.email),
    );
    const expectedIds = [...createdPatients]
      .sort((left, right) =>
        left.lastName.localeCompare(right.lastName) ||
        left.firstName.localeCompare(right.firstName),
      )
      .map((patient) => patient.id);

    expect(listedTestPatients.map((patient) => patient.id)).toEqual(expectedIds);
  });

  it("finds a patient by UUID", async () => {
    const createdPatient = await createTestPatient("Search", "Patient");

    await expect(
      getPatientsModel().getPatientById(createdPatient.id),
    ).resolves.toMatchObject({
      id: createdPatient.id,
      email: createdPatient.email,
    });
  });

  it("returns null when the UUID does not exist", async () => {
    await expect(
      getPatientsModel().getPatientById(randomUUID()),
    ).resolves.toBeNull();
  });
});
