import prisma from "../../config/prisma.js";
import logger from "../../utils/logger.js";
import bcrypt from "bcrypt";
// Assign delivery partner
export const assignDelivery = async (user, orderId, deliveryPartnerId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });
  const existingDelivery = await prisma.delivery.findUnique({
  where: { orderId },
});

if (existingDelivery) {
  throw new Error("Delivery already assigned");
}

  if (!order) throw new Error("Order not found");

  // 🔥 ADD THIS CHECK
  if (user.role !== "ADMIN" && user.id !== order.farmerId) {
    throw new Error("Unauthorized to assign delivery");
  }
  if (order.paymentStatus !== "SUCCESS") {
  throw new Error("Order not paid yet");
}

  const delivery = await prisma.delivery.create({
    data: {
      orderId,
      deliveryPartnerId,
      pickupLat: 0,
      pickupLng: 0,
      dropLat: 0,
      dropLng: 0,
      status: "ASSIGNED",
    },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "ASSIGNED" },
  });

  return delivery;
};

// Update delivery status
export const updateStatus = async (user, deliveryId, status, proofImageUrl) => {
  const delivery = await prisma.delivery.findUnique({
    where: { id: deliveryId },
  });

  if (!delivery) throw new Error("Delivery not found");

  if (user.id !== delivery.deliveryPartnerId) {
    throw new Error("Unauthorized");
  }

  // Generate OTP when marking delivered
  let otp = null;
let otpHash = null;
let otpExpiry = null;

if (status === "DELIVERED" && delivery.status !== "DELIVERED") {
  otp = Math.floor(1000 + Math.random() * 9000).toString();

  otpHash = await bcrypt.hash(otp, 10);
  otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

logger.info(`OTP for order ${delivery.orderId}: ${otp}`);
}
  const validTransitions = {
    ASSIGNED: ["PICKED_UP"],
    PICKED_UP: ["IN_TRANSIT"],
    IN_TRANSIT: ["DELIVERED"],
  };
  
  if (
    validTransitions[delivery.status] &&
    !validTransitions[delivery.status].includes(status)
  ) {
    throw new Error("Invalid status transition");
  }

  const updated = await prisma.delivery.update({
    where: { id: deliveryId },
    data: {
  status,
  otp: otpHash,
  proofImageUrl,
  deliveredAt: status === "DELIVERED" ? new Date() : null,
  otpExpiry,
},
  });
  await prisma.order.update({
    where: { id: delivery.orderId },
    data: { status },
  });

  return updated;
};

// Verify OTP → release payment
export const verifyOtp = async (user, deliveryId, otp) => {
  return await prisma.$transaction(async (tx) => {
    const delivery = await tx.delivery.findUnique({
      where: { id: deliveryId },
      include: { order: true },
    });

    if (!delivery) throw new Error("Delivery not found");

    const isValidOtp = await bcrypt.compare(otp, delivery.otp || "");

if (!isValidOtp) {
  throw new Error("Invalid OTP");
}

if (delivery.otpExpiry && new Date() > delivery.otpExpiry) {
  throw new Error("OTP expired");
}

    if (user.id !== delivery.order.buyerId) {
      throw new Error("Only buyer can verify");
    }

    if (delivery.status !== "DELIVERED") {
      throw new Error("Delivery not completed yet");
    }

    const payment = await tx.payment.findUnique({
      where: { orderId: delivery.orderId },
    });

    if (!payment || payment.status !== "SUCCESS") {
      throw new Error("Payment not completed");
    }

    if (payment.escrowStatus !== "HELD") {
      throw new Error("Escrow already processed");
    }

    // 🔥 RELEASE ESCROW (ONLY PLACE IN SYSTEM)
    await tx.payment.update({
      where: { orderId: delivery.orderId },
      data: { escrowStatus: "RELEASED" },
    });

    // clear OTP
    await tx.delivery.update({
      where: { id: deliveryId },
      data: { otp: null, otpExpiry: null },
    });

    // complete order
    await tx.order.update({
      where: { id: delivery.orderId },
      data: { status: "COMPLETED" },
    });

    return { message: "Delivery confirmed & payment released" };
  });
};

export const updateLocation = async (user, deliveryId, lat, lng, io) => {
  const delivery = await prisma.delivery.findUnique({
    where: { id: deliveryId },
  });
  if (user.id !== delivery.deliveryPartnerId) {
    throw new Error("Unauthorized to update location");
  }
  if (typeof lat !== "number" || typeof lng !== "number") {
    throw new Error("Invalid location data");
  }
  if (!delivery) throw new Error("Delivery not found");

  await prisma.delivery.update({
    where: { id: deliveryId },
    data: {
      pickupLat: lat,
      pickupLng: lng,
    },
  });

  io.to(deliveryId).emit("locationUpdate", {
    deliveryId,
    lat,
    lng,
  });

  return { message: "Location updated" };
};