
import { prisma } from "../config/prisma.js";
import * as patientsModel from "../models/patientsModel.js";
import type { CreatePatientInput } from "../schemas/patientsSchema.js";

const patientModel = patientsModel.createPatientsModel(prisma);

export const createPatient = (data: CreatePatientInput) => {
  return patientModel.createPatient({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    birthDate: data.birthDate,
    phone: data.phone ?? null,
  });
};

export const getAllPatients = () => {
  return patientModel.getAllPatients();
};

export const getPatientById = (id: string) => {
  return patientModel.getPatientById(id);
};
