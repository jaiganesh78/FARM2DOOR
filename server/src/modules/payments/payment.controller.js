import * as service from "./payment.service.js";

export const pay = async (req, res) => {
  try {
    const result = await service.makePayment(req.user, req.params.orderId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const confirm = async (req, res) => {
  try {
    const result = await service.confirmDelivery(
      req.user,
      req.params.orderId
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const refund = async (req, res) => {
  try {
    const result = await service.refundPayment(req.params.orderId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};