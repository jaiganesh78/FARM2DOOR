import { registerUser, loginUser } from "./auth.service.js";
import { generateToken } from "../../utils/jwt.js";

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);

    const token = generateToken(user);

    res.json({
      message: "User registered",
      token,
      user,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await loginUser(email, password);

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};