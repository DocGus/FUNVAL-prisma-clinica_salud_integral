import { Router, type Router as ExpressRouter } from "express";
import { getSpecialties } from "../controllers/specialtiesController.js";

const router: ExpressRouter = Router();

router.get("/", getSpecialties);

export default router;
