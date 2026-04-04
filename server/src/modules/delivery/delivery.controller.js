import * as service from "./delivery.service.js";

export const assign = async (req, res) => {
  try {
    const { deliveryPartnerId } = req.body;
    const result = await service.assignDelivery(
      req.user,
      req.params.orderId,
      deliveryPartnerId
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const result = await service.updateStatus(
      req.user,
      req.params.id,
      req.body.status,
      req.body.proofImageUrl
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const verify = async (req, res) => {
  try {
    const result = await service.verifyOtp(
      req.user,
      req.params.id,
      req.body.otp
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateLocation = async (req, res) => {
  try {
    const io = req.app.get("io");

    const result = await service.updateLocation(
      req.user,
      req.params.id,
      req.body.lat,
      req.body.lng,
      io
    );

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};