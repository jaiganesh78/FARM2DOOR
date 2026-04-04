import * as listingService from "./listing.service.js";

export const createListing = async (req, res) => {
  try {
    const listing = await listingService.createListing(
      req.user.id,
      req.body
    );

    res.json(listing);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllListings = async (req, res) => {
  try {
    const listings = await listingService.getAllListings(req.query);
    res.json(listings);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getListingById = async (req, res) => {
  try {
    const listing = await listingService.getListingById(req.params.id);
    res.json(listing);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const updateListing = async (req, res) => {
  try {
    const updated = await listingService.updateListing(
      req.user.id,
      req.params.id,
      req.body
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteListing = async (req, res) => {
  try {
    const result = await listingService.deleteListing(
      req.user.id,
      req.params.id
    );

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};