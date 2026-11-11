import { prisma } from "../config/prisma.js";
import { createDoctorsModel } from "../models/doctorsModel.js";

const doctorsModel = createDoctorsModel(prisma);

export const getDoctors = (specialtyId?: string) => {
  return doctorsModel.getDoctors(specialtyId);
};
