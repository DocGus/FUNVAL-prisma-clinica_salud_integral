import { Router, type Router as ExpressRouter } from "express";
import { getDoctorAppointments } from "../controllers/appointmentsController.js";
import { getDoctors } from "../controllers/doctorsController.js";
import { authorize } from "../middlewares/authorize.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router: ExpressRouter = Router();

router.get(
  "/",
  verifyToken,
  authorize("RECEPCIONISTA"),
  getDoctors,
);

router.get(
  "/:id/appointments",
  verifyToken,
  authorize("MEDICO"),
  getDoctorAppointments,
);

export default router;
