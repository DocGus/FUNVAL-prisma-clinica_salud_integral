
import { Router, type Router as ExpressRouter } from "express";
import {
  createPatient,
  getAllPatients,
  getPatientById,
} from "../controllers/patientsController.js";
import { authorize } from "../middlewares/authorize.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router: ExpressRouter = Router();

router.get("/", verifyToken, authorize("RECEPCIONISTA"), getAllPatients);
router.post("/", verifyToken, authorize("RECEPCIONISTA"), createPatient);
router.get(
  "/:id",
  verifyToken,
  authorize("RECEPCIONISTA"),
  getPatientById,
);

export default router;
