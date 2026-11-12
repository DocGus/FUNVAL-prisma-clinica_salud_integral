import { prisma } from "../config/prisma.js";
import { createSpecialtiesModel } from "../models/specialtiesModel.js";

const specialtiesModel = createSpecialtiesModel(prisma);

export const getSpecialties = () => {
  return specialtiesModel.getSpecialties();
};
