import { z } from "zod";

export const createListingSchema = z.object({
  productName: z.string().min(2),
  description: z.string().optional(),
  pricePerUnit: z.number().positive(),
  unit: z.string().min(1),
  totalQuantity: z.number().positive(),
  latitude: z.number(),
  longitude: z.number(),
  negotiable: z.boolean().optional(),
});

export const updateListingSchema = z.object({
  productName: z.string().min(2).optional(),
  description: z.string().optional(),
  pricePerUnit: z.number().positive().optional(),
  unit: z.string().min(1).optional(),
  totalQuantity: z.number().positive().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  negotiable: z.boolean().optional(),
});