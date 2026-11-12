import { createReportsModel } from "../models/reportsModel.js";

const reportsModel = createReportsModel();

export const getAppointmentsBySpecialty = () => {
  return reportsModel.getAppointmentsBySpecialty();
};

export const getDailyCutoff = (date: string) => {
  return reportsModel.getDailyCutoff(date);
};
