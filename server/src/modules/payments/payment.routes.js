import express from "express";
import * as controller from "./payment.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/:orderId/pay", authenticate, controller.pay);
router.post("/:orderId/confirm", authenticate, controller.confirm);
router.post("/:orderId/refund", authenticate, controller.refund);

export default router;