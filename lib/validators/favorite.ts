import { z } from "zod";

export const favoriteSchema = z.object({
  coinId: z.string(),
  chain: z.string().optional(),
  address: z.string().optional(),
});
