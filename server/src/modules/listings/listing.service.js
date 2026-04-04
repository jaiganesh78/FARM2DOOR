import prisma from "../../config/prisma.js";

export const createListing = async (userId, data) => {
  const {
    productName,
    description,
    pricePerUnit,
    unit,
    totalQuantity,
    latitude,
    longitude,
    negotiable,
  } = data;

  if (pricePerUnit <= 0) {
    throw new Error("Price must be greater than 0");
  }

  if (totalQuantity <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  const listing = await prisma.listing.create({
    data: {
      farmerId: userId,
      productName,
      description,
      pricePerUnit,
      unit,
      totalQuantity,
      availableQuantity: totalQuantity,
      latitude,
      longitude,
      negotiable,
    },
  });

  return listing;
};

export const getAllListings = async (query) => {
  const { search, minPrice, maxPrice, minQty } = query;

  const where = {};

  if (search) {
    where.productName = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (minPrice || maxPrice) {
    where.pricePerUnit = {};
    if (minPrice) where.pricePerUnit.gte = parseFloat(minPrice);
    if (maxPrice) where.pricePerUnit.lte = parseFloat(maxPrice);
  }

  if (minQty) {
    where.availableQuantity = {
      gte: parseFloat(minQty),
    };
  }

  const listings = await prisma.listing.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
  });

  return listings;
};

export const getListingById = async (id) => {
  const listing = await prisma.listing.findUnique({
    where: { id },
  });

  if (!listing) {
    throw new Error("Listing not found");
  }

  return listing;
};

export const updateListing = async (userId, id, data) => {
  const listing = await prisma.listing.findUnique({
    where: { id },
  });

  if (!listing) {
    throw new Error("Listing not found");
  }

  if (listing.farmerId !== userId) {
    throw new Error("Unauthorized");
  }

  return await prisma.listing.update({
    where: { id },
    data,
  });
};

export const deleteListing = async (userId, id) => {
  const listing = await prisma.listing.findUnique({
    where: { id },
  });

  if (!listing) {
    throw new Error("Listing not found");
  }

  if (listing.farmerId !== userId) {
    throw new Error("Unauthorized");
  }

  await prisma.listing.delete({
    where: { id },
  });

  return { message: "Listing deleted successfully" };
};