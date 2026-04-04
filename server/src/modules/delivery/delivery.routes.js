import express from "express";
import * as controller from "./delivery.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/assign/:orderId", authenticate, controller.assign);
router.patch("/:id/status", authenticate, controller.updateStatus);
router.post("/:id/verify", authenticate, controller.verify);
router.post("/:id/location", authenticate, controller.updateLocation);

export default router;