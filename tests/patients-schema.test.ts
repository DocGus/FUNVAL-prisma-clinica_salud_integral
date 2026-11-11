
import { describe, expect, it } from "vitest";
import { createPatientSchema } from "../src/schemas/patientsSchema.js";

describe("createPatientSchema", () => {
  const validPatient = {
    firstName: "Juan",
    lastName: "Perez",
    email: "juan.perez@example.com",
    birthDate: "1990-05-15",
    phone: "5512345678",
  };

  it("accepts valid patient data", () => {
    const result = createPatientSchema.safeParse(validPatient);

    expect(result.success).toBe(true);
  });

  it("rejects an empty first name", () => {
    const result = createPatientSchema.safeParse({
      ...validPatient,
      firstName: " ",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = createPatientSchema.safeParse({
      ...validPatient,
      email: "correo-invalido",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a future birth date", () => {
    const result = createPatientSchema.safeParse({
      ...validPatient,
      birthDate: "2099-01-01",
    });

    expect(result.success).toBe(false);
  });

  it("rejects additional properties", () => {
    const result = createPatientSchema.safeParse({
      ...validPatient,
      unexpectedField: "not allowed",
    });

    expect(result.success).toBe(false);
  });

  it("normalizes email and trims text fields", () => {
    const result = createPatientSchema.safeParse({
      ...validPatient,
      firstName: "  Juan  ",
      lastName: " Perez ",
      email: " JUAN.PEREZ@EXAMPLE.COM ",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.firstName).toBe("Juan");
      expect(result.data.lastName).toBe("Perez");
      expect(result.data.email).toBe("juan.perez@example.com");
    }
  });
});
