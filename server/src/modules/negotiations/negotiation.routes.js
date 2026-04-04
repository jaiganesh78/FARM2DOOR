import express from "express";
import * as controller from "./negotiation.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/offer", authenticate, controller.createOffer);
router.get("/:id", authenticate, controller.getNegotiation);
router.post("/:id/respond", authenticate, controller.respond);

export default router;