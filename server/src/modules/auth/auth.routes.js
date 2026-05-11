import express from "express";
//import passport from "passport";
import { register, login } from "./auth.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { loginSchema, registerSchema } from "./auth.validation.js";
import { authRateLimiter } from "../../middleware/authRateLimit.middleware.js";

const router = express.Router();

router.post("/register", authRateLimiter, validate(registerSchema), register);
router.post("/login", authRateLimiter, validate(loginSchema), login);
/*router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    res.json({
      message: "Google login successful",
      user: req.user,
    });
  }
);*/
export default router;