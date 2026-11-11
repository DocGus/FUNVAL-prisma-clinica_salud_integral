import { Router, type Router as ExpressRouter } from "express";
import { getDoctors } from "../controllers/doctorsController.js";
import { authorize } from "../middlewares/authorize.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router: ExpressRouter = Router();

router.get(
  "/",
  verifyToken,
  authorize("RECEPCIONISTA", "GERENCIA"),
  getDoctors,
);

export default router;
