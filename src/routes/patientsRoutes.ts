
import { Router, type Router as ExpressRouter } from "express";
import {
  createPatient,
  getAllPatients,
  getPatientById,
} from "../controllers/patientsController.js";

const router: ExpressRouter = Router();

router.post("/", createPatient);
router.get("/", getAllPatients);
router.get("/:id", getPatientById);

export default router;
