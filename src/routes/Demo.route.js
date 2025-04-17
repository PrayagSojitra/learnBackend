import { Router } from "express";
import { registerDemo } from "../controllers/demo.controller.js";

const router = Router();

router.route("/registerDemo").post(registerDemo);

export default router;