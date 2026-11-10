
import { prisma } from "../config/prisma.js";
import type { CreatePatientInput } from "../schemas/patientsSchema.js";

export const createPatient = (data: CreatePatientInput) => {
  return prisma.patient.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      birthDate: data.birthDate,
      phone: data.phone ?? null,
    },
  });
};

export const getAllPatients = () => {
  return prisma.patient.findMany({
    orderBy: [
      { lastName: "asc" },
      { firstName: "asc" },
    ],
  });
};

export const getPatientById = (id: string) => {
  return prisma.patient.findUnique({
    where: { id },
  });
};
