import { Router, type Router as ExpressRouter } from "express";
import { login } from "../controllers/authController.js";

const router: ExpressRouter = Router();

router.post("/", login);

export default router;
