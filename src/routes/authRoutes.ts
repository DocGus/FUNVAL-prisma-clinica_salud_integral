import { Router, type Router as ExpressRouter } from "express";
import { login, register } from "../controllers/authController.js";
import { authorize } from "../middlewares/authorize.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router: ExpressRouter = Router();

router.post("/", login);
router.post("/register", verifyToken, authorize("GERENCIA"), register);

export default router;
