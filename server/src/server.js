import dotenv from "dotenv";
dotenv.config();
import http from "http";
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";
import { errorHandler } from "./middleware/error.middleware.js";
import negotiationRoutes from "./modules/negotiations/negotiation.routes.js";
import { authenticate } from "./middleware/auth.middleware.js";
import { authorize } from "./middleware/role.middleware.js";
import paymentRoutes from "./modules/payments/payment.routes.js";
import deliveryRoutes from "./modules/delivery/delivery.routes.js";
import jwt from "jsonwebtoken";
import prisma from "./config/prisma.js";
import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
// import passport from "./config/passport.js";
import listingRoutes from "./modules/listings/listing.routes.js";
const app = express();

const server = http.createServer(app);
app.use(express.json());
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // max 100 requests per IP
  message: {
    success: false,
    message: "Too many requests, try again later",
  },
});

app.use(globalLimiter);
app.set("io", io);
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.user = decoded;

    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
});
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("joinDeliveryRoom", async (deliveryId) => {
  try {
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { order: true },
    });

    if (!delivery) {
      throw new Error("Delivery not found");
    }

    const userId = socket.user.id;

    // Only buyer, farmer, or delivery partner can join
    if (
      userId !== delivery.order.buyerId &&
      userId !== delivery.order.farmerId &&
      userId !== delivery.deliveryPartnerId
    ) {
      throw new Error("Unauthorized room access");
    }

    socket.join(deliveryId);
  } catch (err) {
    socket.emit("error", err.message);
  }
});

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.use(cors());
app.use(express.json());
app.use("/api/listings", listingRoutes);
app.use("/api/negotiations", negotiationRoutes);
app.use("/api/payments", paymentRoutes);
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 5, // only 5 attempts
  message: {
    success: false,
    message: "Too many OTP attempts",
  },
});

app.use("/api/delivery", otpLimiter, deliveryRoutes);
app.get(
  "/api/test/farmer",
  authenticate,
  authorize("FARMER"),
  (req, res) => {
    res.json({
      message: "Farmer access granted",
      user: req.user,
    });
  }
);
app.use("/api/auth", authRoutes);
// app.use(passport.initialize());

app.get("/", (req, res) => {
  res.send("Farm2Door API running");
});

app.use(errorHandler);


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});