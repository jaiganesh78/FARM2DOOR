import express from "express";
import * as listingController from "./listing.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";
import {
  createListingSchema,
  updateListingSchema,
} from "./listing.validation.js";
const router = express.Router();

// Create listing (Farmer only)
router.post(
  "/",
  authenticate,
  authorize("FARMER"),
  (req, res, next) => {
    try {
      req.body = createListingSchema.parse(req.body);
      next();
    } catch (err) {
      return res.status(400).json({ error: err.errors });
    }
  },
  listingController.createListing
);

// Get all listings (Public)
router.get("/", listingController.getAllListings);

// Get single listing
router.get("/:id", listingController.getListingById);

// Update listing (Farmer only)
router.patch(
  "/:id",
  authenticate,
  authorize("FARMER"),
  (req, res, next) => {
    try {
      req.body = updateListingSchema.parse(req.body);
      next();
    } catch (err) {
      return res.status(400).json({ error: err.errors });
    }
  },
  listingController.updateListing
);

// Delete listing (Farmer only)
router.delete(
  "/:id",
  authenticate,
  authorize("FARMER"),
  listingController.deleteListing
);

export default router;