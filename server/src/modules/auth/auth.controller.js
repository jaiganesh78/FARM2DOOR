import { registerUser, loginUser } from "./auth.service.js";
import { generateToken } from "../../utils/jwt.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.body);

  const token = generateToken(user);

  res.json({
    message: "User registered",
    token,
    user,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await loginUser(email, password);

  const token = generateToken(user);

  res.json({
    message: "Login successful",
    token,
    user,
  });
});