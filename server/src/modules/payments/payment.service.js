import prisma from "../../config/prisma.js";

// Buyer makes payment → money goes to escrow
export const makePayment = async (user, orderId) => {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new Error("Order not found");

    if (order.buyerId !== user.id) {
      throw new Error("Only buyer can pay");
    }

    const existingPayment = await tx.payment.findUnique({
      where: { orderId },
    });

    if (existingPayment) {
      if (existingPayment.status === "SUCCESS") {
        return existingPayment;
      }
      throw new Error("Payment already initiated");
    }

    const payment = await tx.payment.create({
      data: {
        orderId,
        amount: order.totalAmount,
        method: "SIMULATED",
        status: "SUCCESS",
        escrowStatus: "HELD",
      },
    });

    await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "SUCCESS",
        status: "CONFIRMED",
      },
    });

    return payment;
  });
};

// Buyer confirms delivery → release money
export const confirmDelivery = async () => {
  throw new Error("Disabled: Use OTP verification to complete delivery");
};

// Refund logic
export const refundPayment = async (orderId) => {
  const payment = await prisma.payment.findUnique({
    where: { orderId },
  });

  if (!payment) throw new Error("Payment not found");

  if (payment.escrowStatus !== "HELD") {
    throw new Error("Cannot refund");
  }

  await prisma.payment.update({
    where: { orderId },
    data: {
      escrowStatus: "REFUNDED",
      status: "REFUNDED",
    },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "CANCELLED",
    },
  });

  return { message: "Refund successful" };
};