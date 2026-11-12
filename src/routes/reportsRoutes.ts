import { Router, type Router as ExpressRouter } from "express";
import {
  getAppointmentsBySpecialty,
  getDailyCutoff,
} from "../controllers/reportsController.js";
import { authorize } from "../middlewares/authorize.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router: ExpressRouter = Router();

router.get(
  "/appointments-by-specialty",
  verifyToken,
  authorize("GERENCIA"),
  getAppointmentsBySpecialty,
);

router.get(
  "/daily-cutoff",
  verifyToken,
  authorize("GERENCIA"),
  getDailyCutoff,
);

export default router;
