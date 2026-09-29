import { Router } from "express";
import { generateEmail } from "../controllers/email.controller.js";

const router = Router();

router.post("/generate-email", generateEmail);

export default router;