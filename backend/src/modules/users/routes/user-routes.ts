import { Router } from "express";
import { authenticate } from "../../../middleware/auth.js";
import { me } from "../../auth/controllers/auth-controller.js";

const router = Router();

router.get("/me", authenticate, me);

export default router;
