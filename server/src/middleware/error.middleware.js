import logger from "../utils/logger.js";
export const errorHandler = (err, req, res, next) => {
  logger.error({
  message: err.message,
  stack: err.stack,
  path: req.originalUrl,
  method: req.method,
});

  res.status(400).json({
    success: false,
    message: err.message || "Something went wrong",
  });
};