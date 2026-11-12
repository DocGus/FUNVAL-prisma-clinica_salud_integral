import { Router, type Router as ExpressRouter } from "express";
import {
  createAppointment,
  updateAppointmentStatus,
} from "../controllers/appointmentsController.js";
import { authorize } from "../middlewares/authorize.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router: ExpressRouter = Router();

router.post(
  "/",
  verifyToken,
  authorize("RECEPCIONISTA"),
  createAppointment,
);

router.patch(
  "/:id/status",
  verifyToken,
  authorize("MEDICO"),
  updateAppointmentStatus,
);

export default router;
